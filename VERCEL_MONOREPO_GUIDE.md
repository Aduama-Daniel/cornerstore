# Vercel Monorepo Deployment Guide

## Recommended Setup

Keep this as one GitHub repo and create two separate Vercel projects from the same repository:

- `cornerstore-frontend` with Root Directory = `frontend`
- `cornerstore-backend` with Root Directory = `backend`

This gives you separate deployments without splitting the codebase.

## Why this works

Vercel supports monorepos. You can import the same GitHub repository multiple times and point each Vercel project at a different folder.

## Before you deploy

Make sure these files stay local only:

- `backend/.env`
- `frontend/.env.local`

Use these example files as templates instead:

- `backend/.env.example`
- `frontend/.env.local.example`

## Backend Vercel Project

### Root Directory

Set Root Directory to `backend`.

### Build settings

Use the detected Node.js project defaults unless Vercel asks for overrides.

### Required Environment Variables

Add these in the Vercel dashboard for the backend project:

- `NODE_ENV=production`
- `MONGODB_URI`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT`
- `ALLOWED_ORIGINS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `PAYSTACK_SECRET_KEY`
- `GEMINI_API_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`

### Notes

- `ALLOWED_ORIGINS` should be your frontend production URL, for example `https://cornerstore-frontend.vercel.app`
- `FIREBASE_SERVICE_ACCOUNT` should be the full JSON service account compressed into one line
- `ADMIN_PASSWORD_HASH` must be a SHA-256 hash, not the plain password

## Frontend Vercel Project

### Root Directory

Set Root Directory to `frontend`.

### Required Environment Variables

Add these in the Vercel dashboard for the frontend project:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`

### Notes

- `NEXT_PUBLIC_API_URL` should be your backend Vercel URL, for example `https://cornerstore-backend.vercel.app`
- `NEXT_PUBLIC_*` values are safe to expose to the browser by design, but you should still manage them in Vercel instead of committing local config files

## Suggested Deployment Order

1. Push this repo to GitHub.
2. Create the backend Vercel project first.
3. Add backend environment variables.
4. Deploy the backend and copy its production URL.
5. Create the frontend Vercel project from the same GitHub repo.
6. Set Root Directory to `frontend`.
7. Add frontend environment variables, including `NEXT_PUBLIC_API_URL` pointing to the backend URL.
8. Deploy the frontend.
9. Update backend `ALLOWED_ORIGINS` to the frontend production URL if needed.
10. Redeploy backend after that change.

## GitHub to Vercel Flow

### One repo, two projects

You will connect the same GitHub repository twice in Vercel:

- first as the backend project
- second as the frontend project

Each one gets its own:

- project name
- env vars
- deployment history
- domains
- settings

## What not to do

- Do not commit `backend/.env`
- Do not commit `frontend/.env.local`
- Do not store secret keys in code
- Do not point the frontend at `localhost` in production

## Optional custom domains

You can later assign domains like:

- frontend: `shop.yourdomain.com`
- backend: `api.yourdomain.com`

If you do that, update:

- frontend `NEXT_PUBLIC_API_URL`
- backend `ALLOWED_ORIGINS`
