# =============================================================================
# HackRore TechToolkit - Disk Cleanup Automation
# Version 1.0
# Cleans temporary files and frees disk space
# =============================================================================

function Start-DiskCleanup {
    <#
    .SYNOPSIS
    Performs disk cleanup operations
    #>
    
    param(
        [switch]$Deep,
        [switch]$SkipSystem
    )
    
    $result = @{
        module = "disk_cleanup"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        actions = @()
        freedSpaceMB = 0
        errors = @()
    }
    
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "   HackRore Disk Cleanup" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    
    $totalFreed = 0
    
    # 1. User Temp Files
    Write-Host "[1/6] Cleaning User Temp folder..." -ForegroundColor Yellow
    try {
        $tempPath = $env:TEMP
        if (Test-Path $tempPath) {
            $beforeSize = (Get-ChildItem $tempPath -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            Remove-Item "$tempPath\*" -Recurse -Force -ErrorAction SilentlyContinue
            $freedMB = [math]::Round($beforeSize / 1MB, 2)
            $totalFreed += $freedMB
            Write-Host "      Freed: $freedMB MB" -ForegroundColor Green
            $result.actions += "Cleaned user temp folder - freed $freedMB MB"
        }
    }
    catch {
        $result.errors += "Error cleaning user temp: $_"
        Write-Host "      Error: $_" -ForegroundColor Red
    }
    
    # 2. Windows Temp
    if (-not $SkipSystem) {
        Write-Host "[2/6] Cleaning Windows Temp folder..." -ForegroundColor Yellow
        try {
            $winTemp = "$env:WINDIR\Temp"
            if (Test-Path $winTemp) {
                $beforeSize = (Get-ChildItem $winTemp -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
                Remove-Item "$winTemp\*" -Recurse -Force -ErrorAction SilentlyContinue
                $freedMB = [math]::Round($beforeSize / 1MB, 2)
                $totalFreed += $freedMB
                Write-Host "      Freed: $freedMB MB" -ForegroundColor Green
                $result.actions += "Cleaned Windows temp folder - freed $freedMB MB"
            }
        }
        catch {
            $result.errors += "Error cleaning Windows temp: $_"
            Write-Host "      Error: $_" -ForegroundColor Red
        }
    }
    
    # 3. Windows Prefetch
    if (-not $SkipSystem) {
        Write-Host "[3/6] Cleaning Prefetch folder..." -ForegroundColor Yellow
        try {
            $prefetch = "$env:WINDIR\Prefetch"
            if (Test-Path $prefetch) {
                $beforeSize = (Get-ChildItem $prefetch -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
                Remove-Item "$prefetch\*" -Recurse -Force -ErrorAction SilentlyContinue
                $freedMB = [math]::Round($beforeSize / 1MB, 2)
                $totalFreed += $freedMB
                Write-Host "      Freed: $freedMB MB" -ForegroundColor Green
                $result.actions += "Cleaned prefetch folder - freed $freedMB MB"
            }
        }
        catch {
            $result.errors += "Error cleaning prefetch: $_"
            Write-Host "      Error: $_" -ForegroundColor Red
        }
    }
    
    # 4. Recent Documents
    Write-Host "[4/6] Cleaning Recent folder..." -ForegroundColor Yellow
    try {
        $recent = "$env:APPDATA\Microsoft\Windows\Recent"
        if (Test-Path $recent) {
            $beforeSize = (Get-ChildItem $recent -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            Remove-Item "$recent\*" -Recurse -Force -ErrorAction SilentlyContinue
            $freedMB = [math]::Round($beforeSize / 1MB, 2)
            $totalFreed += $freedMB
            Write-Host "      Freed: $freedMB MB" -ForegroundColor Green
            $result.actions += "Cleaned recent folder - freed $freedMB MB"
        }
    }
    catch {
        $result.errors += "Error cleaning recent: $_"
        Write-Host "      Error: $_" -ForegroundColor Red
    }
    
    # 5. Windows Update Cache
    if (-not $SkipSystem) {
        Write-Host "[5/6] Cleaning Windows Update cache..." -ForegroundColor Yellow
        try {
            $wuCache = "$env:WINDIR\SoftwareDistribution\Download"
            if (Test-Path $wuCache) {
                $beforeSize = (Get-ChildItem $wuCache -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
                # Stop Windows Update service first
                Stop-Service -Name "wuauserv" -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 1
                Remove-Item "$wuCache\*" -Recurse -Force -ErrorAction SilentlyContinue
                Start-Service -Name "wuauserv" -ErrorAction SilentlyContinue
                $freedMB = [math]::Round($beforeSize / 1MB, 2)
                $totalFreed += $freedMB
                Write-Host "      Freed: $freedMB MB" -ForegroundColor Green
                $result.actions += "Cleaned Windows Update cache - freed $freedMB MB"
            }
        }
        catch {
            $result.errors += "Error cleaning Windows Update cache: $_"
            Write-Host "      Error: $_" -ForegroundColor Red
        }
    }
    
    # 6. Recycle Bin
    Write-Host "[6/6] Emptying Recycle Bin..." -ForegroundColor Yellow
    try {
        Clear-RecycleBin -Force -ErrorAction SilentlyContinue
        Write-Host "      Recycle Bin emptied" -ForegroundColor Green
        $result.actions += "Emptied Recycle Bin"
    }
    catch {
        $result.errors += "Error emptying recycle bin: $_"
    }
    
    # Deep cleanup option
    if ($Deep) {
        Write-Host ""
        Write-Host "Running deep cleanup..." -ForegroundColor Yellow
        
        # Clean thumbnail cache
        try {
            $thumbCache = "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\thumbcache_*.db"
            Remove-Item $thumbCache -Force -ErrorAction SilentlyContinue
            Write-Host "      Cleared thumbnail cache" -ForegroundColor Green
            $result.actions += "Cleared thumbnail cache"
        }
        catch {}
        
        # Clean error reports
        try {
            $errRep = "$env:LOCALAPPDATA\Microsoft\Windows\WER"
            if (Test-Path $errRep) {
                Remove-Item "$errRep\*" -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "      Cleared error reports" -ForegroundColor Green
                $result.actions += "Cleared error reports"
            }
        }
        catch {}
    }
    
    $result.freedSpaceMB = [math]::Round($totalFreed, 2)
    $result.status = if ($result.errors.Count -eq 0) { "ok" } else { "completed_with_errors" }
    
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "   Total Space Freed: $totalFreed MB" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    
    return $result
}

# Export function
Export-ModuleMember -Function Start-DiskCleanup

