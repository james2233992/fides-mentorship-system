# Mentorship Management System Backend

A comprehensive NestJS backend for managing mentorship sessions with real-time notifications, job queues, and caching.

## Features

- **JWT Authentication** with Passport.js
- **PostgreSQL Database** with Prisma ORM
- **Redis** for caching
- **WebSockets** for real-time notifications
- **BullMQ** for job queues and background tasks
- **Modular Architecture** with separate modules for auth, users, scheduling, and notifications

## Prerequisites

- Node.js 20+
- Docker and Docker Compose (for local development)
- PostgreSQL (if not using Docker)
- Redis (if not using Docker)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration.

## Development Setup with Docker

1. Start the Docker containers:
```bash
npm run docker:up
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- The NestJS application on port 3000

2. Run database migrations:
```bash
npm run prisma:migrate:dev
```

3. Seed the database (optional):
```bash
npm run prisma:seed
```

4. Access the application at `http://localhost:3000/api`

## Development Setup without Docker

1. Ensure PostgreSQL and Redis are running locally

2. Update `.env` with your local database credentials

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate:dev
```

5. Seed the database (optional):
```bash
npm run prisma:seed
```

6. Start the development server:
```bash
npm run start:dev
```

## Available Scripts

- `npm run start:dev` - Start in development mode with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start in production mode
- `npm run prisma:studio` - Open Prisma Studio for database management
- `npm run docker:logs` - View Docker container logs
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (requires auth)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Scheduling
- `POST /api/scheduling/sessions` - Create a new session
- `GET /api/scheduling/sessions` - Get user sessions
- `GET /api/scheduling/sessions/:id` - Get session details
- `PATCH /api/scheduling/sessions/:id` - Update session
- `DELETE /api/scheduling/sessions/:id` - Cancel session
- `POST /api/scheduling/availability` - Set availability
- `GET /api/scheduling/availability/:userId` - Get user availability

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## WebSocket Events

Connect to WebSocket at `ws://localhost:3000/notifications`

### Client Events
- `join-room` - Join a user-specific room
- `leave-room` - Leave a user-specific room

### Server Events
- `new-notification` - Receive real-time notifications

## Default Users (after seeding)

- **Admin**: admin@mentorship.com / admin123
- **Mentors**: 
  - john.mentor@mentorship.com / mentor123
  - sarah.mentor@mentorship.com / mentor123
- **Mentees**: 
  - alice.mentee@mentorship.com / mentee123
  - bob.mentee@mentorship.com / mentee123

## Project Structure

```
src/
├── auth/           # Authentication module
├── cache/          # Redis caching module
├── config/         # Configuration files
├── notifications/  # Notifications module
├── prisma/         # Prisma service
├── queues/         # BullMQ job queues
├── scheduling/     # Session scheduling module
├── users/          # Users module
└── websockets/     # WebSocket gateway
```

## Production Deployment

1. Build the Docker image:
```bash
docker build -t mentorship-backend .
```

2. Run migrations:
```bash
npm run prisma:migrate:deploy
```

3. Start the container with appropriate environment variables.

## License

This project is licensed under the UNLICENSED License.
