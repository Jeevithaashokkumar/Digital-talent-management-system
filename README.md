Digital Talent Management System (DTMS)
A production-ready full-stack application built with Next.js (App Router), Node.js/Express, Prisma, and PostgreSQL.

This codebase fulfills the Sprint 1 and Sprint 2 requirements, including JWT Authentication, Role-based Routing, and Task Management.

Setup Instructions
Prerequisites
- Node.js (v18+ recommended)
- Docker (optional, for running PostgreSQL easily) OR a local PostgreSQL installation

1. Database Setup
If you have Docker installed, simply run the following in the root directory to spin up a PostgreSQL instance:
docker-compose up -d

2. Backend Setup
1. Navigate to the backend directory:
   cd backend
2. Install dependencies:
   npm install
3. Run Prisma Migrations to initialize the tables:
   npx prisma migrate dev --name init
4. Start the backend development server:
   npm run dev
   The backend will run on `http://localhost:5000`.

3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   cd frontend
2. Install dependencies (if not already installed):
   npm install
3. Start the Next.js development server:
   npm run dev
   The frontend will run on `http://localhost:3000`.

Testing the Application
1. Open `http://localhost:3000/register` and register a new "admin" user by selecting the admin role from the dropdown.
2. Register a second account as a regular "user".
3. Log in with the admin account, create a new task, and assign it to the user.
4. Log out (via the Navbar) and log in as the regular user. You will see your assigned task and can update its status.

Digital-talent-management-system
Digital Talent Management System is a full-stack web application for managing tasks, users, and team collaboration. It includes authentication, task tracking, dashboard analytics, and role-based access, built using Next.js, Node.js, Express, and PostgreSQL.
