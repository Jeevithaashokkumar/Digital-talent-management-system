Digital Talent Management System (DTMS)
A production-ready full-stack application built with Next.js (App Router), Node.js/Express, Prisma, and PostgreSQL.

This codebase fulfills including JWT Authentication, Role-based Routing, and Task Management.

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- Docker (for running PostgreSQL easily) OR a local PostgreSQL installation

### 1. Database Setup
If you have Docker installed, simply run the following in the root directory to spin up a PostgreSQL instance:
```bash
docker compose up -d
```
(If you are using a local installation of PostgreSQL, ensure your credentials and database name match the `DATABASE_URL` in the `backend/.env` file).

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Synchronize the database schema:
   ```bash
   npx prisma db push
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

> All database commands (e.g., `npx prisma studio`) MUST be executed from the `backend` directory to correctly resolve the environment configuration.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`.

## Testing the Application
1. Open `http://localhost:3000/register` and register a new "admin" user by selecting the admin role from the dropdown.
2. Register a second account as a regular "user".
3. Log in with the admin account, create a new task, and assign it to the user.
4. Log out (via the Navbar) and log in as the regular user. You will see your assigned task and can update its status.

## About the Project
Digital Talent Management System is a full-stack web application for managing tasks, users, and team collaboration. It includes authentication, task tracking, dashboard analytics, and role-based access, built using Next.js, Node.js, Express, and PostgreSQL.
