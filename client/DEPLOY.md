# Deployment Guide

## 1. GitHub Setup

1.  Initialize Git in your project folder:
    ```bash
    cd client
    git init
    git add .
    git commit -m "Initial commit"
    ```

2.  Create a new repository on GitHub (e.g., `habit-tracker`).

3.  Link and Push:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/habit-tracker.git
    git branch -M main
    git push -u origin main
    ```

## 2. Vercel Deployment

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **Project**.
3.  Import your `habit-tracker` repository.
4.  **Build Settings**:
    -   Framework Preset: `Vite` (should be auto-detected).
    -   Root Directory: `client` (if you uploaded the root folder, otherwise leave default).
5.  **Environment Variables**:
    Copy these from your local `.env`:
    -   `VITE_SUPABASE_URL`
    -   `VITE_SUPABASE_ANON_KEY`
6.  Click **Deploy**.

## 3. Verify
Once deployed, Vercel will give you a URL (e.g., `habit-tracker.vercel.app`). Open it, log in, and ensure your data loads from Supabase!
