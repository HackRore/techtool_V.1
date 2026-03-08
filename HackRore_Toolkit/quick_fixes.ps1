# =============================================================================
# HackRore Technician Toolkit - Quick Fixes
# Automation scripts for common technician tasks
# =============================================================================

param(
    [ValidateSet("ClearTemp","ResetNetwork","RestartService","CheckDisk","All")]
    [string]$Action = "All",
    [string]$ServiceName = ""
)

$ErrorActionPreference = "Continue"

function Write-Menu {
    Clear-Host
    Write-Host @"
╔══════════════════════════════════════════════════════════╗
║     HackRore Quick Fixes - Technician Automation        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  [1] Clear Temp Files           - Free disk space       ║
║  [2] Reset Network Stack        - Fix network issues    ║
║  [3] Restart Service             - Restart Windows service║
║  [4] Check Disk                 - Run disk check        ║
║  [5] View System Info           - Quick system overview ║
║  [6] Run All Diagnostics       - Full system scan      ║
║                                                          ║
║  [Q] Quit                                               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
}

function Clear-TempFiles {
    Write-Host "`n[1] Clearing Temporary Files..." -ForegroundColor Yellow
    
    $tempPaths = @(
        $env:TEMP,
        "$env:LOCALAPPDATA\Temp",
        "$env:WINDIR\Temp"
    )
    
    $totalFreed = 0
    foreach ($path in $tempPaths) {
        if (Test-Path $path) {
            try {
                $size = (Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
                $totalFreed += $size
                Remove-Item "$path\*" -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  Cleared: $path" -ForegroundColor Green
            } catch {
                Write-Host "  Could not clear: $path" -ForegroundColor Red
            }
        }
    }
    
    $mbFreed = [math]::Round($totalFreed / 1MB, 2)
    Write-Host "`nTotal freed: $mbFreed MB" -ForegroundColor Green
}

function Reset-NetworkStack {
    Write-Host "`n[2] Resetting Network Stack..." -ForegroundColor Yellow
    
    Write-Host "  Flushing DNS..." -ForegroundColor White
    ipconfig /flushdns | Out-Null
    Write-Host "  DNS flushed" -ForegroundColor Green
    
    Write-Host "  Releasing IP..." -ForegroundColor White
    ipconfig /release | Out-Null
    Write-Host "  IP released" -ForegroundColor Green
    
    Write-Host "  Renewing IP..." -ForegroundColor White
    ipconfig /renew | Out-Null
    Write-Host "  IP renewed" -ForegroundColor Green
    
    Write-Host "`nNetwork stack reset complete!" -ForegroundColor Green
}

function Restart-WindowsService {
    param([string]$Name)
    
    if (-not $Name) {
        Write-Host "`nEnter service name to restart: " -ForegroundColor Yellow -NoNewline
        $Name = Read-Host
    }
    
    Write-Host "`nRestarting service: $Name..." -ForegroundColor Yellow
    
    try {
        Restart-Service -Name $Name -Force -ErrorAction Stop
        Write-Host "Service '$Name' restarted successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error restarting service: $_" -ForegroundColor Red
    }
}

function Check-DiskHealth {
    Write-Host "`n[4] Checking Disk Health..." -ForegroundColor Yellow
    
    Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | ForEach-Object {
        $usedPct = [math]::Round((($_.Size - $_.FreeSpace) / $_.Size) * 100, 1)
        $color = if ($usedPct -gt 90) { "Red" } elseif ($usedPct -gt 80) { "Yellow" } else { "Green" }
        
        Write-Host "  Drive $($_.DeviceID) - $usedPct used" -ForegroundColor $color
        Write-Host "    Total: $([math]::Round($_.Size/1GB, 2)) GB" -ForegroundColor Gray
        Write-Host "    Free:  $([math]::Round($_.FreeSpace/1GB, 2)) GB" -ForegroundColor Gray
    }
}

function Show-SystemInfo {
    Write-Host "`n[5] System Overview..." -ForegroundColor Yellow
    
    $cs = Get-CimInstance Win32_ComputerSystem
    $os = Get-CimInstance Win32_OperatingSystem
    $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
    
    Write-Host "  Computer: $($cs.Manufacturer) $($cs.Model)" -ForegroundColor White
    Write-Host "  CPU: $($cpu.Name)" -ForegroundColor White
    Write-Host "  RAM: $([math]::Round($cs.TotalPhysicalMemory/1GB, 2)) GB" -ForegroundColor White
    Write-Host "  OS: $($os.Caption)" -ForegroundColor White
    Write-Host "  Uptime: $((Get-Date) - $os.LastBootUpTime).Days days" -ForegroundColor White
}

# Main Menu Loop
do {
    Write-Menu
    $choice = Read-Host "Select option"
    
    switch ($choice) {
        "1" { Clear-TempFiles }
        "2" { Reset-NetworkStack }
        "3" { Restart-WindowsService -Name $ServiceName }
        "4" { Check-DiskHealth }
        "5" { Show-SystemInfo }
        "6" { 
            Write-Host "`nRunning full diagnostics..." -ForegroundColor Yellow
            & "$PSScriptRoot\HackRore_Severity_Diag.ps1"
        }
        "Q" { break }
        default { Write-Host "Invalid option" -ForegroundColor Red }
    }
    
    if ($choice -ne "Q") {
        Write-Host "`nPress Enter to continue..." -ForegroundColor Gray
        Read-Host
    }
} while ($choice -ne "Q")

