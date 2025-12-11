# 🚀 Daily Habit Tracker (Hybrid Edition)

A premium, glassmorphism-styled habit tracker built with React, Node.js (Express), and Supabase.

## Architecture
-   **Frontend**: React (Vite)
-   **Backend**: Node.js + Express
-   **Database**: Supabase (Postgres)

## Getting Started

### 1. Backend (Server)
The server acts as an API proxy and handles logic.
```bash
cd server
npm install
node index.js
```
*Server runs on http://localhost:5000*

### 2. Frontend (Client)
The UI interacts with the Node.js backend.
```bash
cd client
npm install
npm run dev
```
*Client runs on http://localhost:5173*

## Features
-   **Authentication**: Secure Sign Up/Login (Supabase Auth).
-   **Gamification**: XP, Levels, Badges.
-   **Analytics**: Weekly Productivity Chart.
-   **Hybrid API**: Client talks to Express -> Express talks to Supabase.

## Environment Variables
Both `client` and `server` need a `.env` file with:
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```
