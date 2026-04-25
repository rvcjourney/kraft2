@echo off
start "Backend" cmd /k "cd backend && npm run dev"
start "Frontend" cmd /k "npm run dev"
