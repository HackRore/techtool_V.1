@echo off
echo ==================================
echo   HackRore Quick Scan
echo ==================================
echo.
echo Running quick diagnostics...
powershell -ExecutionPolicy Bypass -File "%~dp0HackRore_Simple_Diag.ps1"
pause

