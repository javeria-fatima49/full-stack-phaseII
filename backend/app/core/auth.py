"""
JWT authentication and verification logic.
"""

from fastapi import HTTPException, status, Request
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.config import settings
from typing import Optional


# JWT Configuration
SECRET_KEY = settings.better_auth_secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        str: Bcrypt hashed password
    """
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
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        user_id: User identifier to encode in token
        expires_delta: Optional custom expiration time

    Returns:
        str: Encoded JWT token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "user_id": user_id,
        "exp": expire,
        "iat": datetime.utcnow()
    }

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(request: Request) -> str:
    """
    Extract and verify JWT token from cookie OR Authorization header, return user_id.

    This dependency is used on all protected routes to:
    1. Extract JWT token from auth_token cookie OR Authorization: Bearer header
    2. Verify token signature using BETTER_AUTH_SECRET
    3. Extract user_id from token claims
    4. Return user_id for use in route handlers

    Supports dual authentication:
    - Cookie-based: auth_token cookie
    - Header-based: Authorization: Bearer <token>

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired

    Returns:
        str: Authenticated user_id from JWT claims
    """
    # Try to extract token from cookie first
    token = request.cookies.get("auth_token")

    # If no cookie, try Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )

    try:
        # Verify token signature and decode payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Extract user_id from claims
        user_id: str = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized"
            )

        # Check expiration (jose library does this automatically, but explicit check for clarity)
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized"
            )

        return user_id

    except JWTError:
        # Invalid signature, malformed token, or expired
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )
