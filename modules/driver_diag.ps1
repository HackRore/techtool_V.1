# =============================================================================
# HackRore TechToolkit - Driver & Device Diagnostics Module
# Version 1.0
# Detects driver issues, missing devices, and hardware problems
# =============================================================================

function Get-DriverDiagnostics {
    <#
    .SYNOPSIS
    Performs driver and device diagnostics
    #>
    
    $result = @{
        module = "drivers"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $devices = @()
        $problemDevices = 0
        $missingDrivers = 0
        
        # Get all PnP devices
        try {
            $pnpDevices = Get-PnpDevice -ErrorAction SilentlyContinue | Where-Object { $_.Status -ne "OK" }
            
            foreach ($dev in $pnpDevices) {
                $severity = "info"
                if ($dev.Status -match "Error") {
                    $severity = "warning"
                    $problemDevices++
                    
                    if ($dev.Status -match "Missing") {
                        $severity = "warning"
                        $missingDrivers++
                    }
                }
                
                $devices += @{
                    name = $dev.FriendlyName
                    class = $dev.Class
                    status = $dev.Status
                    severity = $severity
                }
                
                if ($severity -eq "warning") {
                    $result.issues += @{
                        severity = "warning"
                        message = "$($dev.FriendlyName): $($dev.Status)"
                    }
                    $result.recommendations += "Check driver for: $($dev.FriendlyName)"
                }
            }
        }
        catch {}
        
        # Get USB devices
        $usbDevices = @()
        try {
            $usbs = Get-PnpDevice -Class USB -ErrorAction SilentlyContinue
            foreach ($usb in $usbs) {
                $usbDevices += @{
                    name = $usb.FriendlyName
                    status = $usb.Status
                    present = $usb.Present
                }
            }
        }
        catch {}
        
        # Get bluetooth devices
        $btDevices = @()
        try {
            $bts = Get-PnpDevice -Class Bluetooth -ErrorAction SilentlyContinue
            foreach ($bt in $bts) {
                $btDevices += @{
                    name = $bt.FriendlyName
                    status = $bt.Status
                }
            }
        }
        catch {}
        
        # Get network adapters status
        $netAdapters = @()
        try {
            $nets = Get-NetAdapter -ErrorAction SilentlyContinue
            foreach ($net in $nets) {
                $netAdapters += @{
                    name = $net.Name
                    status = $net.Status
                    speed = $net.LinkSpeed
                }
            }
        }
        catch {}
        
        $result.data = @{
            problemDevices = $problemDevices
            missingDrivers = $missingDrivers
            totalDevices = $devices.Count
            usbDevices = $usbDevices
            bluetoothDevices = $btDevices
            networkAdapters = $netAdapters
        }
        
        # Determine overall status
        if ($problemDevices -gt 0 -or $missingDrivers -gt 0) {
            $result.status = "warning"
            if ($problemDevices -gt 3) {
                $result.status = "critical"
            }
        }
        else {
            $result.status = "ok"
            $result.issues += @{
                severity = "info"
                message = "All devices working properly"
            }
        }
        
    }
    catch {
        $result.status = "error"
        $result.issues += @{
            severity = "error"
            message = "Error during driver diagnostics: $_"
        }
    }
    
    return $result | ConvertTo-Json -Depth 5
}

Export-ModuleMember -Function Get-DriverDiagnostics

