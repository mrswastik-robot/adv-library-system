# Advanced Library Management System

A backend system for managing a library's books, users, and borrowing activities built with Node.js, TypeScript, Express, and PostgreSQL.

## Features

- User Authentication and Authorization
- Book Management
- Borrowing System
- Fine Management
- Analytics
- Email Verification

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd library-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables in `.env` with your configuration

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
/src
  /controllers - Request handlers
  /models - Database models and types
  /routes - API routes
  /middlewares - Custom middleware functions
  /services - Business logic
/config - Configuration files
```

## API Documentation

(Documentation will be available via Swagger/OpenAPI) 