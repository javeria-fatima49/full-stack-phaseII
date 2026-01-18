"""
Simple test script to verify AsyncSession is working correctly.
Run this to test database connection before testing the chatbot.
"""

import asyncio
from app.database import get_session, engine
from app.models import Task
from sqlmodel import select


async def test_async_session():
    """Test that AsyncSession works correctly"""
    print("Testing AsyncSession...")

    try:
        # Test 1: Database connection
        print("\n1. Testing database connection...")
        async with engine.begin() as conn:
            result = await conn.execute(select(1))
            print("   ✓ Database connection successful")

        # Test 2: AsyncSession operations
        print("\n2. Testing AsyncSession operations...")
        async for session in get_session():
            # Try to query tasks
            query = select(Task).limit(1)
            result = await session.execute(query)
            tasks = result.scalars().all()
            print(f"   ✓ AsyncSession query successful (found {len(tasks)} tasks)")
            break

        print("\n✅ All tests passed! AsyncSession is working correctly.")
        print("   You can now test the chatbot.")
        return True

    except Exception as e:
        print(f"\n❌ Test failed with error:")
        print(f"   {type(e).__name__}: {str(e)}")
        print("\n   This is the same error the chatbot is experiencing.")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("AsyncSession Test Script")
    print("=" * 60)

    success = asyncio.run(test_async_session())

    if not success:
        print("\n⚠️  Backend has issues. Please check:")
        print("   1. All .pyc files are deleted")
        print("   2. Backend was completely restarted")
        print("   3. All imports are correct")
