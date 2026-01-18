"""
Database initialization script for Phase 3 AI Chatbot.
Creates Conversation and Message tables in Neon PostgreSQL.
"""

import asyncio
from sqlmodel import SQLModel
from app.database import engine
from app.models import Conversation, Message, MessageRole


async def create_tables():
    """Create all database tables"""
    async with engine.begin() as conn:
        # Create tables for Conversation and Message models
        await conn.run_sync(SQLModel.metadata.create_all)
        print("Database tables created successfully")
        print("  - conversations")
        print("  - messages")


if __name__ == "__main__":
    print("Creating database tables for Phase 3 AI Chatbot...")
    asyncio.run(create_tables())
