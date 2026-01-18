# Research: Todo AI Chatbot - Phase 3

**Date**: 2026-01-16
**Feature**: Todo AI Chatbot
**Purpose**: Resolve technical unknowns and document best practices for AI agent implementation

---

## 1. OpenAI Agents SDK + Cohere Integration

### Decision: Use OpenAI Agents SDK with Cohere as Model Provider

**Rationale**:
- OpenAI Agents SDK provides standardized agent framework with tool calling
- Cohere API offers strong natural language understanding capabilities
- SDK supports custom model providers through configuration

**Implementation Approach**:

```python
from openai import OpenAI
import cohere

# Configure OpenAI SDK to use Cohere endpoint
client = OpenAI(
    api_key=os.getenv("COHERE_API_KEY"),
    base_url="https://api.cohere.ai/v1"  # Cohere API endpoint
)

# Alternative: Use Cohere SDK directly with agent pattern
cohere_client = cohere.Client(api_key=os.getenv("COHERE_API_KEY"))
```

**Best Practices**:
1. **Error Handling**: Wrap all API calls in try-except blocks
2. **Rate Limiting**: Implement exponential backoff for rate limit errors
3. **Fallback Responses**: Provide generic responses when API fails
4. **Timeout Configuration**: Set reasonable timeouts (5-10 seconds)
5. **Logging**: Log all API requests/responses for debugging

**Error Handling Pattern**:

```python
try:
    response = cohere_client.chat(
        message=user_message,
        model="command-r-plus",
        temperature=0.7,
        max_tokens=500
    )
except cohere.CohereAPIError as e:
    logger.error(f"Cohere API error: {e}")
    return "I'm having trouble processing your request. Please try again."
except cohere.CohereConnectionError as e:
    logger.error(f"Connection error: {e}")
    return "I'm currently unavailable. Please try again in a moment."
```

**Alternatives Considered**:
- **Direct Cohere SDK**: More control but requires custom agent implementation
- **LangChain**: Too heavy for our use case, adds unnecessary complexity
- **Custom Agent Framework**: Reinventing the wheel, maintenance burden

---

## 2. MCP SDK Implementation

### Decision: Use Official MCP SDK for Tool Definitions

**Rationale**:
- Official SDK ensures compatibility with MCP protocol
- Provides type-safe tool definitions
- Simplifies tool registration and invocation

**Implementation Approach**:

```python
from mcp import Tool, ToolParameter, ToolResult

# Define MCP tool
add_task_tool = Tool(
    name="add_task",
    description="Create a new task for the user",
    parameters=[
        ToolParameter(
            name="user_id",
            type="integer",
            description="ID of the user creating the task",
            required=True
        ),
        ToolParameter(
            name="title",
            type="string",
            description="Title of the task",
            required=True
        ),
        ToolParameter(
            name="description",
            type="string",
            description="Optional description of the task",
            required=False
        )
    ]
)

# Tool handler (stateless function)
async def handle_add_task(user_id: int, title: str, description: str = None) -> ToolResult:
    """Stateless handler for add_task tool"""
    async with get_db_session() as session:
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            completed=False
        )
        session.add(task)
        await session.commit()
        await session.refresh(task)

        return ToolResult(
            success=True,
            data={
                "task_id": task.id,
                "status": "pending",
                "title": task.title
            }
        )
```

**Stateless Tool Design Patterns**:
1. **No Shared State**: Each tool invocation is independent
2. **Database Per Request**: Open/close DB connection within tool
3. **Pure Functions**: Input → Output, no side effects beyond DB
4. **Idempotency**: Same input produces same output (where possible)
5. **Error Isolation**: Tool failures don't affect other tools

**Tool Registration Pattern**:

```python
# Register all MCP tools
mcp_tools = {
    "add_task": (add_task_tool, handle_add_task),
    "list_tasks": (list_tasks_tool, handle_list_tasks),
    "complete_task": (complete_task_tool, handle_complete_task),
    "delete_task": (delete_task_tool, handle_delete_task),
    "update_task": (update_task_tool, handle_update_task)
}

# Tool invocation
async def invoke_tool(tool_name: str, parameters: dict) -> ToolResult:
    if tool_name not in mcp_tools:
        raise ValueError(f"Unknown tool: {tool_name}")

    tool_def, handler = mcp_tools[tool_name]
    return await handler(**parameters)
```

**Alternatives Considered**:
- **Custom Tool Protocol**: Reinventing MCP, no ecosystem benefits
- **Function Calling Only**: Less structured, harder to maintain
- **GraphQL Resolvers**: Overkill for simple tool operations

---

## 3. OpenAI ChatKit Integration

### Decision: Use OpenAI ChatKit for Frontend Conversational UI

**Rationale**:
- Pre-built conversational UI components
- Handles message rendering, input, and state management
- Integrates well with Next.js and React

**Implementation Approach**:

```typescript
// app/chat/page.tsx
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <ChatInterface />
    </div>
  );
}

// components/chat/ChatInterface.tsx
import { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { apiClient } from '@/lib/api-client';

export function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch conversation history on mount
  useEffect(() => {
    async function loadHistory() {
      const history = await apiClient.getConversationHistory();
      setMessages(history.messages);
      setConversationId(history.conversation_id);
    }
    loadHistory();
  }, []);

  async function handleSendMessage(message: string) {
    setLoading(true);

    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    try {
      const response = await apiClient.sendChatMessage({
        conversation_id: conversationId,
        message
      });

      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response
      }]);

      setConversationId(response.conversation_id);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <MessageList messages={messages} />
      <MessageInput onSend={handleSendMessage} disabled={loading} />
    </>
  );
}
```

**Best Practices**:
1. **Optimistic Updates**: Show user message immediately
2. **Loading States**: Disable input while processing
3. **Error Handling**: Show user-friendly error messages
4. **Auto-Scroll**: Scroll to bottom on new messages
5. **Persistence**: Load conversation history on mount

**Authentication Integration**:

```typescript
// lib/api-client.ts
import { getSession } from 'next-auth/react';

export const apiClient = {
  async sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/${session.user.id}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include JWT cookie
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }
};
```

**Alternatives Considered**:
- **Custom Chat UI**: More control but significant development time
- **React Chat Components**: Generic, not optimized for AI conversations
- **Vercel AI SDK**: Good alternative but ChatKit more specialized

---

## 4. Conversation Context Management

### Decision: Fetch Full Conversation History Per Request

**Rationale**:
- Stateless backend requires fetching context from database
- Full history provides best context for AI agents
- Efficient queries minimize latency

**Implementation Approach**:

```python
async def get_conversation_context(
    user_id: int,
    conversation_id: int,
    max_messages: int = 50
) -> List[Message]:
    """Fetch recent conversation history for context"""
    async with get_db_session() as session:
        query = (
            select(Message)
            .where(
                Message.user_id == user_id,
                Message.conversation_id == conversation_id
            )
            .order_by(Message.created_at.desc())
            .limit(max_messages)
        )
        result = await session.execute(query)
        messages = result.scalars().all()
        return list(reversed(messages))  # Chronological order

def format_context_for_agent(messages: List[Message]) -> str:
    """Format conversation history for agent prompt"""
    context_lines = []
    for msg in messages:
        role = "User" if msg.role == "user" else "Assistant"
        context_lines.append(f"{role}: {msg.content}")
    return "\n".join(context_lines)
```

**Context Window Management**:

```python
def manage_context_window(
    messages: List[Message],
    max_tokens: int = 2000
) -> List[Message]:
    """Truncate context to fit within token limit"""
    # Simple approach: keep most recent messages
    # Advanced: Use summarization for older messages

    total_tokens = 0
    kept_messages = []

    for msg in reversed(messages):
        msg_tokens = estimate_tokens(msg.content)
        if total_tokens + msg_tokens > max_tokens:
            break
        kept_messages.insert(0, msg)
        total_tokens += msg_tokens

    return kept_messages

def estimate_tokens(text: str) -> int:
    """Rough token estimation (4 chars ≈ 1 token)"""
    return len(text) // 4
```

**Database Query Optimization**:

```python
# Add index for efficient conversation retrieval
# In migration file:
op.create_index(
    'idx_message_conversation_created',
    'message',
    ['user_id', 'conversation_id', 'created_at']
)
```

**Alternatives Considered**:
- **Conversation Summarization**: Complex, adds latency
- **Fixed Context Window**: May lose important context
- **Sliding Window**: Good balance, implemented above

---

## 5. Natural Language Understanding Patterns

### Decision: Use Prompt Engineering with Intent Recognition

**Rationale**:
- Cohere models excel at instruction-following
- Structured prompts improve accuracy
- Intent-based routing simplifies tool selection

**Prompt Template for TaskManagerAgent**:

```python
TASK_MANAGER_PROMPT = """You are a helpful task management assistant. Your job is to understand user commands and perform task operations.

Available operations:
- CREATE: Add a new task (e.g., "Add buy groceries", "Create task to call mom")
- LIST: Show tasks (e.g., "Show my tasks", "What do I need to do?")
- COMPLETE: Mark task as done (e.g., "Complete task 3", "I finished buying groceries")
- UPDATE: Modify task (e.g., "Change task 2 to 'buy milk'", "Update task description")
- DELETE: Remove task (e.g., "Delete task 5", "Remove the groceries task")

Conversation history:
{conversation_history}

User message: {user_message}

Instructions:
1. Identify the user's intent (CREATE, LIST, COMPLETE, UPDATE, DELETE)
2. Extract relevant information (task title, task ID, description, etc.)
3. If information is missing or ambiguous, ask a clarifying question
4. Call the appropriate tool with extracted parameters
5. Respond in a friendly, conversational manner

Response format:
- Intent: [CREATE|LIST|COMPLETE|UPDATE|DELETE|CLARIFY]
- Parameters: {{extracted parameters}}
- Tool: [tool_name if applicable]
- Response: [friendly message to user]
"""
```

**Intent Recognition Pattern**:

```python
async def recognize_intent(user_message: str, context: str) -> Intent:
    """Recognize user intent from message"""
    prompt = TASK_MANAGER_PROMPT.format(
        conversation_history=context,
        user_message=user_message
    )

    response = await cohere_client.chat(
        message=prompt,
        model="command-r-plus",
        temperature=0.3  # Lower temp for more consistent intent recognition
    )

    # Parse structured response
    intent = parse_intent_from_response(response.text)
    return intent

class Intent:
    type: str  # CREATE, LIST, COMPLETE, UPDATE, DELETE, CLARIFY
    parameters: dict
    tool_name: str | None
    response_text: str
```

**Entity Extraction Pattern**:

```python
def extract_task_title(user_message: str) -> str:
    """Extract task title from natural language"""
    # Common patterns:
    # "Add [task]" → task
    # "Create task to [task]" → task
    # "Remind me to [task]" → task

    patterns = [
        r"add (.+)",
        r"create (?:a )?task (?:to )?(.+)",
        r"remind me to (.+)",
        r"i need to (.+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, user_message.lower())
        if match:
            return match.group(1).strip()

    # Fallback: use entire message
    return user_message
```

**Clarification Strategy**:

```python
def generate_clarification(intent: Intent) -> str:
    """Generate clarifying question when intent is ambiguous"""
    if intent.type == "CLARIFY":
        if "task_id" in intent.missing_params:
            return "Which task would you like to update? Please provide the task number."
        elif "title" in intent.missing_params:
            return "What would you like to name this task?"
        elif "ambiguous_reference" in intent.issues:
            return "I found multiple tasks matching that description. Could you be more specific?"

    return "I'm not sure I understood. Could you rephrase that?"
```

**Alternatives Considered**:
- **Fine-tuned Model**: Expensive, requires training data
- **Rule-based NLU**: Brittle, hard to maintain
- **Hybrid Approach**: Prompt engineering + rules (future enhancement)

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| AI Framework | OpenAI Agents SDK + Cohere | Standardized agent framework with strong NLU |
| MCP Tools | Official MCP SDK | Type-safe, protocol-compliant tool definitions |
| Frontend UI | OpenAI ChatKit | Pre-built conversational components |
| Context Management | Full history fetch with truncation | Stateless architecture requirement |
| NLU Approach | Prompt engineering with intent recognition | Best accuracy without fine-tuning |

---

## Implementation Priorities

1. **Phase 1**: Set up Cohere API client and basic agent structure
2. **Phase 2**: Implement MCP tools as stateless functions
3. **Phase 3**: Build TaskManagerAgent with intent recognition
4. **Phase 4**: Build ConversationAgent with context management
5. **Phase 5**: Integrate ChatKit frontend
6. **Phase 6**: Test and refine NLU accuracy

---

## Open Questions

1. **Context Window Size**: Start with 50 messages, adjust based on testing
2. **Token Limits**: Monitor Cohere API usage, implement caching if needed
3. **Conversation Summarization**: Defer to future enhancement
4. **Multi-turn Clarifications**: Implement basic version, enhance later

---

## References

- Cohere API Documentation: https://docs.cohere.com/
- OpenAI Agents SDK: https://github.com/openai/openai-agents-sdk
- MCP SDK: https://github.com/modelcontextprotocol/sdk
- OpenAI ChatKit: https://github.com/openai/chatkit
- SQLModel Documentation: https://sqlmodel.tiangolo.com/
