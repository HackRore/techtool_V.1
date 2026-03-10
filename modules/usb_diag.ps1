# =============================================================================
# HackRore TechToolkit - USB & External Devices Diagnostics
# Version 1.0
# Detects USB ports, controllers, and connected devices
# =============================================================================

function Get-UsbDiagnostics {
    <#
    .SYNOPSIS
    Performs USB and external device diagnostics
    #>
    
    $result = @{
        module = "usb"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $usbControllers = @()
        $usbDevices = @()
        $hasIssues = $false
        
        # Get USB Controllers
        try {
            $controllers = Get-CimInstance Win32_USBController -ErrorAction SilentlyContinue
            foreach ($ctrl in $controllers) {
                $usbControllers += @{
                    name = $ctrl.Name
                    deviceId = $ctrl.DeviceID
                    status = if ($ctrl.Status -eq "OK") { "OK" } else { "Error" }
                }
            }
        }
        catch {}
        
        # Get USB Devices
        try {
            $devices = Get-PnpDevice -Class USB -ErrorAction SilentlyContinue
            foreach ($dev in $devices) {
                $status = "OK"
                if ($dev.Status -ne "OK") {
                    $status = $dev.Status
                    $hasIssues = $true
                    $result.issues += @{
                        severity = "warning"
                        message = "USB Device Issue: $($dev.FriendlyName) - $status"
                    }
                }
                
                $usbDevices += @{
                    name = $dev.FriendlyName
                    status = $status
                    present = $dev.Present
                    class = $dev.Class
                }
            }
        }
        catch {}
        
        # Get USB Hubs
        $usbHubs = @()
        try {
            $hubs = Get-PnpDevice -Class USBHub -ErrorAction SilentlyContinue
            foreach ($hub in $hubs) {
                $usbHubs += @{
                    name = $hub.FriendlyName
                    status = $hub.Status
                }
            }
        }
        catch {}
        
        $result.data = @{
            controllers = $usbControllers
            devices = $usbDevices
            hubs = $usbHubs
            totalDevices = $usbDevices.Count
        }
        
        # Check for disabled ports
        $disabledPorts = $usbDevices | Where-Object { $_.status -match "Disabled" }
        if ($disabledPorts) {
            $result.issues += @{
                severity = "warning"
                message = "$($disabledPorts.Count) USB ports are disabled"
            }
            $result.recommendations += "Enable disabled USB ports in Device Manager"
            $hasIssues = $true
        }
        
        # Check for errors
        $errorDevices = $usbDevices | Where-Object { $_.status -match "Error" }
        if ($errorDevices) {
            $result.issues += @{
                severity = "warning"
                message = "$($errorDevices.Count) USB devices have errors"
            }
            $result.recommendations += "Try reconnecting the device or updating its driver"
            $hasIssues = $true
        }
        
        if ($hasIssues) {
            $result.status = "warning"
        }
        else {
            $result.status = "ok"
            $result.issues += @{
                severity = "info"
                message = "All USB ports and devices working properly"
            }
        }
        
    }
    catch {
        $result.status = "error"
        $result.issues += @{
            severity = "error"
            message = "Error during USB diagnostics: $_"
        }
    }
    
    return $result | ConvertTo-Json -Depth 5
}

Export-ModuleMember -Function Get-UsbDiagnostics

