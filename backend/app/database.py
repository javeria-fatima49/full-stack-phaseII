"""
Database connection and session management.
Uses SQLModel with async PostgreSQL driver.
"""

from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from app.config import settings


# Create async database engine
engine = create_async_engine(
    settings.database_url,
    echo=(settings.log_level == "DEBUG"),
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_timeout=30,
    pool_recycle=3600,
    pool_pre_ping=True,
)


async def create_db_and_tables():
    """
    Create all database tables.
    Called on application startup.
    """
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session():
    """
    Dependency for getting database session.
    Yields session and ensures it's closed after use.
    """
    async with AsyncSession(engine) as session:
        yield session
