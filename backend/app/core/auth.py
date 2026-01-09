"""
Better Auth cookie-based authentication and verification logic.
"""

from datetime import datetime, timedelta
from fastapi import HTTPException, status, Request
from typing import Optional
import json
import base64
from jose import jwt, JWTError


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None):
    """
    Create a JWT access token.

    Args:
        user_id: User identifier to encode in the token
        expires_delta: Token expiration time (defaults to 15 minutes)

    Returns:
        str: Encoded JWT token
    """
    from app.config import settings

    to_encode = {"user_id": user_id}

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Default to 15 minutes if no expiration is provided
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.better_auth_secret, algorithm="HS256")
    return encoded_jwt


async def get_current_user(request: Request) -> str:
    """
    Extract and verify user ID from Better Auth session cookie.

    This dependency is used on all protected routes to:
    1. Extract session from Better Auth cookie
    2. Verify session validity using BETTER_AUTH_SECRET
    3. Extract user_id from session
    4. Return user_id for use in route handlers

    Better Auth stores session data in encrypted cookies named "better-auth.session_token"
    The cookie contains a JWT token that can be decoded with the BETTER_AUTH_SECRET.

    Raises:
        HTTPException: 401 if session cookie is missing, invalid, or expired

    Returns:
        str: Authenticated user_id from Better Auth session
    """
    from app.config import settings

    # Extract Better Auth session token from cookies
    session_token = request.cookies.get("better-auth.session_token")

    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized - No session token found"
        )

    try:
        # Decode the JWT token using the same secret as Better Auth
        # Better Auth uses HS256 algorithm with the BETTER_AUTH_SECRET
        payload = jwt.decode(
            session_token,
            settings.better_auth_secret,
            algorithms=["HS256"]
        )

        user_id: str = payload.get("userId") or payload.get("user_id") or payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized - No user ID in session"
            )

        return user_id

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized - Invalid session token"
        )


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        str: Bcrypt hashed password
    """
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Bcrypt hashed password

    Returns:
        bool: True if password matches, False otherwise
    """
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.verify(plain_password, hashed_password)
