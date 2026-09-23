@echo off
color 0B
echo ========================================== 
echo          STARTING SAVIX AI PLATFORM      
echo ========================================== 
echo.
echo Starting Backend Server (Port 5000)...
start cmd /k "cd savitri-backend && npm start"
echo.
echo Starting Frontend Server (Port 3000)...
start cmd /k "cd savitri-frontend && npm run dev"
echo.
echo Servers are launching! You can minimize these windows.
echo Open http://localhost:3000 in your browser.
pause
