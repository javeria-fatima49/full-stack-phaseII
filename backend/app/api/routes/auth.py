"""
Authentication routes for user registration, login, and logout.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import select
from datetime import datetime

from app.database import get_session
from app.models.user import User
from app.schemas.auth import (
    
    UserSignup,
    UserSignin,
    AuthResponse,
    UserResponse,
    MessageResponse
)
from app.core.auth import hash_password, verify_password, get_current_user
from sqlmodel.ext.asyncio.session import AsyncSession


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email and password. Returns JWT token and user information."
)
async def signup(
    user_data: UserSignup,
    response: Response,
    session: AsyncSession = Depends(get_session)
):
    """
    Register a new user.

    - **email**: Valid email address (must be unique)
    - **password**: Password (8-100 characters, will be hashed)
    - **name**: Optional display name

    Returns:
    - **token**: JWT access token
    - **user**: User information (without password)

    Raises:
    - **400**: Email already registered
    - **500**: Database error
    """
    try:
        # Check if email already exists
        statement = select(User).where(User.email == user_data.email)
        result = await session.exec(statement)
        existing_user = result.first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password
        password_hash = hash_password(user_data.password)

        # Create new user
        new_user = User(
            email=user_data.email,
            password_hash=password_hash,
            name=user_data.name,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        # For Better Auth compatibility, we'll set a session-like cookie
        # In a real Better Auth implementation, this would be handled by the library
        # For now, we'll simulate the Better Auth cookie format
        import secrets
        import time
        import json
        from jose import jwt

        # Create a session token similar to what Better Auth would create
        session_data = {
            "userId": str(new_user.id),
            "expiresAt": int(time.time()) + (30 * 24 * 60 * 60),  # 30 days
            "createdAt": int(time.time()),
        }

        # In a real implementation, Better Auth would handle JWT signing
        # For now, we'll use the configured secret
        from app.config import settings
        session_token = jwt.encode(session_data, settings.better_auth_secret, algorithm="HS256")

        # Set the Better Auth-style cookie
        # For cross-origin requests (Vercel → HuggingFace), we need:
        # - secure=True (required for SameSite=None)
        # - samesite="none" (allows cross-origin cookie sending)
        response.set_cookie(
            key="better-auth.session_token",
            value=session_token,
            httponly=True,
            secure=True,  # Required for SameSite=None and HTTPS
            samesite="none",  # Allows cross-origin requests
            max_age=30 * 24 * 60 * 60  # 30 days
        )

        # Return user info (no token in response for Better Auth compatibility)
        return AuthResponse(
            token=session_token,  # Still return for compatibility
            user=UserResponse.model_validate(new_user)
        )

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


@router.post(
    "/signin",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Login user",
    description="Authenticate user with email and password. Returns JWT token and user information."
)
async def signin(
    credentials: UserSignin,
    response: Response,
    session: AsyncSession = Depends(get_session)
):
    """
    Login user with email and password.

    - **email**: User's email address
    - **password**: User's password

    Returns:
    - **token**: JWT access token
    - **user**: User information (without password)

    Raises:
    - **401**: Invalid email or password
    - **500**: Database error
    """
    try:
        # Find user by email
        statement = select(User).where(User.email == credentials.email)
        result = await session.exec(statement)
        user = result.first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Update last login timestamp
        user.updated_at = datetime.utcnow()
        session.add(user)
        await session.commit()
        await session.refresh(user)

        # For Better Auth compatibility, we'll set a session-like cookie
        # In a real Better Auth implementation, this would be handled by the library
        # For now, we'll simulate the Better Auth cookie format
        import time
        from jose import jwt

        # Create a session token similar to what Better Auth would create
        session_data = {
            "userId": str(user.id),
            "expiresAt": int(time.time()) + (30 * 24 * 60 * 60),  # 30 days
            "createdAt": int(time.time()),
        }

        # In a real implementation, Better Auth would handle JWT signing
        # For now, we'll use the configured secret
        from app.config import settings
        session_token = jwt.encode(session_data, settings.better_auth_secret, algorithm="HS256")

        # Set the Better Auth-style cookie
        # For cross-origin requests (Vercel → HuggingFace), we need:
        # - secure=True (required for SameSite=None)
        # - samesite="none" (allows cross-origin cookie sending)
        response.set_cookie(
            key="better-auth.session_token",
            value=session_token,
            httponly=True,
            secure=True,  # Required for SameSite=None and HTTPS
            samesite="none",  # Allows cross-origin requests
            max_age=30 * 24 * 60 * 60  # 30 days
        )

        # Return user info (no token in response for Better Auth compatibility)
        return AuthResponse(
            token=session_token,  # Still return for compatibility
            user=UserResponse.model_validate(user)
        )

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to authenticate user"
        )


@router.post(
    "/signout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Logout user by clearing authentication cookie."
)
async def signout(
    response: Response,
    user_id: str = Depends(get_current_user)
):
    """
    Logout user by clearing authentication cookie.

    Requires valid JWT token in cookie or Authorization header.

    Returns:
    - **message**: Success message

    Raises:
    - **401**: Invalid or missing token
    """
    # Clear auth cookie
    # Use same settings as when setting the cookie for proper deletion
    response.delete_cookie(
        key="better-auth.session_token",
        httponly=True,
        secure=True,  # Must match the cookie settings
        samesite="none"  # Must match the cookie settings
    )

    return MessageResponse(message="Logged out successfully")


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user",
    description="Get information about the currently authenticated user."
)
async def get_me(
    user_id: str = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Get current authenticated user information.

    Requires valid JWT token in cookie or Authorization header.

    Returns:
    - User information (without password)

    Raises:
    - **401**: Invalid or missing token
    - **404**: User not found
    """
    try:
        # Find user by ID
        statement = select(User).where(User.id == user_id)
        result = await session.exec(statement)
        user = result.first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse.model_validate(user)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user information"
        )
