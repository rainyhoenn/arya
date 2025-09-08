@echo off
title Arya Development Server
color 0B
cls

REM =====================================================
REM Arya Development Server - Windows Startup Script
REM =====================================================

echo.
echo  █████  ██████  ██    ██  █████  
echo ██   ██ ██   ██  ██  ██  ██   ██ 
echo ███████ ██████    ████   ███████ 
echo ██   ██ ██   ██    ██    ██   ██ 
echo ██   ██ ██   ██    ██    ██   ██ 
echo.
echo =====================================================
echo Starting Development Server...
echo =====================================================
echo.

REM Check if PowerShell is available
powershell -Command "exit" >nul 2>&1
if errorlevel 1 (
    echo ERROR: PowerShell is not available on this system.
    echo Please install PowerShell or use Windows 10/11.
    pause
    exit /b 1
)

REM Execute the PowerShell script with bypass policy for this execution
powershell -ExecutionPolicy Bypass -File "%~dp0start-dev-server.ps1"

REM Keep the window open if there was an error
if errorlevel 1 (
    echo.
    echo =====================================================
    echo An error occurred. Check the messages above.
    echo =====================================================
    pause
)

REM If everything went well, the PowerShell script handles the rest
exit /b 0