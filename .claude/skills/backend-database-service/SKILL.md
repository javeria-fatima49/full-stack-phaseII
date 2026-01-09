# Backend Database & Service Layer Skill

## Purpose
Separate business logic from HTTP routes and ensure clean database access patterns.

## Overview
All database operations are handled inside a service layer using SQLModel and injected database sessions.

## Key Patterns
- Use `Depends(get_db)` for database sessions
- Services receive `db` and `user_id`
- Routes never query the database directly
- Handle transactions and rollbacks inside services

## Rules
- One service per domain (tasks, auth)
- No SQL queries inside route files
- Maintain strict user-level data isolation
