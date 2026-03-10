@echo off
echo ================================================
echo   HackRore TechToolkit v10.0
echo   Generating HTML Report
echo ================================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0HackRore_Master.ps1" report
echo.
pause

