# DTMS Deployment Guide

This document provides step-by-step instructions for deploying the Digital Talent Management System (DTMS) to production.

## Prerequisites
- A GitHub account.
- A [Vercel](https://vercel.com/) account (Frontend).
- A [Render](https://render.com/) or [Railway](https://railway.app/) account (Backend).
- A [Neon](https://neon.tech/) or [Supabase](https://supabase.com/) account (Database).

---

## 1. Database Setup (Neon.tech Recommended)
1. Create a new project on [Neon.tech](https://neon.tech/).
2. Copy the **Connection String** (Postgres URL).
3. Save this for the Backend environment variables.

---

## 2. Backend Deployment (Render.com)
1. Push your code to a GitHub repository.
2. Log in to [Render](https://render.com/) and click **New > Blueprint**.
3. Connect your DTMS repository.
4. Render will automatically detect the `backend/render.yaml` file.
5. In the Render Dashboard, configure the following **Environment Variables**:
   - `DATABASE_URL`: Your Neon connection string.
   - `JWT_SECRET`: A long random string (e.g., `openssl rand -base64 32`).
   - `FRONTEND_URL`: The URL of your Vercel deployment (you can update this after Step 3).
   - `EMAIL_USER`: Your Gmail address.
   - `EMAIL_PASS`: Your Gmail [App Password](https://support.google.com/accounts/answer/185833).

---

## 3. Frontend Deployment (Vercel)
1. Log in to [Vercel](https://vercel.com/) and click **New Project**.
2. Connect your DTMS repository.
3. Set the **Root Directory** to `frontend`.
4. Configure the following **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: The URL of your Render backend (e.g., `https://dtms-backend.onrender.com/api`).
5. Click **Deploy**.

---

## 4. Final Connection
1. Once Vercel provides your frontend URL (e.g., `https://dtms-frontend.vercel.app`), go back to your **Render Dashboard**.
2. Update the `FRONTEND_URL` environment variable in the Backend service to match your Vercel URL.
3. Redeploy the Backend to apply the changes.

---

## Production Security Notes
- **CORS:** The backend is now configured to only allow requests from `FRONTEND_URL`.
- **Secrets:** Never commit `.env` files to GitHub. Always use the hosting provider's "Environment Variables" section.
- **Database:** Ensure you run `npx prisma migrate deploy` in your CI/CD pipeline (handled automatically by the `render.yaml` provided).

---

## Troubleshooting
- **Socket.io Connection:** If sockets fail, ensure `NEXT_PUBLIC_API_URL` is set correctly and the Backend service has CORS configured for your frontend domain.
- **Database Migrations:** If the database doesn't sync, check the Render logs for prisma errors.
