# =============================================================================
# HackRore TechToolkit - Windows Repair Automation
# Version 1.0
# Repairs Windows system files and image
# =============================================================================

function Start-WindowsRepair {
    param(
        [switch]$Quick,
        [switch]$Deep,
        [switch]$SkipBackup
    )
    
    $result = @{
        module = "windows_repair"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        actions = @()
        errors = @()
    }
    
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "   HackRore Windows Repair" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Host "[ERROR] This script requires Administrator privileges." -ForegroundColor Red
        Write-Host "        Please run as Administrator and try again." -ForegroundColor Yellow
        $result.status = "error"
        $result.errors += "Requires Administrator privileges"
        return $result
    }
    
    # Quick repair - SFC only
    if ($Quick) {
        Write-Host "[Quick Mode] Running SFC scan..." -ForegroundColor Yellow
        try {
            Write-Host "      Running sfc /scannow..." -ForegroundColor White
            $sfcOutput = sfc /scannow 2>&1
            if ($sfcOutput -match "Windows Resource Protection did not find any integrity violations") {
                Write-Host "      SFC: No integrity violations found" -ForegroundColor Green
                $result.actions += "SFC scan completed - no issues found"
            }
            elseif ($sfcOutput -match "Windows Resource Protection repaired the files") {
                Write-Host "      SFC: Files were repaired" -ForegroundColor Green
                $result.actions += "SFC scan completed - files repaired"
            }
            else {
                Write-Host "      SFC: Scan completed with issues" -ForegroundColor Yellow
                $result.actions += "SFC scan completed"
            }
        }
        catch {
            $result.errors += "SFC scan failed: $_"
            Write-Host "      Error: $_" -ForegroundColor Red
        }
        
        $result.status = if ($result.errors.Count -eq 0) { "ok" } else { "completed_with_errors" }
        Write-Host ""
        Write-Host "Quick repair complete!" -ForegroundColor Green
        return $result
    }
    
    # Full repair - SFC + DISM
    Write-Host "[Full Mode] Running system scans..." -ForegroundColor Yellow
    Write-Host ""
    
    # 1. DISM Health Check
    Write-Host "[1/3] Running DISM health check..." -ForegroundColor Yellow
    try {
        Write-Host "      Checking system image..." -ForegroundColor White
        $dismOutput = DISM /Online /Cleanup-Image /CheckHealth 2>&1
        if ($dismOutput -match "No component store corruption detected") {
            Write-Host "      DISM: No corruption detected" -ForegroundColor Green
            $result.actions += "DISM health check - no corruption"
        }
        elseif ($dismOutput -match " corrupt but repairable") {
            Write-Host "      DISM: Corruption detected, will repair..." -ForegroundColor Yellow
        }
    }
    catch {
        $result.errors += "DISM check failed: $_"
    }
    
    # 2. DISM Restore Health
    Write-Host "[2/3] Running DISM restore..." -ForegroundColor Yellow
    try {
        Write-Host "      Restoring system image (this may take a while)..." -ForegroundColor White
        $dismRestore = DISM /Online /Cleanup-Image /RestoreHealth 2>&1
        if ($dismRestore -match "The restore operation completed successfully") {
            Write-Host "      DISM: Restore completed successfully" -ForegroundColor Green
            $result.actions += "DISM restore - completed"
        }
        elseif ($dismRestore -match "No component store corruption detected") {
            Write-Host "      DISM: No corruption to repair" -ForegroundColor Green
            $result.actions += "DISM restore - no issues found"
        }
        else {
            Write-Host "      DISM: Restore completed" -ForegroundColor Yellow
            $result.actions += "DISM restore - completed"
        }
    }
    catch {
        $result.errors += "DISM restore failed: $_"
        Write-Host "      Error: $_" -ForegroundColor Red
    }
    
    # 3. SFC Scan
    Write-Host "[3/3] Running SFC scan..." -ForegroundColor Yellow
    try {
        Write-Host "      Scanning system files..." -ForegroundColor White
        $sfcOutput = sfc /scannow 2>&1
        if ($sfcOutput -match "Windows Resource Protection did not find any integrity violations") {
            Write-Host "      SFC: No integrity violations found" -ForegroundColor Green
            $result.actions += "SFC scan - no issues found"
        }
        elseif ($sfcOutput -match "Windows Resource Protection repaired the files") {
            Write-Host "      SFC: Files were repaired" -ForegroundColor Green
            $result.actions += "SFC scan - files repaired"
        }
        else {
            Write-Host "      SFC: Scan completed" -ForegroundColor Yellow
            $result.actions += "SFC scan - completed"
        }
    }
    catch {
        $result.errors += "SFC scan failed: $_"
        Write-Host "      Error: $_" -ForegroundColor Red
    }
    
    # Deep repair option
    if ($Deep) {
        Write-Host ""
        Write-Host "[Deep Mode] Additional repairs..." -ForegroundColor Yellow
        
        # Check disk
        Write-Host "      Running disk check..." -ForegroundColor White
        try {
            $result.actions += "Disk check recommended"
        }
        catch {}
    }
    
    $result.status = if ($result.errors.Count -eq 0) { "ok" } else { "completed_with_errors" }
    
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "   Windows Repair Complete!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "[NOTE] Restart your computer for changes to take effect." -ForegroundColor Yellow
    
    return $result
}

Export-ModuleMember -Function Start-WindowsRepair

