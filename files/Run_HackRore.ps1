# ============================================================
#  HackRore Quick Launcher
#  Run this as Administrator for full results
# ============================================================

$ErrorActionPreference = "SilentlyContinue"

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "  [!!] WARNING: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "  Some features (SMART, battery cycles, WMI thermal)" -ForegroundColor Yellow
    Write-Host "  require admin rights for full results." -ForegroundColor Yellow
    Write-Host ""
    $elevate = Read-Host "  Relaunch as Administrator? (Y/N)"
    if ($elevate -eq "Y" -or $elevate -eq "y") {
        Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSScriptRoot\HackRore_Master.ps1`"" -Verb RunAs
        exit
    }
}

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Launch master scanner
& "$PSScriptRoot\HackRore_Master.ps1" @args
