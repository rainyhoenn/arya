@echo off
REM Simple Arya Dev Server Starter
REM This is a minimal version for users who prefer less automation

echo Starting Arya Development Server...

REM Navigate to script directory
cd /d "%~dp0"

REM Set execution policy and run commands
powershell -Command "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force; bun install; bun --bun run dev"

pause