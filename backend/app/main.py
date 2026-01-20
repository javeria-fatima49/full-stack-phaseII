"""
FastAPI application entry point.
Configures CORS, error handlers, and routes.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text
import sys

from app.config import settings
from app.database import create_db_and_tables, engine
from app.api.routes import tasks, auth
from app.api import chat


# Create FastAPI application
app = FastAPI(
    title="Todo App API",
    version="1.0.0",
    description="Phase II Todo App Backend - FastAPI with JWT Authentication",
    debug=(settings.environment == "development")
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"] if settings.environment == "development" else ["Content-Type", "Authorization", "Set-Cookie", "Cookie"],
)


# Middleware to ensure HTTPS redirects in production
@app.middleware("http")
async def redirect_to_https(request: Request, call_next):
    """Ensure all redirects use HTTPS in production"""
    response = await call_next(request)

    # If it's a redirect response and we're in production
    if response.status_code in (301, 302, 303, 307, 308) and settings.environment == "production":
        location = response.headers.get("location", "")
        # If the redirect is to HTTP, change it to HTTPS
        if location.startswith("http://"):
            location = location.replace("http://", "https://", 1)
            response.headers["location"] = location

    return response


# Custom exception handler for HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with consistent format"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


# Custom exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with field-specific messages"""
    errors = {}
    for error in exc.errors():
        field = error["loc"][-1] if error["loc"] else "unknown"
        message = error["msg"]
        if field not in errors:
            errors[field] = []
        errors[field].append(message)
    return JSONResponse(
        status_code=400,
        content={"detail": errors}
    )


# Catch-all exception handler
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    # Log error (in production, use proper logging)
    print(f"Unhandled exception: {exc}", file=sys.stderr)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# Startup event
@app.on_event("startup")
async def startup_validation():
    """Validate configuration and create database tables on startup"""
    try:
        # Validate settings (already done in config.py, but explicit check)
        settings.validate_settings()

        # Create database tables
        await create_db_and_tables()

        # Test database connection
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))

        print(f"✓ Configuration validated")
        print(f"✓ Database connection successful")
        print(f"✓ Environment: {settings.environment}")
        print(f"✓ Frontend URL: {settings.frontend_url}")
        print(f"✓ CORS Origins: {settings.cors_origins_list}")

    except Exception as e:
        print(f"✗ Startup validation failed: {e}", file=sys.stderr)
        sys.exit(1)


# Health check endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "version": "1.0.0"
    }


@app.get("/health/db")
async def database_health_check():
    """Database connectivity check"""
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }


# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(chat.router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Todo App API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
