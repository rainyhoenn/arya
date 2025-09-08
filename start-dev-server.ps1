# Arya Development Server Startup Script
# This script sets up and starts the development environment automatically

Write-Host "🚀 Starting Arya Development Server..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Set PowerShell execution policy if needed
try {
    Write-Host "📝 Configuring PowerShell execution policy..." -ForegroundColor Yellow
    
    # Get current execution policy
    $currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
    Write-Host "   Current execution policy: $currentPolicy" -ForegroundColor Gray
    
    if ($currentPolicy -eq "Restricted" -or $currentPolicy -eq "AllSigned") {
        Write-Host "   Setting execution policy to RemoteSigned..." -ForegroundColor Yellow
        Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
        Write-Host "   ✅ Execution policy updated successfully!" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Execution policy is already configured!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Could not set execution policy: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   You may need to run this as administrator or set it manually." -ForegroundColor Red
}

# Navigate to the project directory (script's directory)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "📁 Navigating to project directory: $scriptDir" -ForegroundColor Yellow
Set-Location $scriptDir

# Check if bun is installed
Write-Host "🔍 Checking for Bun installation..." -ForegroundColor Yellow
try {
    $bunVersion = & bun --version 2>$null
    if ($bunVersion) {
        Write-Host "   ✅ Bun is installed (version: $bunVersion)" -ForegroundColor Green
    } else {
        throw "Bun not found"
    }
} catch {
    Write-Host "   ❌ Bun is not installed!" -ForegroundColor Red
    Write-Host "   Please install Bun from: https://bun.sh/" -ForegroundColor Red
    Write-Host "   Or run: powershell -c `"irm bun.sh/install.ps1 | iex`"" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if package.json exists
if (!(Test-Path "package.json")) {
    Write-Host "   ❌ package.json not found!" -ForegroundColor Red
    Write-Host "   Make sure you're running this script from the project root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    & bun install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        throw "bun install failed"
    }
} catch {
    Write-Host "   ❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Start the development server
Write-Host "🎯 Starting development server..." -ForegroundColor Yellow
Write-Host "   This will open your browser automatically when ready!" -ForegroundColor Gray
Write-Host ""

# Start the dev server in background and capture the process
$devServerJob = Start-Job -ScriptBlock {
    param($projectPath)
    Set-Location $projectPath
    & bun --bun run dev
} -ArgumentList $scriptDir

# Wait a moment for the server to start
Write-Host "⏳ Waiting for development server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if the server is running and open browser
$serverStarted = $false
$maxAttempts = 10
$attempt = 0

while (-not $serverStarted -and $attempt -lt $maxAttempts) {
    try {
        $attempt++
        Write-Host "   Checking server status (attempt $attempt/$maxAttempts)..." -ForegroundColor Gray
        
        # Try to connect to localhost:3000
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $serverStarted = $true
            Write-Host "   ✅ Development server is running!" -ForegroundColor Green
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if ($serverStarted) {
    Write-Host "🌐 Opening browser..." -ForegroundColor Yellow
    Start-Process "http://localhost:3000"
    Write-Host "   ✅ Browser opened successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Arya Development Server is now running!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "🔗 Local:   http://localhost:3000" -ForegroundColor Cyan
    
    # Get network IP safely
    try {
        $networkIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*", "Ethernet*" | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } | Select-Object -First 1).IPAddress
        if ($networkIP) {
            Write-Host "🔗 Network: http://$networkIP`:3000" -ForegroundColor Cyan
        } else {
            Write-Host "🔗 Network: http://[your-ip]:3000" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "🔗 Network: http://[your-ip]:3000" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "📝 Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host "🔄 The server will automatically reload when you save files" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "   ⚠️  Could not verify server status, but it may still be starting..." -ForegroundColor Yellow
    Write-Host "   🌐 Try opening http://localhost:3000 manually" -ForegroundColor Yellow
}

# Wait for the background job to complete (keeps the window open)
try {
    Receive-Job $devServerJob -Wait
} catch {
    Write-Host "Server stopped." -ForegroundColor Yellow
} finally {
    Remove-Job $devServerJob -Force -ErrorAction SilentlyContinue
}