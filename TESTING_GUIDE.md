# Testing Guide - Phase II Todo App

This guide provides step-by-step instructions for testing the complete full-stack application locally.

## Prerequisites

- Docker and Docker Compose installed
- OR Node.js 18+, Python 3.11+, PostgreSQL 16+

---

## Quick Start with Docker Compose

### 1. Initial Setup

```bash
# Navigate to project directory
cd "C:\Users\dell\javeria project\phaseII"

# Copy environment template
cp .env.example .env

# Generate secure secret (32+ characters)
# On Windows PowerShell:
# -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
# On Linux/Mac:
# openssl rand -base64 32

# Edit .env and set BETTER_AUTH_SECRET
# Example: BETTER_AUTH_SECRET=abc123xyz789secure32charactersormore
```

### 2. Start All Services

```bash
# Build and start all services (frontend, backend, database)
docker compose up --build

# Wait for all services to be healthy (check logs)
# You should see:
# ✓ Database: "database system is ready to accept connections"
# ✓ Backend: "Application startup complete"
# ✓ Frontend: "Ready in X ms"
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **Backend Health**: http://localhost:8000/health

---

## Test Plan

### Phase 1: Backend API Testing

#### 1.1 Health Checks

```bash
# Test application health
curl http://localhost:8000/health

# Expected: {"status": "healthy", "environment": "development"}

# Test database connectivity
curl http://localhost:8000/health/db

# Expected: {"status": "healthy", "database": "connected"}
```

#### 1.2 User Registration

```bash
# Register first user
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123",
    "name": "Alice"
  }'

# Expected Response (201 Created):
# {
#   "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "user": {
#     "id": "uuid-here",
#     "email": "alice@example.com",
#     "name": "Alice",
#     "created_at": "2026-01-07T...",
#     "updated_at": "2026-01-07T..."
#   }
# }

# Save the token for next requests
TOKEN_ALICE="<paste-token-here>"

# Test duplicate email (should fail)
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "different123",
    "name": "Alice2"
  }'

# Expected: 400 Bad Request - "Email already registered"
```

#### 1.3 User Login

```bash
# Login with correct credentials
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'

# Expected: 200 OK with token and user data

# Login with wrong password (should fail)
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "wrongpassword"
  }'

# Expected: 401 Unauthorized - "Invalid credentials"
```

#### 1.4 Get Current User

```bash
# Get current user info
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: 200 OK with user data (no password)

# Test without token (should fail)
curl http://localhost:8000/api/auth/me

# Expected: 401 Unauthorized
```

#### 1.5 Task CRUD Operations

```bash
# Create first task
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'

# Expected: 201 Created with task data
# Save task ID: TASK_ID="<paste-id-here>"

# Create second task
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write report",
    "description": "Q4 financial report"
  }'

# List all tasks
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: 200 OK with array of 2 tasks

# Get single task
curl http://localhost:8000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: 200 OK with task data

# Update task
curl -X PUT http://localhost:8000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries (updated)",
    "description": "Milk, eggs, bread, cheese"
  }'

# Expected: 200 OK with updated task

# Toggle completion
curl -X PATCH http://localhost:8000/api/tasks/$TASK_ID/complete \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: 200 OK with completed=true

# Toggle again
curl -X PATCH http://localhost:8000/api/tasks/$TASK_ID/complete \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: 200 OK with completed=false

# Delete task
curl -X DELETE http://localhost:8000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: 204 No Content

# Verify deletion
curl http://localhost:8000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: 404 Not Found
```

#### 1.6 User Isolation Testing

```bash
# Register second user
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "password": "password456",
    "name": "Bob"
  }'

# Save Bob's token
TOKEN_BOB="<paste-token-here>"

# Bob creates a task
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN_BOB" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bob task",
    "description": "Only Bob should see this"
  }'

# Save Bob's task ID: BOB_TASK_ID="<paste-id-here>"

# Alice lists tasks (should NOT see Bob's task)
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: Only Alice's tasks (not Bob's)

# Alice tries to access Bob's task (should fail)
curl http://localhost:8000/api/tasks/$BOB_TASK_ID \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: 404 Not Found (not 403, to avoid revealing existence)

# Bob lists tasks (should see only his task)
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN_BOB"

# Expected: Only Bob's task
```

#### 1.7 Filtering and Sorting

```bash
# Create tasks with different statuses
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{"title": "Task 1", "description": "Pending task"}'

curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN_ALICE" \
  -H "Content-Type: application/json" \
  -d '{"title": "Task 2", "description": "Will be completed"}'

# Get the second task ID and mark it complete
TASK2_ID="<paste-id-here>"
curl -X PATCH http://localhost:8000/api/tasks/$TASK2_ID/complete \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Filter by status: all
curl "http://localhost:8000/api/tasks?status=all" \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: All tasks

# Filter by status: pending
curl "http://localhost:8000/api/tasks?status=pending" \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: Only pending tasks

# Filter by status: completed
curl "http://localhost:8000/api/tasks?status=completed" \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: Only completed tasks

# Sort by title ascending
curl "http://localhost:8000/api/tasks?sortField=title&sortOrder=asc" \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: Tasks sorted alphabetically

# Sort by created_at descending (default)
curl "http://localhost:8000/api/tasks?sortField=created_at&sortOrder=desc" \
  -H "Authorization: Bearer $TOKEN_ALICE"

# Expected: Newest tasks first
```

---

### Phase 2: Frontend Testing

#### 2.1 Authentication Flow

1. **Open Frontend**: http://localhost:3000
2. **Register New User**:
   - Click "Sign Up" or navigate to registration page
   - Enter email: `test@example.com`
   - Enter password: `password123`
   - Enter name: `Test User`
   - Click "Sign Up"
   - ✅ Should redirect to dashboard
   - ✅ Should see welcome message or user name

3. **Sign Out**:
   - Click "Sign Out" button
   - ✅ Should redirect to login page
   - ✅ Should clear authentication state

4. **Sign In**:
   - Enter email: `test@example.com`
   - Enter password: `password123`
   - Click "Sign In"
   - ✅ Should redirect to dashboard
   - ✅ Should see user's tasks

5. **Invalid Credentials**:
   - Try signing in with wrong password
   - ✅ Should show error message
   - ✅ Should not redirect

#### 2.2 Dashboard Testing

1. **Empty State**:
   - New user with no tasks
   - ✅ Should show "No tasks yet" message
   - ✅ Should show "Create Your First Task" button

2. **With Tasks**:
   - Create 5+ tasks
   - ✅ Dashboard shows statistics (Total, Completed, Pending)
   - ✅ Shows 5 most recent tasks
   - ✅ Shows "View All Tasks" link if more than 5 tasks

3. **Statistics Accuracy**:
   - Create 10 tasks
   - Mark 3 as complete
   - ✅ Total: 10
   - ✅ Completed: 3
   - ✅ Pending: 7

#### 2.3 Task List Testing

1. **Navigate to Task List**: Click "Tasks" in navigation
2. **View All Tasks**:
   - ✅ All tasks displayed in grid
   - ✅ Each task shows title, status, description, date

3. **Filter by Status**:
   - Select "Pending" filter
   - ✅ Only pending tasks shown
   - Select "Completed" filter
   - ✅ Only completed tasks shown
   - Select "All" filter
   - ✅ All tasks shown

4. **Sort Tasks**:
   - Sort by "Title" ascending
   - ✅ Tasks sorted alphabetically
   - Sort by "Created Date" descending
   - ✅ Newest tasks first
   - Sort by "Updated Date"
   - ✅ Recently updated tasks first

5. **Empty Filter State**:
   - Filter by "Completed" when no completed tasks
   - ✅ Shows "No tasks found" message
   - ✅ Shows "Clear Filters" button

#### 2.4 Create Task Testing

1. **Navigate to Create**: Click "Add Task" button
2. **Form Validation**:
   - Try submitting empty form
   - ✅ Shows "Title is required" error
   - Enter title with 201 characters
   - ✅ Shows "Title too long" error
   - Enter description with 1001 characters
   - ✅ Shows "Description too long" error

3. **Character Counter**:
   - Type in title field
   - ✅ Shows "X/200 characters"
   - Type in description field
   - ✅ Shows "X/1000 characters"

4. **Successful Creation**:
   - Enter valid title: "Test Task"
   - Enter description: "Test Description"
   - Click "Create Task"
   - ✅ Shows success toast notification
   - ✅ Redirects to task list
   - ✅ New task appears in list

5. **Cancel Button**:
   - Click "Cancel"
   - ✅ Returns to previous page
   - ✅ No task created

#### 2.5 Edit Task Testing

1. **Navigate to Edit**:
   - Click on a task card
   - Click "Edit" button
   - ✅ Form pre-populated with task data

2. **Update Task**:
   - Modify title
   - Modify description
   - Click "Update Task"
   - ✅ Shows success toast
   - ✅ Redirects to task list
   - ✅ Changes reflected in task list

3. **Cancel Edit**:
   - Click "Cancel"
   - ✅ Returns to task detail
   - ✅ No changes saved

#### 2.6 Task Detail Testing

1. **View Task Details**:
   - Click on a task card
   - ✅ Shows full task information
   - ✅ Shows title, description, status, dates
   - ✅ Shows action buttons (Edit, Delete, Toggle)

2. **Toggle Completion**:
   - Click "Mark Complete" button
   - ✅ Shows checkmark animation
   - ✅ Status updates to "Completed"
   - ✅ Button changes to "Mark Pending"
   - Click "Mark Pending"
   - ✅ Status updates to "Pending"

3. **Delete Task**:
   - Click "Delete" button
   - ✅ Shows confirmation dialog
   - Click "Cancel"
   - ✅ Dialog closes, task remains
   - Click "Delete" again
   - Click "Delete Task" in dialog
   - ✅ Shows success toast
   - ✅ Redirects to task list
   - ✅ Task removed from list

4. **404 Handling**:
   - Navigate to invalid task ID: `/tasks/invalid-uuid`
   - ✅ Shows "Task Not Found" error
   - ✅ Shows "Go to Task List" button

#### 2.7 Navigation Testing

1. **Desktop Navigation** (width > 768px):
   - ✅ Full navigation bar visible
   - ✅ All links visible (Dashboard, Tasks, Create Task)
   - ✅ Active link highlighted
   - ✅ Logo/brand visible

2. **Mobile Navigation** (width < 768px):
   - ✅ Hamburger menu button visible
   - Click hamburger
   - ✅ Menu slides out
   - ✅ All links visible in menu
   - Click outside menu
   - ✅ Menu closes
   - Press Escape key
   - ✅ Menu closes, focus returns to button

3. **Keyboard Navigation**:
   - Press Tab repeatedly
   - ✅ Focus moves through all interactive elements
   - ✅ Focus visible with outline/ring
   - Press Enter on focused link
   - ✅ Navigates to page
   - Open mobile menu, press Escape
   - ✅ Menu closes

#### 2.8 Responsive Design Testing

Test at these breakpoints:

1. **Mobile (320px - 767px)**:
   - ✅ Single column layout
   - ✅ Hamburger menu
   - ✅ Touch-friendly buttons (44x44px minimum)
   - ✅ Readable text (16px minimum)
   - ✅ No horizontal scroll

2. **Tablet (768px - 1023px)**:
   - ✅ Two column grid for tasks
   - ✅ Full navigation bar
   - ✅ Comfortable spacing

3. **Desktop (1024px+)**:
   - ✅ Three column grid for tasks
   - ✅ Full navigation bar
   - ✅ Optimal reading width
   - ✅ Proper use of whitespace

#### 2.9 Accessibility Testing

1. **Keyboard Navigation**:
   - Navigate entire app using only keyboard
   - ✅ All interactive elements reachable
   - ✅ Logical tab order
   - ✅ Focus visible at all times

2. **Screen Reader** (NVDA/JAWS/VoiceOver):
   - Navigate with screen reader
   - ✅ All elements properly announced
   - ✅ ARIA labels present
   - ✅ Form errors announced
   - ✅ Toast notifications announced

3. **Color Contrast**:
   - Use browser DevTools or axe DevTools
   - ✅ All text meets WCAG AA (4.5:1 for normal, 3:1 for large)
   - ✅ Interactive elements meet contrast requirements

4. **Zoom Testing**:
   - Zoom to 200%
   - ✅ All content still accessible
   - ✅ No text cutoff
   - ✅ No horizontal scroll

---

### Phase 3: User Isolation Testing

1. **Create Two Users**:
   - User A: `usera@example.com`
   - User B: `userb@example.com`

2. **User A Creates Tasks**:
   - Sign in as User A
   - Create 3 tasks
   - Note task IDs

3. **User B Creates Tasks**:
   - Sign out
   - Sign in as User B
   - Create 2 tasks
   - ✅ Should NOT see User A's tasks

4. **Verify Isolation**:
   - User B tries to access User A's task URL directly
   - ✅ Should show 404 (not 403)
   - User A lists tasks
   - ✅ Should see only their 3 tasks
   - User B lists tasks
   - ✅ Should see only their 2 tasks

---

## Performance Testing

### 1. Page Load Times

```bash
# Use Lighthouse in Chrome DevTools
# Target scores:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 90
# - SEO: > 90
```

### 2. API Response Times

```bash
# Test with multiple concurrent requests
# Target: < 200ms p95 latency

# Install Apache Bench (ab) or use similar tool
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/tasks

# Expected: 95% of requests < 200ms
```

---

## Troubleshooting

### Backend Issues

**Database connection failed**:
```bash
# Check database is running
docker compose ps database

# Check database logs
docker compose logs database

# Verify DATABASE_URL in .env
```

**Authentication errors**:
```bash
# Verify BETTER_AUTH_SECRET matches between frontend and backend
# Check backend logs
docker compose logs backend

# Test token generation
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Frontend Issues

**Can't connect to backend**:
```bash
# Verify backend is running
curl http://localhost:8000/health

# Check NEXT_PUBLIC_API_URL in frontend/.env.local
# Should be: http://localhost:8000/api

# Check browser console for CORS errors
```

**Authentication not working**:
```bash
# Check browser localStorage
# Open DevTools > Application > Local Storage
# Verify auth_token exists

# Check browser cookies
# Open DevTools > Application > Cookies
# Verify auth_token cookie exists (if using cookie auth)
```

---

## Test Results Checklist

- [ ] All health checks pass
- [ ] User registration works
- [ ] User login works
- [ ] JWT authentication works
- [ ] All CRUD operations work
- [ ] User isolation verified
- [ ] Filtering and sorting work
- [ ] Frontend authentication flow works
- [ ] Dashboard displays correctly
- [ ] Task list displays correctly
- [ ] Create/edit/delete tasks work
- [ ] Responsive design works on all breakpoints
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Performance targets met
- [ ] No console errors
- [ ] No network errors

---

## Next Steps

After all tests pass:
1. Review test results
2. Fix any identified issues
3. Re-test after fixes
4. Proceed to production deployment
5. Set up monitoring and logging

---

**Last Updated**: 2026-01-07
**Version**: 1.0.0
