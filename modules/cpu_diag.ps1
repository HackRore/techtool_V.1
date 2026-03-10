# =============================================================================
# HackRore TechToolkit - CPU Diagnostics Module
# Version 1.0
# Detects CPU information, performance, and issues
# =============================================================================

function Get-CpuDiagnostics {
    <#
    .SYNOPSIS
    Performs CPU diagnostics and returns structured JSON result
    #>
    
    $result = @{
        module = "cpu"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        # Get CPU Information
        $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
        
        if ($cpu) {
            # Extract CPU details
            $cpuName = $cpu.Name
            $cpuCores = $cpu.NumberOfCores
            $cpuThreads = $cpu.NumberOfLogicalProcessors
            $cpuSpeed = [math]::Round($cpu.MaxClockSpeed / 1000, 2)
            $cpuLoad = $cpu.LoadPercentage
            
            # Detect CPU generation
            $cpuGen = "Unknown"
            if ($cpuName -match "(\d+)th Gen") { $cpuGen = "$($Matches[1])th Gen" }
            elseif ($cpuName -match "i[3579]-(\d+)") { 
                $genNum = [string]$Matches[1][0]
                $cpuGen = "${genNum}th Gen"
            }
            elseif ($cpuName -match "Ryzen \d (\d+)") { $cpuGen = "Ryzen $($Matches[1]) Gen" }
            
            # Short CPU name for display
            $cpuShort = $cpuName
            if ($cpuName -match "(i[3579]-\d+\w*)") { $cpuShort = $Matches[1] }
            elseif ($cpuName -match "(Ryzen \d \d+\w*)") { $cpuShort = $Matches[1] }
            
            $result.data = @{
                name = $cpuName
                shortName = $cpuShort
                generation = $cpuGen
                cores = $cpuCores
                threads = $cpuThreads
                speedGHz = $cpuSpeed
                loadPercent = $cpuLoad
                manufacturer = $cpu.Manufacturer
                processorId = $cpu.ProcessorId
            }
            
            # Analyze issues
            if ($cpuLoad -gt 90) {
                $result.status = "critical"
                $result.issues += @{
                    severity = "critical"
                    message = "CPU usage is critically high at $cpuLoad%"
                }
                $result.recommendations += "Close unnecessary applications and check for runaway processes"
            }
            elseif ($cpuLoad -gt 70) {
                $result.status = "warning"
                $result.issues += @{
                    severity = "warning"
                    message = "CPU usage is elevated at $cpuLoad%"
                }
                $result.recommendations += "Monitor CPU usage and consider closing background applications"
            }
            else {
                $result.status = "ok"
            }
            
            # Check for outdated CPU (older than 8 years)
            try {
                $cpuAge = (Get-Date) - $cpu.ReleaseDate
                if ($cpuAge.Days -gt 2920) {
                    $result.issues += @{
                        severity = "info"
                        message = "CPU is over 8 years old"
                    }
                    $result.recommendations += "Consider upgrading to a newer processor for better performance"
                }
            }
            catch {}
        }
        else {
            $result.status = "error"
            $result.issues += @{
                severity = "error"
                message = "Could not detect CPU"
            }
        }
    }
    catch {
        $result.status = "error"
        $result.issues += @{
            severity = "error"
            message = "Error during CPU diagnostics: $_"
        }
    }
    
    return $result | ConvertTo-Json -Depth 5
}

# Export function for module loading
Export-ModuleMember -Function Get-CpuDiagnostics

