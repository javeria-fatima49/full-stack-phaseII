# Backend JWT Authentication Skill

## Purpose
Ensure secure authentication and strict user isolation across all backend endpoints.

## Overview
JWT tokens are used for authentication. Every protected endpoint must validate the token and ensure users can only access their own data.

## Key Patterns
- Use JWT middleware dependency
- Extract `user_id` and `email` from token
- Return `401` for invalid or missing tokens
- Return `403` for user mismatch

## Rules
- Never trust client-provided user_id
- JWT verification is mandatory for protected routes
- Tokens must be securely generated and expired
