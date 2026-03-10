# =============================================================================
# HackRore TechToolkit - Battery Wear Report Generator
# Version 1.0
# Generates detailed battery health report using powercfg
# =============================================================================

function Get-BatteryWearReport {
    <#
    .SYNOPSIS
    Generates detailed battery wear report using powercfg
    #>
    
    $result = @{
        module = "battery_wear"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        # Generate battery report
        $reportPath = "$env:TEMP\battery-report.xml"
        $output = powercfg /batteryreport /output $reportPath /xml 2>&1
        
        $batteryData = @{
            designCapacity = 0
            fullChargeCapacity = 0
            cycleCount = 0
            wearPercentage = 0
            batteryAge = "Unknown"
        }
        
        if (Test-Path $reportPath) {
            try {
                [xml]$xml = Get-Content $reportPath -ErrorAction Stop
                
                # Get design capacity
                $design = $xml.BatteryReport.Batteries.Battery | Select-Object -First 1
                if ($design) {
                    $batteryData.designCapacity = [int]$design.DesignCapacity
                    $batteryData.fullChargeCapacity = [int]$design.FullChargeCapacity
                    
                    # Calculate wear
                    if ($batteryData.designCapacity -gt 0 -and $batteryData.fullChargeCapacity -gt 0) {
                        $wear = (($batteryData.designCapacity - $batteryData.fullChargeCapacity) / $batteryData.designCapacity) * 100
                        $batteryData.wearPercentage = [math]::Round($wear, 1)
                    }
                }
                
                # Get cycle count
                $cycles = $xml.BatteryReport.Batteries.Battery.CycleCount
                if ($cycles) {
                    $batteryData.cycleCount = [int]$cycles
                }
            }
            catch {
                # XML parse failed, try basic WMI
            }
        }
        
        # Clean up
        Remove-Item $reportPath -ErrorAction SilentlyContinue
        
        # If no data from powercfg, try WMI
        if ($batteryData.designCapacity -eq 0) {
            try {
                $batStatic = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryStaticData" -ErrorAction SilentlyContinue
                $batFull = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryFullChargedCapacity" -ErrorAction SilentlyContinue
                $batCycle = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryCycleCount" -ErrorAction SilentlyContinue
                
                if ($batStatic -and $batStatic.DesignedCapacity -gt 0) {
                    $batteryData.designCapacity = $batStatic.DesignedCapacity
                    $batteryData.fullChargeCapacity = $batFull.FullChargedCapacity
                    
                    if ($batteryData.designCapacity -gt 0 -and $batteryData.fullChargeCapacity -gt 0) {
                        $wear = (($batteryData.designCapacity - $batteryData.fullChargeCapacity) / $batteryData.designCapacity) * 100
                        $batteryData.wearPercentage = [math]::Round($wear, 1)
                    }
                }
                
                if ($batCycle -and $batCycle.CycleCount) {
                    $batteryData.cycleCount = $batCycle.CycleCount
                }
            }
            catch {}
        }
        
        $result.data = $batteryData
        
        # Analyze wear
        $wear = $batteryData.wearPercentage
        
        if ($wear -gt 0) {
            if ($wear -gt 40) {
                $result.status = "critical"
                $result.issues += @{
                    severity = "critical"
                    message = "Battery wear is critical at $wear%"
                }
                $result.recommendations += "Replace battery - wear level is too high"
            }
            elseif ($wear -gt 20) {
                $result.status = "warning"
                $result.issues += @{
                    severity = "warning"
                    message = "Battery wear is significant at $wear%"
                }
                $result.recommendations += "Consider battery replacement soon"
            }
            else {
                $result.status = "ok"
                $result.issues += @{
                    severity = "info"
                    message = "Battery wear is normal at $wear%"
                }
            }
        }
        
        # Check cycle count
        $cycles = $batteryData.cycleCount
        if ($cycles -gt 0) {
            if ($cycles -gt 1000) {
                $result.issues += @{
                    severity = "warning"
                    message = "High battery cycle count: $cycles"
                }
                $result.recommendations += "Battery has high cycle count - consider replacement"
            }
        }
        
    }
    catch {
        $result.status = "error"
        $result.issues += @{
            severity = "error"
            message = "Error generating battery wear report: $_"
        }
    }
    
    return $result | ConvertTo-Json -Depth 5
}

Export-ModuleMember -Function Get-BatteryWearReport

