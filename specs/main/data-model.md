# Data Model: Todo AI Chatbot

**Date**: 2026-01-16
**Feature**: Todo AI Chatbot - Phase 3
**Purpose**: Define database schema and entity relationships

---

## Overview

The Todo AI Chatbot requires three primary entities to support conversational task management:
1. **Task** - User's todo items (existing, verify compatibility)
2. **Conversation** - Chat sessions between user and assistant (new)
3. **Message** - Individual messages within conversations (new)

All entities enforce user isolation through `user_id` foreign key.

---

## Entity Definitions

### 1. Task (Existing - Verify Compatibility)

**Purpose**: Represents a todo item created by the user

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique task identifier |
| user_id | Integer | NOT NULL, FOREIGN KEY → User.id | Owner of the task |
| title | String(255) | NOT NULL | Task title/description |
| description | Text | NULLABLE | Optional detailed description |
| completed | Boolean | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | DateTime | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | DateTime | NOT NULL, DEFAULT NOW(), ON UPDATE NOW() | Last modification timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `idx_task_user_id` on `user_id`
- INDEX: `idx_task_user_completed` on `(user_id, completed)` for filtering

**Relationships**:
- BELONGS TO: User (via `user_id`)

**Validation Rules**:
- `title` must be 1-255 characters
- `user_id` must reference existing user
- `completed` must be boolean

**State Transitions**:
- Created → Pending (completed = false)
- Pending → Completed (completed = true)
- Completed → Pending (completed = false) [re-open]

**SQLModel Definition**:

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "task"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    title: str = Field(max_length=255)
    description: Optional[str] = None
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        indexes = [
            ("user_id", "completed")  # Composite index for filtering
        ]
```

---

### 2. Conversation (New)

**Purpose**: Represents a chat session between user and AI assistant

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique conversation identifier |
| user_id | Integer | NOT NULL, FOREIGN KEY → User.id | Owner of the conversation |
| created_at | DateTime | NOT NULL, DEFAULT NOW() | Conversation start timestamp |
| updated_at | DateTime | NOT NULL, DEFAULT NOW(), ON UPDATE NOW() | Last message timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `idx_conversation_user_id` on `user_id`
- INDEX: `idx_conversation_user_updated` on `(user_id, updated_at DESC)` for recent conversations

**Relationships**:
- BELONGS TO: User (via `user_id`)
- HAS MANY: Message (via `conversation_id`)

**Validation Rules**:
- `user_id` must reference existing user
- Cannot delete conversation with existing messages (cascade or prevent)

**SQLModel Definition**:

```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversation"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        indexes = [
            ("user_id", "updated_at")  # For fetching recent conversations
        ]
```

---

### 3. Message (New)

**Purpose**: Represents a single message in a conversation (user or assistant)

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique message identifier |
| user_id | Integer | NOT NULL, FOREIGN KEY → User.id | Owner of the conversation |
| conversation_id | Integer | NOT NULL, FOREIGN KEY → Conversation.id | Parent conversation |
| role | Enum('user', 'assistant') | NOT NULL | Message sender role |
| content | Text | NOT NULL | Message text content |
| created_at | DateTime | NOT NULL, DEFAULT NOW() | Message timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `idx_message_conversation` on `(conversation_id, created_at)` for chronological retrieval
- INDEX: `idx_message_user_conversation` on `(user_id, conversation_id, created_at)` for user isolation

**Relationships**:
- BELONGS TO: User (via `user_id`)
- BELONGS TO: Conversation (via `conversation_id`)

**Validation Rules**:
- `role` must be 'user' or 'assistant'
- `content` must be 1-10000 characters
- `user_id` must match conversation's `user_id` (enforce consistency)
- `conversation_id` must reference existing conversation

**SQLModel Definition**:

```python
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class Message(SQLModel, table=True):
    __tablename__ = "message"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    role: MessageRole = Field(sa_column=Column(Enum(MessageRole)))
    content: str = Field(max_length=10000)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        indexes = [
            ("conversation_id", "created_at"),  # Chronological retrieval
            ("user_id", "conversation_id", "created_at")  # User isolation
        ]
```

---

## Entity Relationships Diagram

```
User (existing)
  |
  +-- 1:N --> Task
  |
  +-- 1:N --> Conversation
                |
                +-- 1:N --> Message
```

**Relationship Details**:
- One User has many Tasks
- One User has many Conversations
- One Conversation has many Messages
- Messages store `user_id` for denormalized user isolation

---

## Database Migrations

### Migration 1: Add Conversation Table

```python
# alembic/versions/xxx_add_conversation_table.py

def upgrade():
    op.create_table(
        'conversation',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_conversation_user_id', 'conversation', ['user_id'])
    op.create_index('idx_conversation_user_updated', 'conversation', ['user_id', 'updated_at'])

def downgrade():
    op.drop_index('idx_conversation_user_updated', 'conversation')
    op.drop_index('idx_conversation_user_id', 'conversation')
    op.drop_table('conversation')
```

### Migration 2: Add Message Table

```python
# alembic/versions/xxx_add_message_table.py

def upgrade():
    op.create_table(
        'message',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.Enum('user', 'assistant', name='messagerole'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversation.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_message_conversation', 'message', ['conversation_id', 'created_at'])
    op.create_index('idx_message_user_conversation', 'message', ['user_id', 'conversation_id', 'created_at'])

def downgrade():
    op.drop_index('idx_message_user_conversation', 'message')
    op.drop_index('idx_message_conversation', 'message')
    op.drop_table('message')
    op.execute('DROP TYPE messagerole')
```

---

## Query Patterns

### 1. Create New Conversation

```python
async def create_conversation(user_id: int) -> Conversation:
    async with get_db_session() as session:
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)
        return conversation
```

### 2. Add Message to Conversation

```python
async def add_message(
    user_id: int,
    conversation_id: int,
    role: MessageRole,
    content: str
) -> Message:
    async with get_db_session() as session:
        # Verify conversation belongs to user
        conversation = await session.get(Conversation, conversation_id)
        if not conversation or conversation.user_id != user_id:
            raise ValueError("Conversation not found or access denied")

        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        session.add(message)

        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(message)
        return message
```

### 3. Fetch Conversation History

```python
async def get_conversation_history(
    user_id: int,
    conversation_id: int,
    limit: int = 50
) -> List[Message]:
    async with get_db_session() as session:
        query = (
            select(Message)
            .where(
                Message.user_id == user_id,
                Message.conversation_id == conversation_id
            )
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        result = await session.execute(query)
        messages = result.scalars().all()
        return list(reversed(messages))  # Chronological order
```

### 4. List User's Recent Conversations

```python
async def get_recent_conversations(
    user_id: int,
    limit: int = 10
) -> List[Conversation]:
    async with get_db_session() as session:
        query = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        )
        result = await session.execute(query)
        return result.scalars().all()
```

---

## Data Integrity Constraints

### User Isolation
- All queries MUST filter by `user_id` from JWT token
- Never trust `user_id` from URL or request body
- Verify conversation ownership before adding messages

### Referential Integrity
- CASCADE DELETE: When User deleted → delete Conversations → delete Messages
- CASCADE DELETE: When Conversation deleted → delete Messages
- PREVENT DELETE: Cannot delete User with active conversations (optional)

### Consistency Rules
- Message.user_id MUST equal Conversation.user_id
- Conversation.updated_at MUST be updated when new message added
- Task operations are independent of conversations

---

## Performance Considerations

### Indexes
- All foreign keys indexed for JOIN performance
- Composite indexes for common query patterns
- Conversation retrieval optimized with (user_id, updated_at)

### Query Optimization
- Limit conversation history to 50 messages (configurable)
- Use pagination for listing conversations
- Consider archiving old conversations (future enhancement)

### Scalability
- Stateless design allows horizontal scaling
- Database connection pooling for concurrent requests
- Consider read replicas for conversation history (future)

---

## Security Considerations

### User Isolation
- All database queries filtered by authenticated user_id
- No cross-user data access possible
- Conversation IDs are not guessable (auto-increment with user check)

### Data Validation
- Input sanitization for message content
- Length limits prevent abuse
- Role validation prevents impersonation

### Audit Trail
- All messages timestamped for audit
- Conversation history provides full interaction log
- Consider adding soft delete for compliance (future)

---

## Testing Strategy

### Unit Tests
- Model validation (field constraints, types)
- Relationship integrity (foreign keys)
- Query patterns (CRUD operations)

### Integration Tests
- Multi-user isolation verification
- Conversation flow (create → add messages → retrieve)
- Concurrent access handling

### Performance Tests
- Query performance with large conversation history
- Index effectiveness verification
- Connection pool stress testing

---

## Future Enhancements

1. **Conversation Metadata**: Add title, summary, tags
2. **Message Metadata**: Add tool_calls, tokens_used, latency
3. **Soft Delete**: Archive instead of hard delete
4. **Conversation Branching**: Support multiple conversation threads
5. **Message Reactions**: User feedback on assistant responses
6. **Search**: Full-text search across conversation history
