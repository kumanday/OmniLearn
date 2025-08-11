# OmniLearn Backend

This is the backend API for the OmniLearn adaptive learning platform. It is built with FastAPI and provides RESTful endpoints for the frontend application.

## Features

- Knowledge tree generation
- Lesson content generation
- Practice questions generation
- Answer evaluation and feedback
- User progress tracking
- Adaptive learning functionality

## Setup

1. Install dependencies: `uv pip install -e .`
2. Run migrations: `alembic upgrade head`
3. Start the server: `uvicorn app.main:app --reload`