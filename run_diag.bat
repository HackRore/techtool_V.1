@echo off
echo Starting HackRore Diagnostics...
powershell -ExecutionPolicy Bypass -File "%~dp0HackRore_Diagnostics.ps1" -ExportReport -OpenReport
pause

