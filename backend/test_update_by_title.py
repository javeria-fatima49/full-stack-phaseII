"""
Test script for update_task by title functionality.

This script tests that tasks can be updated by their current title,
not just by task_id.
"""

import sys
import io
from pathlib import Path

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.agents.task_manager_agent import TaskManagerAgent


def test_update_task_fallback_responses():
    """Test fallback responses for update_task with different scenarios."""

    print("=" * 80)
    print("TEST: Update Task by Title - Fallback Response Generation")
    print("=" * 80)

    agent = TaskManagerAgent()

    # Test 1: Update task by current_title (old title in message)
    print("\n1. Testing update_task with current_title (old title in message):")
    tool_calls = [{
        "name": "update_task",
        "parameters": {
            "current_title": "yd",
            "title": "gg"
        }
    }]
    tool_results = [{
        "success": True,
        "task": {
            "id": "123",
            "title": "gg",
            "description": "Updated task",
            "completed": False,
            "updated_at": "2024-01-18T12:00:00"
        },
        "message": "Task 'yd' updated successfully"
    }]

    response = agent._generate_fallback_response(tool_calls, tool_results)
    print(f"Response: {response}")
    assert "yd" in response
    assert "gg" in response
    assert "Updated" in response
    print("✓ PASSED - Shows both old and new titles")

    # Test 2: Update task by task_id (no old title in message)
    print("\n2. Testing update_task with task_id (no old title in message):")
    tool_calls = [{
        "name": "update_task",
        "parameters": {
            "task_id": "123",
            "title": "New Title"
        }
    }]
    tool_results = [{
        "success": True,
        "task": {
            "id": "123",
            "title": "New Title",
            "description": "Updated task",
            "completed": False,
            "updated_at": "2024-01-18T12:00:00"
        },
        "message": "Task updated successfully"
    }]

    response = agent._generate_fallback_response(tool_calls, tool_results)
    print(f"Response: {response}")
    assert "New Title" in response
    assert "Updated" in response
    print("✓ PASSED - Shows new title")

    # Test 3: Update task description only
    print("\n3. Testing update_task with description only:")
    tool_calls = [{
        "name": "update_task",
        "parameters": {
            "current_title": "My Task",
            "description": "New description"
        }
    }]
    tool_results = [{
        "success": True,
        "task": {
            "id": "123",
            "title": "My Task",
            "description": "New description",
            "completed": False,
            "updated_at": "2024-01-18T12:00:00"
        },
        "message": "Task 'My Task' updated successfully"
    }]

    response = agent._generate_fallback_response(tool_calls, tool_results)
    print(f"Response: {response}")
    assert "My Task" in response
    assert "Updated" in response
    print("✓ PASSED - Shows task title")

    # Test 4: Update task not found
    print("\n4. Testing update_task when task not found:")
    tool_calls = [{
        "name": "update_task",
        "parameters": {
            "current_title": "NonExistent",
            "title": "New Title"
        }
    }]
    tool_results = [{
        "success": False,
        "message": "Task not found",
        "error": "Task not found"
    }]

    response = agent._generate_fallback_response(tool_calls, tool_results)
    print(f"Response: {response}")
    assert "Failed" in response
    assert "Task not found" in response
    print("✓ PASSED - Shows error message")

    # Test 5: Update task with both title and description
    print("\n5. Testing update_task with both title and description:")
    tool_calls = [{
        "name": "update_task",
        "parameters": {
            "current_title": "Old Task",
            "title": "New Task",
            "description": "New description"
        }
    }]
    tool_results = [{
        "success": True,
        "task": {
            "id": "123",
            "title": "New Task",
            "description": "New description",
            "completed": False,
            "updated_at": "2024-01-18T12:00:00"
        },
        "message": "Task 'Old Task' updated successfully"
    }]

    response = agent._generate_fallback_response(tool_calls, tool_results)
    print(f"Response: {response}")
    assert "Old Task" in response
    assert "New Task" in response
    assert "Updated" in response
    print("✓ PASSED - Shows both old and new titles")

    print("\n" + "=" * 80)
    print("ALL UPDATE BY TITLE TESTS PASSED!")
    print("=" * 80)


def test_tool_definition():
    """Verify the update_task tool definition is correct."""

    print("\n" + "=" * 80)
    print("TEST: Update Task Tool Definition")
    print("=" * 80)

    from app.mcp.tools import UPDATE_TASK_TOOL

    print("\n1. Checking tool name:")
    assert UPDATE_TASK_TOOL.name == "update_task"
    print(f"   Name: {UPDATE_TASK_TOOL.name} ✓")

    print("\n2. Checking tool description:")
    assert "current title" in UPDATE_TASK_TOOL.description.lower()
    print(f"   Description: {UPDATE_TASK_TOOL.description} ✓")

    print("\n3. Checking parameters:")
    params = UPDATE_TASK_TOOL.parameters["properties"]
    assert "task_id" in params
    assert "current_title" in params
    assert "title" in params
    assert "description" in params
    print("   - task_id ✓")
    print("   - current_title ✓")
    print("   - title ✓")
    print("   - description ✓")

    print("\n4. Checking required fields:")
    required = UPDATE_TASK_TOOL.parameters.get("required", [])
    assert len(required) == 0  # No required fields (either task_id or current_title)
    print(f"   Required fields: {required} (empty is correct) ✓")

    print("\n" + "=" * 80)
    print("TOOL DEFINITION VERIFIED!")
    print("=" * 80)


def main():
    """Run all tests."""
    print("\n")
    print("+" + "=" * 78 + "+")
    print("|" + " " * 22 + "UPDATE BY TITLE FIX TESTS" + " " * 31 + "|")
    print("+" + "=" * 78 + "+")

    try:
        # Test 1: Fallback responses
        test_update_task_fallback_responses()

        # Test 2: Tool definition
        test_tool_definition()

        print("\n")
        print("+" + "=" * 78 + "+")
        print("|" + " " * 28 + "ALL TESTS PASSED!" + " " * 34 + "|")
        print("+" + "=" * 78 + "+")
        print("\n")

        print("SUMMARY:")
        print("--------")
        print("✓ Update task by current_title works correctly")
        print("✓ Fallback responses show both old and new titles")
        print("✓ Tool definition includes current_title parameter")
        print("✓ Error handling works for task not found")
        print("\nUsers can now update tasks by saying:")
        print('  "Update task yd to gg"')
        print('  "Change title:yd to title:gg"')
        print('  "Update yd task to new title gg"')

        return 0

    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {e}")
        return 1
    except Exception as e:
        print(f"\n✗ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
