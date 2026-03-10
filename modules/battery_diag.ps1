# =============================================================================
# HackRore TechToolkit - Battery Diagnostics Module
# Version 1.0
# Detects battery health, charge level, and issues (for laptops)
# =============================================================================

function Get-BatteryDiagnostics {
    <#
    .SYNOPSIS
    Performs battery diagnostics and returns structured JSON result
    #>
    
    $result = @{
        module = "battery"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $bat = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue
        
        if (-not $bat) {
            # No battery - likely a desktop
            $result.status = "ok"
            $result.data = @{
                present = $false
                isLaptop = $false
                message = "No battery detected (Desktop system)"
            }
            $result.issues += @{
                severity = "info"
                message = "Desktop system - no battery"
            }
            return $result | ConvertTo-Json -Depth 5
        }
        
        # Battery is present
        $isLaptop = $true
        
        # Get battery health from WMI
        $health = 0
        $designCapacity = 0
        $fullCapacity = 0
        $cycleCount = 0
        
        try {
            $batStatic = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryStaticData" -ErrorAction SilentlyContinue
            $batFull = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryFullChargedCapacity" -ErrorAction SilentlyContinue
            $batCycle = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryCycleCount" -ErrorAction SilentlyContinue
            
            if ($batStatic -and $batStatic.DesignedCapacity -gt 0) {
                $designCapacity = $batStatic.DesignedCapacity
                $fullCapacity = $batFull.FullChargedCapacity
                $health = [math]::Round(($fullCapacity / $designCapacity) * 100, 1)
            }
            
            if ($batCycle -and $batCycle.CycleCount) {
                $cycleCount = $batCycle.CycleCount
            }
        }
        catch {}
        
        # Get charge status
        $chargeStatus = switch ($bat.BatteryStatus) {
            1 { "Discharging" }
            2 { "AC Power" }
            3 { "Fully Charged" }
            4 { "Low" }
            5 { "Critical" }
            6 { "Charging" }
            7 { "Charging High" }
            8 { "Charging Low" }
            9 { "Charging Critical" }
            default { "Unknown" }
        }
        
        $result.data = @{
            present = $true
            isLaptop = $true
            name = $bat.Name
            chargeLevel = $bat.EstimatedChargeRemaining
            status = $chargeStatus
            healthPercent = $health
            designCapacitymWh = $designCapacity
            fullCapacitymWh = $fullCapacity
            cycleCount = $cycleCount
        }
        
        # Analyze issues
        $hasIssues = $false
        
        # Critical battery health
        if ($health -gt 0 -and $health -lt 20) {
            $result.status = "critical"
            $hasIssues = $true
            $result.issues += @{
                severity = "critical"
                message = "Battery health is critically low at $health%"
            }
            $result.recommendations += "Battery needs replacement - capacity is severely degraded"
        }
        elseif ($health -gt 0 -and $health -lt 40) {
            $result.status = "warning"
            $hasIssues = $true
            $result.issues += @{
                severity = "warning"
                message = "Battery health is low at $health%"
            }
            $result.recommendations += "Consider replacing battery soon"
        }
        elseif ($health -gt 0 -and $health -lt 60) {
            $result.status = "warning"
            $hasIssues = $true
            $result.issues += @{
                severity = "warning"
                message = "Battery health is degraded at $health%"
            }
            $result.recommendations += "Battery is showing signs of wear"
        }
        
        # High cycle count
        if ($cycleCount -gt 1000) {
            $result.issues += @{
                severity = "warning"
                message = "Battery has high cycle count: $cycleCount"
            }
            $result.recommendations += "Battery may need replacement soon due to high cycle count"
            $hasIssues = $true
        }
        
        # Low battery
        if ($bat.EstimatedChargeRemaining -lt 10 -and $chargeStatus -eq "Discharging") {
            $result.issues += @{
                severity = "warning"
                message = "Battery level is critically low"
            }
            $result.recommendations += "Plug in charger immediately"
            $hasIssues = $true
        }
        
        if (-not $hasIssues) {
            $result.status = "ok"
        }
        
    }
    catch {
        $result.status = "error"
        $result.issues += @{
            severity = "error"
            message = "Error during battery diagnostics: $_"
        }
    }
    
    return $result | ConvertTo-Json -Depth 5
}

Export-ModuleMember -Function Get-BatteryDiagnostics

