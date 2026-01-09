"""
Application configuration using Pydantic Settings.
Loads environment variables and validates configuration.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Uses Pydantic for validation and type safety.
    """

    # Required settings
    database_url: str
    better_auth_secret: str

    # Optional settings with defaults
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"
    log_level: str = "INFO"
    port: int = 8000
    host: str = "0.0.0.0"
    reload: bool = False
    workers: int = 1
    db_pool_size: int = 10
    db_max_overflow: int = 20
    cors_origins: Optional[str] = None

    class Config:
        # Use absolute path to ensure the .env file is found
        env_file = Path(__file__).parent.parent / ".env.local"
        env_file_encoding = "utf-8"
        case_sensitive = False  # Changed back to False to match standard env behavior

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins into list"""
        if self.cors_origins:
            return [origin.strip() for origin in self.cors_origins.split(",")]
        return [self.frontend_url]

    def validate_settings(self):
        """Validate critical settings on startup"""
        # Validate database URL
        if not self.database_url.startswith("postgresql"):
            raise ValueError("DATABASE_URL must be a PostgreSQL connection string")

        # Validate secret length
        if len(self.better_auth_secret) < 32:
            raise ValueError("BETTER_AUTH_SECRET must be at least 32 characters")

        # Validate environment
        if self.environment not in ["development", "staging", "production"]:
            raise ValueError(f"Invalid ENVIRONMENT: {self.environment}")

        # Production checks
        if self.environment == "production":
            if self.reload:
                raise ValueError("RELOAD must be false in production")
            if "localhost" in self.frontend_url:
                raise ValueError("FRONTEND_URL cannot be localhost in production")
            if "ssl=require" not in self.database_url.lower():
                raise ValueError("DATABASE_URL must include ssl=require in production")


# Create global settings instance
try:
    settings = Settings()
    settings.validate_settings()
except Exception as e:
    print(f"Configuration error: {e}")
    print("Make sure .env.local file exists in the backend directory with required variables:")
    print("- DATABASE_URL")
    print("- BETTER_AUTH_SECRET")
    raise
