@echo off
echo ====================================
echo   HackRore Severity Diagnostics
echo ====================================
echo.
echo Running severity-classified diagnostics...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0HackRore_Severity_Diag.ps1"
pause

