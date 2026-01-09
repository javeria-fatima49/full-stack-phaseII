# Backend API Routes Skill

## Purpose
Provide clear guidance for building FastAPI route handlers that follow project architecture, security, and consistency rules.

## Overview
All API routes MUST live under the `/api` prefix, use FastAPI dependency injection, enforce JWT-based user isolation, and delegate business logic to the service layer.

## Key Patterns
- Use `APIRouter` with `/api` prefix
- Protect routes using JWT dependency
- Validate `user_id` from path against JWT token
- Use Pydantic request and response models
- Delegate logic to service layer

## Rules
- Routes handle HTTP concerns only
- No business logic inside routes
- Always return consistent `{ success, data }` format
- Use appropriate HTTP status codes
