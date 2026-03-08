@echo off
echo ==================================
echo   HackRore Web Dashboard
echo ==================================
echo.
echo Starting Web Server on port 8080...
echo Open http://localhost:8080 in your browser
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0HackRore_Diagnostics_Web.ps1" -OpenBrowser

