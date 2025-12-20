@echo off
echo Starting HabbitX Application...

:: Start Server
start "HabbitX Server" cmd /k "cd server && npm run dev"

:: Start Client
start "HabbitX Client" cmd /k "cd client && npm run dev"

echo Application processes started.
echo Server running on http://localhost:5000 (usually)
echo Client running on http://localhost:5173 (usually)
