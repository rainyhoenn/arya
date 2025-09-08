# 🚀 Windows Setup Guide for Arya

This guide will help Windows users get Arya running quickly and easily!

## 🎯 Quick Start (Recommended)

### Option 1: Double-Click Start (Easiest)

1. **Simply double-click** the `start.bat` file
2. **That's it!** The script will:
   - ✅ Set PowerShell execution policy automatically
   - ✅ Install dependencies with `bun install`
   - ✅ Start the development server with `bun --bun run dev`
   - ✅ Open your browser automatically to `http://localhost:3000`

### Option 2: Simple Start

1. Double-click `start-simple.bat` for minimal automation
2. Less verbose output, same functionality

## 📋 Prerequisites

### Required
- **Windows 10/11** (recommended)
- **Bun** runtime installed ([Download here](https://bun.sh/))

### Install Bun (if not already installed)
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

## 🔧 What the Scripts Do

### Automatic Setup Process:
1. **PowerShell Policy**: Sets execution policy to `RemoteSigned` for current user
2. **Dependency Check**: Verifies Bun is installed
3. **Package Installation**: Runs `bun install` to install all dependencies
4. **Server Start**: Launches development server with `bun --bun run dev`
5. **Browser Launch**: Automatically opens `http://localhost:3000`
6. **Status Monitoring**: Shows colorful progress updates

### Smart Features:
- 🔍 **Automatic Detection**: Checks if Bun is installed
- 🛡️ **Safe Execution**: Only sets minimal required permissions
- 🎨 **Colorful Output**: Easy-to-read progress indicators
- 🌐 **Auto Browser**: Opens your default browser when ready
- ⚡ **Fast Startup**: Optimized for quick development workflow

## 🚨 Troubleshooting

### PowerShell Execution Policy Issues
If you get an execution policy error:
1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force`
3. Type `Y` and press Enter
4. Try running the script again

### Bun Not Found
If the script can't find Bun:
1. Install Bun: `powershell -c "irm bun.sh/install.ps1 | iex"`
2. Restart your terminal/command prompt
3. Try running the script again

### Port Already in Use
If port 3000 is busy:
1. Close other development servers
2. Or change the port in `package.json` scripts section
3. Restart the script

### Browser Doesn't Open
If the browser doesn't open automatically:
1. Manually navigate to `http://localhost:3000`
2. The server should still be running

## 🎉 Success!

When everything works, you should see:
- ✅ Colorful startup messages in the terminal
- ✅ Development server running on `http://localhost:3000`
- ✅ Browser automatically opens to the application
- ✅ Hot reload working when you save files

## 🛑 Stopping the Server

To stop the development server:
- Press `Ctrl + C` in the terminal window
- Or simply close the terminal window

## 💡 Tips for Developers

- The script creates a convenient shortcut for daily development
- You can pin the `.bat` file to your taskbar for even quicker access
- The server automatically reloads when you make changes to files
- Check the terminal for any error messages or logs

---

**Happy coding with Arya! 🎈**

*Need help? Check the main README.md or create an issue on GitHub.*