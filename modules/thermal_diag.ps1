# =============================================================================
# HackRore TechToolkit - Thermal Diagnostics Module
# Version 1.0
# Detects CPU/GPU temperatures and thermal health
# =============================================================================

function Get-ThermalDiagnostics {
    <#
    .SYNOPSIS
    Performs thermal diagnostics and returns structured JSON result
    #>
    
    $result = @{
        module = "thermal"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $thermalData = @()
        $hasIssue = $false
        
        # Try to get CPU temperature from WMI
        try {
            $cpuTemp = Get-WmiObject MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" -ErrorAction SilentlyContinue
            if ($cpuTemp) {
                # Convert from tenths of Kelvin to Celsius
                $tempC = [math]::Round(($cpuTemp.CurrentTemperature - 2732) / 10, 0)
                $thermalData += @{
                    component = "CPU"
                    temperature = $tempC
                    unit = "C"
                }
                
                if ($tempC -gt 90) {
                    $result.status = "critical"
                    $hasIssue = $true
                    $result.issues += @{
                        severity = "critical"
                        message = "CPU temperature is critically high at ${tempC}C"
                    }
                    $result.recommendations += "Clean fans and replace thermal paste immediately"
                }
                elseif ($tempC -gt 80) {
                    if ($result.status -ne "critical") { $result.status = "warning" }
                    $hasIssue = $true
                    $result.issues += @{
                        severity = "warning"
                        message = "CPU temperature is elevated at ${tempC}C"
                    }
                    $result.recommendations += "Check cooling system and clean dust"
                }
            }
        }
        catch {}
        
        # Try alternative temperature methods
        if ($thermalData.Count -eq 0) {
            # Try getting from CIM
            try {
                $temp = Get-CimInstance -Namespace "root/wmi" -ClassName " MSAcpi_ThermalZoneTemperature" -ErrorAction SilentlyContinue
                if ($temp) {
                    $tempC = [math]::Round(($temp.CurrentTemperature - 2732) / 10, 0)
                    $thermalData += @{
                        component = "CPU"
                        temperature = $tempC
                        unit = "C"
                        note = "Estimated"
                    }
                }
            }
            catch {}
        }
        
        # Try to get GPU temperature
        try {
            $gpuTemp = Get-WmiObject -Namespace "root/wmi" -ClassName "ThermalZoneTemperature" -ErrorAction SilentlyContinue
            if ($gpuTemp) {
                $tempC = [math]::Round(($gpuTemp.CurrentTemperature - 2732) / 10, 0)
                $thermalData += @{
                    component = "GPU"
                    temperature = $tempC
                    unit = "C"
                }
                
                if ($tempC -gt 85) {
                    if ($result.status -ne "critical") { $result.status = "warning" }
                    $hasIssue = $true
                    $result.issues += @{
                        severity = "warning"
                        message = "GPU temperature is high at ${tempC}C"
                    }
                }
            }
        }
        catch {}
        
        # If no temperature data available
        if ($thermalData.Count -eq 0) {
            $thermalData += @{
                component = "System"
                temperature = 0
                unit = "N/A"
                note = "Temperature sensors not accessible"
            }
            $result.issues += @{
                severity = "info"
                message = "Temperature sensors not accessible"
            }
        }
        
        $result.data = @{
            sensors = $thermalData
            thermalState = "Unknown"
        }
        
        # Check if we can determine thermal state
        try {
            $proc = Get-CimInstance -ClassName Win32_Processor -ErrorAction SilentlyContinue
            # Note: This may not be available on all systems
        }
        catch {}
        
        if (-not $hasIssue -and $result.status -eq "unknown") {
            $result.status = "ok"
        }
        
    }
    catch {
        $result.status = "error"
        $result.issues += @{
            severity = "error"
            message = "Error during thermal diagnostics: $_"
        }
    }
    
    return $result | ConvertTo-Json -Depth 5
}

Export-ModuleMember -Function Get-ThermalDiagnostics

