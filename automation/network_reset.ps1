# =============================================================================
# HackRore TechToolkit - Network Reset Automation
# Version 1.0
# Resets network stack to fix connectivity issues
# =============================================================================

function Start-NetworkReset {
    param(
        [switch]$Full,
        [switch]$SkipRestart
    )
    
    $result = @{
        module = "network_reset"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        actions = @()
        errors = @()
    }
    
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "   HackRore Network Reset" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Host "[WARNING] Not running as Administrator. Some operations may fail." -ForegroundColor Yellow
        Write-Host "          For full network reset, run as Administrator." -ForegroundColor Yellow
        Write-Host ""
    }
    
    # 1. Flush DNS
    Write-Host "[1/7] Flushing DNS cache..." -ForegroundColor Yellow
    try {
        Clear-DnsClientCache
        Write-Host "      DNS cache flushed" -ForegroundColor Green
        $result.actions += "Flushed DNS cache"
    }
    catch {
        try {
            ipconfig /flushdns | Out-Null
            Write-Host "      DNS cache flushed" -ForegroundColor Green
            $result.actions += "Flushed DNS cache"
        }
        catch {
            $result.errors += "Failed to flush DNS: $_"
            Write-Host "      Error: $_" -ForegroundColor Red
        }
    }
    
    # 2. Release IP
    Write-Host "[2/7] Releasing IP address..." -ForegroundColor Yellow
    try {
        Remove-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue
        Write-Host "      IP address released" -ForegroundColor Green
        $result.actions += "Released IP address"
    }
    catch {
        try {
            ipconfig /release | Out-Null
            Write-Host "      IP address released" -ForegroundColor Green
            $result.actions += "Released IP address"
        }
        catch {
            $result.errors += "Failed to release IP: $_"
            Write-Host "      Error: $_" -ForegroundColor Red
        }
    }
    
    # 3. Renew IP
    Write-Host "[3/7] Renewing IP address..." -ForegroundColor Yellow
    try {
        Start-Sleep -Seconds 2
        Request-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue
        Write-Host "      IP address renewed" -ForegroundColor Green
        $result.actions += "Renewed IP address"
    }
    catch {
        try {
            ipconfig /renew | Out-Null
            Write-Host "      IP address renewed" -ForegroundColor Green
            $result.actions += "Renewed IP address"
        }
        catch {
            $result.errors += "Failed to renew IP: $_"
            Write-Host "      Error: $_" -ForegroundColor Red
        }
    }
    
    # 4. Reset Winsock
    if ($Full -and $isAdmin) {
        Write-Host "[4/7] Resetting Winsock catalog..." -ForegroundColor Yellow
        try {
            netsh winsock reset | Out-Null
            Write-Host "      Winsock catalog reset" -ForegroundColor Green
            $result.actions += "Reset Winsock catalog"
        }
        catch {
            $result.errors += "Failed to reset Winsock: $_"
            Write-Host "      Error: $_" -ForegroundColor Red
        }
    }
    
    # 5. Reset TCP/IP
    if ($Full -and $isAdmin) {
        Write-Host "[5/7] Resetting TCP/IP stack..." -ForegroundColor Yellow
        try {
            netsh int ip reset | Out-Null
            Write-Host "      TCP/IP stack reset" -ForegroundColor Green
            $result.actions += "Reset TCP/IP stack"
        }
        catch {
            $result.errors += "Failed to reset TCP/IP: $_"
            Write-Host "      Error: $_" -ForegroundColor Red
        }
    }
    
    # 6. Reset proxy
    Write-Host "[6/7] Resetting proxy settings..." -ForegroundColor Yellow
    try {
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" -Name ProxyEnable -Value 0 -ErrorAction SilentlyContinue
        Write-Host "      Proxy settings reset" -ForegroundColor Green
        $result.actions += "Reset proxy settings"
    }
    catch {
        # Ignore errors
    }
    
    # 7. Reset network adapters
    Write-Host "[7/7] Resetting network adapters..." -ForegroundColor Yellow
    try {
        Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Disable-NetAdapter -Confirm:$false -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Get-NetAdapter | Where-Object { $_.Status -eq 'Disabled' } | Enable-NetAdapter -Confirm:$false -ErrorAction SilentlyContinue
        Write-Host "      Network adapters reset" -ForegroundColor Green
        $result.actions += "Reset network adapters"
    }
    catch {
        # Ignore errors if admin not available
    }
    
    # Final DNS register
    Write-Host ""
    Write-Host "Registering DNS..." -ForegroundColor Yellow
    try {
        Register-DnsClient | Out-Null
        Write-Host "      DNS registered" -ForegroundColor Green
    }
    catch {}
    
    $result.status = if ($result.errors.Count -eq 0) { "ok" } else { "completed_with_errors" }
    
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "   Network Reset Complete!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    
    if (-not $SkipRestart) {
        Write-Host "[NOTE] A system restart may be required for full reset." -ForegroundColor Yellow
        Write-Host "       Some changes will take effect after restart." -ForegroundColor Yellow
    }
    
    return $result
}

# Export function
Export-ModuleMember -Function Start-NetworkReset

