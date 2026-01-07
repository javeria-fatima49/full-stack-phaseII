"""
FastAPI dependency injection functions.
"""

from fastapi import Depends
from sqlmodel import Session
from app.database import get_session
from app.core.auth import get_current_user


# Re-export dependencies for convenience
__all__ = ["get_session", "get_current_user"]
