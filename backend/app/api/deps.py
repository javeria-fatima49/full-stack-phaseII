"""
FastAPI dependency injection functions.
"""

from fastapi import Depends
from app.database import get_session
from app.core.auth import get_current_user


async def get_current_user_id(user_id: str = Depends(get_current_user)) -> str:
    """
    Dependency that returns the current user ID from authentication.

    Args:
        user_id: User ID extracted from JWT token by get_current_user

    Returns:
        str: Authenticated user ID
    """
    return user_id


# Re-export dependencies for convenience
__all__ = ["get_session", "get_current_user", "get_current_user_id"]
