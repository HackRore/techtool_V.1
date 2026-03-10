# =============================================================================
# HackRore TechToolkit - RAM Diagnostics Module
# Version 1.0
# Detects RAM information, performance, and issues
# =============================================================================

function Get-RamDiagnostics {
    <#
    .SYNOPSIS
    Performs RAM diagnostics and returns structured JSON result
    #>
    
    $result = @{
        module = "ram"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $cs = Get-CimInstance Win32_ComputerSystem
        $os = Get-CimInstance Win32_OperatingSystem
        
        $totalRAM = [math]::Round($cs.TotalPhysicalMemory / 1GB, 2)
        $freeRAM = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
        $usedRAM = [math]::Round($totalRAM - $freeRAM, 2)
        $ramPercent = if ($totalRAM -gt 0) { [math]::Round(($usedRAM / $totalRAM) * 100, 1) } else { 0 }
        
        # Get RAM modules information
        $ramModules = Get-CimInstance Win32_PhysicalMemory -ErrorAction SilentlyContinue
        $ramSlots = ($ramModules | Measure-Object).Count
        $ramSpeed = if ($ramModules) { ($ramModules | Select-Object -First 1).Speed } else { 0 }
        $ramType = if ($ramModules) { 
            switch (($ramModules | Select-Object -First 1).MemoryType) {
                26 { "DDR4" } 34 { "DDR5" } 24 { "DDR3" } 20 { "DDR2" } 
                default { "DDR" }
            }
        } else { "Unknown" }
        
        # Calculate available memory slots
        $maxSlots = 4
        $usedSlots = $ramSlots
        $availableSlots = $maxSlots - $usedSlots
        
        # Get memory details for each module
        $moduleDetails = @()
        foreach ($module in $ramModules) {
            $moduleDetails += @{
                bank = $module.BankLabel
                sizeGB = [math]::Round($module.Capacity / 1GB, 2)
                speed = $module.Speed
                type = switch ($module.MemoryType) {
                    26 { "DDR4" } 34 { "DDR5" } 24 { "DDR3" } 20 { "DDR2" }
                    default { "DDR" }
                }
            }
        }
        
        $result.data = @{
            totalGB = $totalRAM
            usedGB = $usedRAM
            freeGB = $freeRAM
            usagePercent = $ramPercent
            type = $ramType
            speedMHz = $ramSpeed
            slotsUsed = $usedSlots
            slotsAvailable = $availableSlots
            modules = $moduleDetails
        }
        
        # Analyze issues
        if ($ramPercent -gt 95) {
            $result.status = "critical"
            $result.issues += @{
                severity = "critical"
                message = "Memory usage is critically high at $ramPercent%"
            }
            $result.recommendations += "Close memory-intensive applications immediately"
            $result.recommendations += "Consider adding more RAM"
        }
        elseif ($ramPercent -gt 85) {
            $result.status = "warning"
            $result.issues += @{
                severity = "warning"
                message = "Memory usage is high at $ramPercent%"
            }
            $result.recommendations += "Monitor memory usage and close unnecessary programs"
        }
        elseif ($ramPercent -gt 70) {
            $result.status = "warning"
            $result.issues += @{
                severity = "warning"
                message = "Memory usage is moderately high at $ramPercent%"
            }
            $result.recommendations += "Consider closing some background applications"
        }
        else {
            $result.status = "ok"
        }
        
        # Check for low total RAM
        if ($totalRAM -lt 4) {
            $result.issues += @{
                severity = "warning"
                message = "System has less than 4GB RAM"
            }
            $result.recommendations += "Consider upgrading to at least 8GB for better performance"
        }
        
        # Check for single channel (if dual channel available)
        if ($usedSlots -eq 1 -and $totalRAM -gt 8) {
            $result.issues += @{
                severity = "info"
                message = "Only one RAM slot is being used"
            }
            $result.recommendations += "Install a second RAM module to enable dual-channel for better performance"
        }
        
    }
    catch {
        $result.status = "error"
        $result.issues += @{
            severity = "error"
            message = "Error during RAM diagnostics: $_"
        }
    }
    
    return $result | ConvertTo-Json -Depth 5
}

Export-ModuleMember -Function Get-RamDiagnostics

