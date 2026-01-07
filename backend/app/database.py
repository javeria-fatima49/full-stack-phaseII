"""
Database connection and session management.
Uses SQLModel with async PostgreSQL driver.
"""

from sqlmodel import SQLModel, create_engine, Session
from app.config import settings


# Create database engine
engine = create_engine(
    settings.database_url,
    echo=(settings.log_level == "DEBUG"),
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_timeout=30,
    pool_recycle=3600,
    pool_pre_ping=True,
)


def create_db_and_tables():
    """
    Create all database tables.
    Called on application startup.
    """
    SQLModel.metadata.create_all(engine)


def get_session():
    """
    Dependency for getting database session.
    Yields session and ensures it's closed after use.
    """
    with Session(engine) as session:
        yield session
