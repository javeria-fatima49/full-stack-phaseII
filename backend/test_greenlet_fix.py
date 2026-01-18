"""
Test script to verify greenlet_spawn fix.

This script tests the chat endpoint with task-related messages to ensure
the greenlet_spawn error is resolved.
"""

import asyncio
import sys
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

# Add parent directory to path
sys.path.insert(0, ".")

from app.database import engine
from app.agents import ConversationAgent
from app.models import User, Conversation, Message, Task


async def test_chat_flow():
    """Test the complete chat flow with task creation."""
    print("=" * 60)
    print("Testing Greenlet Fix - Chat Flow with Task Creation")
    print("=" * 60)

    # Create a test user ID (assuming user exists in database)
    test_user_id = "test-user-123"

    async with AsyncSession(engine) as session:
        print("\n1. Creating ConversationAgent...")
        agent = ConversationAgent()
        print("   ✓ ConversationAgent created")

        print("\n2. Testing task creation message: 'add milk in my list'")
        try:
            result = await agent.process_chat_message(
                user_id=test_user_id,
                user_message="add milk in my list",
                conversation_id=None,
                session=session
            )

            if result.get("success"):
                print("   ✓ Message processed successfully!")
                print(f"   Conversation ID: {result.get('conversation_id')}")
                print(f"   Response: {result.get('response')}")
                print(f"   Tool calls: {len(result.get('tool_calls', []))}")

                # Check if task was created
                query = select(Task).where(Task.user_id == test_user_id)
                task_result = await session.execute(query)
                tasks = task_result.scalars().all()
                print(f"\n   Tasks in database: {len(tasks)}")
                for task in tasks:
                    print(f"   - {task.title} (completed: {task.completed})")

                return True
            else:
                print(f"   ✗ Message processing failed: {result.get('error')}")
                return False

        except Exception as e:
            print(f"   ✗ Exception occurred: {str(e)}")
            print(f"   Exception type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return False


async def test_list_tasks():
    """Test listing tasks."""
    print("\n" + "=" * 60)
    print("Testing Task Listing")
    print("=" * 60)

    test_user_id = "test-user-123"

    async with AsyncSession(engine) as session:
        agent = ConversationAgent()

        print("\n3. Testing task listing message: 'show my tasks'")
        try:
            result = await agent.process_chat_message(
                user_id=test_user_id,
                user_message="show my tasks",
                conversation_id=None,
                session=session
            )

            if result.get("success"):
                print("   ✓ Message processed successfully!")
                print(f"   Response: {result.get('response')}")
                return True
            else:
                print(f"   ✗ Message processing failed: {result.get('error')}")
                return False

        except Exception as e:
            print(f"   ✗ Exception occurred: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


async def cleanup_test_data():
    """Clean up test data."""
    print("\n" + "=" * 60)
    print("Cleaning Up Test Data")
    print("=" * 60)

    test_user_id = "test-user-123"

    async with AsyncSession(engine) as session:
        # Delete test tasks
        query = select(Task).where(Task.user_id == test_user_id)
        result = await session.execute(query)
        tasks = result.scalars().all()

        task_count = len(tasks)
        for task in tasks:
            await session.delete(task)

        # Flush task deletions
        await session.flush()

        # Delete test messages first (before conversations due to foreign key)
        query = select(Conversation).where(Conversation.user_id == test_user_id)
        result = await session.execute(query)
        conversations = result.scalars().all()

        conv_count = len(conversations)
        msg_count = 0

        for conv in conversations:
            # Delete messages first
            msg_query = select(Message).where(Message.conversation_id == conv.id)
            msg_result = await session.execute(msg_query)
            messages = msg_result.scalars().all()
            msg_count += len(messages)

            for msg in messages:
                await session.delete(msg)

        # Flush message deletions before deleting conversations
        await session.flush()

        # Now delete conversations
        for conv in conversations:
            await session.delete(conv)

        # Final commit
        await session.commit()
        print(f"   ✓ Cleaned up {task_count} tasks, {msg_count} messages, and {conv_count} conversations")


async def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("GREENLET FIX VERIFICATION TEST SUITE")
    print("=" * 60)

    # Clean up any existing test data
    await cleanup_test_data()

    # Run tests
    test1_passed = await test_chat_flow()
    test2_passed = await test_list_tasks()

    # Clean up after tests
    await cleanup_test_data()

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Task Creation Test: {'✓ PASSED' if test1_passed else '✗ FAILED'}")
    print(f"Task Listing Test: {'✓ PASSED' if test2_passed else '✗ FAILED'}")

    if test1_passed and test2_passed:
        print("\n✓ ALL TESTS PASSED - Greenlet fix is working!")
        return 0
    else:
        print("\n✗ SOME TESTS FAILED - Greenlet issue may still exist")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
