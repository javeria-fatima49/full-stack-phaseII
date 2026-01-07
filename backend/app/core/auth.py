"""
JWT authentication and verification logic.
"""

from fastapi import HTTPException, status, Request
from jose import JWTError, jwt
from datetime import datetime
from app.config import settings


# JWT Configuration
SECRET_KEY = settings.better_auth_secret
ALGORITHM = "HS256"


async def get_current_user(request: Request) -> str:
    """
    Extract and verify JWT token from cookie, return user_id.

    This dependency is used on all protected routes to:
    1. Extract JWT token from auth_token cookie
    2. Verify token signature using BETTER_AUTH_SECRET
    3. Extract user_id from token claims
    4. Return user_id for use in route handlers

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired

    Returns:
        str: Authenticated user_id from JWT claims
    """
    # Extract token from cookie
    token = request.cookies.get("auth_token")

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
