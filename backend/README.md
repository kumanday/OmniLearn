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

## Variables de entorno (.env)

```
GOOGLE_CLIENT_ID=
JWT_SECRET=supersecreto
FRONTEND_ORIGIN=http://localhost:3000
COOKIE_DOMAIN=localhost
SECURE_COOKIES=false
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=omnilearn
```

## Endpoints de autenticación

- POST `/api/v1/auth/google` → Body `{ id_token }`, valida con Google y setea cookie HttpOnly
- GET `/api/v1/auth/me` → Devuelve usuario autenticado leyendo cookie
- POST `/api/v1/auth/logout` → Elimina cookie