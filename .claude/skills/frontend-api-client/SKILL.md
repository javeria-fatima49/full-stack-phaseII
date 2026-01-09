# Frontend API Client Skill

## Purpose
Standardize frontend communication with backend APIs and manage loading, error, and success states.

## Overview
Frontend communicates with backend through a centralized API client with proper error handling and authentication headers.

## Key Patterns
- Centralized API client (fetch or axios)
- Handle loading, error, and success states
- Use environment-based API URLs
- Attach JWT token automatically to requests

## Rules
- UI components must not call APIs directly
- Always handle API failures gracefully
- Display user-friendly error messages
