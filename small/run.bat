@echo off
title AgroMind AI Startup
echo ==================================================
echo Starting AgroMind AI Precision Agriculture System
echo ==================================================

echo.
echo [1/2] Starting Express API Server in a new window...
start cmd /k "title AgroMind Backend && cd backend && npm run start"

echo.
echo [2/2] Starting Next.js Frontend Server in a new window...
start cmd /k "title AgroMind Frontend && cd /d "%~dp0frontend" && npm run dev"

echo.
echo Waiting 5 seconds for servers to start...
timeout /t 5 /nobreak >nul

echo.
echo Opening default web browser to AgroMind AI...
start http://localhost:3000

echo.
echo ==================================================
echo AgroMind AI is online:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo ==================================================
echo.
echo Startup completed. Enjoy smart farming!
pause
