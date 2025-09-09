@echo off
REM Double-click this file to start ERP development server on Windows

REM Ensure working directory is project root
pushd "%~dp0"

echo ERP - Setting up and starting the development server...
echo.

REM Check if Bun is installed
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Bun is not installed or not in PATH.
    echo Please install Bun from https://bun.sh/
    echo Or run: powershell -c "irm bun.sh/install.ps1 | iex"
    echo.
    echo Press any key to exit...
    pause > nul
    goto :end
)

REM Check if node_modules exists and if it's properly configured
if not exist "node_modules" (
    set NEEDS_SETUP=1
) else (
    REM Check if core dependencies exist
    if not exist "node_modules\next" (
        echo Detected incomplete installation, running setup...
        set NEEDS_SETUP=1
    ) else (
        set NEEDS_SETUP=0
    )
)

if "%NEEDS_SETUP%"=="1" (
    echo First time setup detected. Running initial setup...
    echo.
    
    REM Set PowerShell execution policy for current user
    echo Setting PowerShell execution policy...
    powershell -Command "& {Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force}"
    
    if %errorlevel% neq 0 (
        echo Warning: Failed to set PowerShell execution policy automatically.
        echo You may need to run this manually in PowerShell as Administrator:
        echo Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
        echo.
    ) else (
        echo PowerShell execution policy set successfully.
    )
    
    echo.
    echo Installing dependencies...
    bun install
    
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies.
        echo Please check your internet connection and try again.
        echo.
        echo Press any key to exit...
        pause > nul
        goto :end
    )
    
    echo.
    echo Ensuring Windows compatibility...
    REM Clear any Bun caches that might cause issues on Windows
    echo Clearing Bun cache...
    bun pm cache rm 2>nul
    if %errorlevel% neq 0 (
        echo Cache clear had issues, but continuing...
    ) else (
        echo Cache cleared successfully
    )
    
    REM Reinstall to fix any Windows-specific module resolution issues
    echo Reinstalling dependencies for Windows compatibility...
    bun install --force
    
    if %errorlevel% neq 0 (
        echo Warning: Force reinstall had issues, but continuing...
    )
    
    REM Create a quick verification that key modules are accessible
    echo Verifying installation...
    if exist "node_modules\next" (
        echo ✅ Next.js found
    ) else (
        echo ❌ Next.js missing - this may cause server startup issues
    )
    
    if exist "node_modules\react" (
        echo ✅ React found
    ) else (
        echo ❌ React missing - this may cause build issues
    )
    
    if exist "node_modules\@tanstack" (
        echo ✅ TanStack Table found
    ) else (
        echo ❌ TanStack Table missing - this may cause UI issues
    )
    
    echo.
    echo Setup completed successfully!
    echo.
)

echo Starting ERP development server...
echo.
echo The application will be available at:
echo Local: http://localhost:3000
echo.
echo To stop the server, close this window or press Ctrl+C
echo.

echo Starting ERP development server...
echo.
echo The application will be available at:
echo Local: http://localhost:3000
echo.
echo 🌐 Opening browser in 3 seconds...
echo To stop the server, press Ctrl+C
echo.

REM Open browser after a short delay (in background)
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

REM Start development server directly in this window
echo ================================================================
echo                    ERP DEVELOPMENT SERVER
echo ================================================================
echo.
bun --bun run dev

:end
popd