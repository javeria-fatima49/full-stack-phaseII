"""
Test script for Phase 3 AI Chatbot endpoint.

This script tests the chat endpoint with various natural language commands.
Run this after starting the backend server.
"""

import asyncio
import httpx
import json
from uuid import uuid4


# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_USER_ID = "test-user-123"


async def test_chat_endpoint():
    """Test the chat endpoint with various commands"""

    print("=" * 60)
    print("Phase 3 AI Chatbot - Chat Endpoint Test")
    print("=" * 60)
    print()

    # Test commands
    test_commands = [
        "Add buy groceries to my list",
        "Show me my tasks",
        "Add call mom tomorrow",
        "List all my tasks",
        "Complete task 1",
        "Update task 2 to 'buy milk and eggs'",
        "Delete the groceries task",
        "What are my pending tasks?",
    ]

    conversation_id = None

    async with httpx.AsyncClient() as client:
        for i, command in enumerate(test_commands, 1):
            print(f"\n[Test {i}] User: {command}")
            print("-" * 60)

            try:
                # Prepare request
                request_data = {
                    "message": command
                }

                if conversation_id:
                    request_data["conversation_id"] = conversation_id

                # Send request
                response = await client.post(
                    f"{API_BASE_URL}/api/{TEST_USER_ID}/chat",
                    json=request_data,
                    headers={
                        "Content-Type": "application/json",
                        # Note: In production, include JWT token in Authorization header
                        # "Authorization": f"Bearer {token}"
                    },
                    timeout=30.0
                )

                # Parse response
                if response.status_code == 200:
                    data = response.json()

                    # Update conversation ID
                    if not conversation_id and data.get("conversation_id"):
                        conversation_id = data["conversation_id"]
                        print(f"[Conversation ID: {conversation_id}]")

                    # Display response
                    print(f"✓ Assistant: {data.get('response', 'No response')}")

                    # Display tool calls if any
                    if data.get("tool_calls"):
                        print(f"\n[Tool Calls: {len(data['tool_calls'])}]")
                        for tool_call in data["tool_calls"]:
                            print(f"  - {tool_call['tool']}: {tool_call.get('result', {}).get('message', 'N/A')}")
                else:
                    print(f"✗ Error: HTTP {response.status_code}")
                    print(f"  {response.text}")

            except Exception as e:
                print(f"✗ Exception: {str(e)}")

            # Wait between requests
            await asyncio.sleep(1)

    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)


async def test_health_check():
    """Test health check endpoints"""
    print("\n[Health Check]")
    print("-" * 60)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/health")
            if response.status_code == 200:
                print(f"✓ API Health: {response.json()}")
            else:
                print(f"✗ API Health Check Failed: {response.status_code}")
        except Exception as e:
            print(f"✗ Cannot connect to API: {str(e)}")
            print(f"  Make sure the backend server is running at {API_BASE_URL}")
            return False

    return True


async def main():
    """Main test function"""
    # Check if server is running
    if not await test_health_check():
        print("\n⚠️  Backend server is not running!")
        print("   Start the server with: uvicorn app.main:app --reload")
        return

    # Run chat endpoint tests
    await test_chat_endpoint()


if __name__ == "__main__":
    print("\n🤖 Starting Phase 3 AI Chatbot Tests...\n")
    asyncio.run(main())
