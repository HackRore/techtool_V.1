# =============================================================================
# HackRore TechToolkit - GPU Diagnostics Module
# Version 1.0
# Detects graphics card information, drivers, and issues
# =============================================================================

function Get-GpuDiagnostics {
    <#
    .SYNOPSIS
    Performs GPU diagnostics and returns structured JSON result
    #>
    
    $result = @{
        module = "gpu"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $gpus = @()
        
        foreach ($gpu in (Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue)) {
            $vramMB = 0
            if ($gpu.AdapterRAM -and $gpu.AdapterRAM -gt 0) {
                $vramMB = [math]::Round($gpu.AdapterRAM / 1MB, 0)
            }
            
            # Determine if dedicated or integrated
            $gpuType = "Integrated"
            if ($vramMB -gt 512) { $gpuType = "Dedicated" }
            
            # Get current resolution
            $resolution = "Unknown"
            if ($gpu.CurrentHorizontalResolution -and $gpu.CurrentVerticalResolution) {
                $resolution = "$($gpu.CurrentHorizontalResolution)x$($gpu.CurrentVerticalResolution)"
            }
            
            $gpus += @{
                name = $gpu.Name
                type = $gpuType
                vramMB = $vramMB
                vramDisplay = if ($vramMB -gt 0) { "${vramMB}MB" } else { "Shared" }
                driverVersion = $gpu.DriverVersion
                driverDate = $gpu.DriverDate
                resolution = $resolution
                status = $gpu.Status
            }
        }
        
        $result.data = @{
            gpuCount = $gpus.Count
            gpus = $gpus
        }
        
        # Analyze issues
        $hasIssues = $false
        
        foreach ($gpu in $gpus) {
            # Check for outdated drivers
            if ($gpu.driverDate) {
                try {
                    $driverAge = (Get-Date) - $gpu.driverDate
                    if ($driverAge.Days -gt 365) {
                        $result.issues += @{
                            severity = "warning"
                            message = "GPU driver is over 1 year old"
                        }
                        $result.recommendations += "Update $($gpu.name) driver for better performance and security"
                        $hasIssues = $true
                    }
                }
                catch {}
            }
            
            # Check for low VRAM on dedicated GPU
            if ($gpu.type -eq "Dedicated" -and $gpu.vramMB -lt 2048) {
                $result.issues += @{
                    severity = "info"
                    message = "Dedicated GPU has less than 2GB VRAM"
                }
                $result.recommendations += "Consider upgrading GPU for better gaming performance"
                $hasIssues = $true
            }
            
            # Check for GPU errors
            if ($gpu.status -ne "OK") {
                $result.status = "error"
                $result.issues += @{
                    severity = "critical"
                    message = "GPU status: $($gpu.status)"
                }
                $result.recommendations += "Reinstall GPU drivers or check hardware"
                $hasIssues = $true
            }
        }
        
        # Check for no GPU detected
        if ($gpus.Count -eq 0) {
            $result.issues += @{
                severity = "warning"
                message = "No GPU detected"
            }
            $result.recommendations += "Check display adapter installation"
        }
        
        if (-not $hasIssues -and $result.status -ne "error") {
            $result.status = "ok"
        }
        elseif ($result.status -ne "error" -and $result.status -ne "unknown") {
            # Keep warning status
        }
        elseif ($result.status -eq "unknown") {
            $result.status = "ok"
        }
        
    }
    catch {
        $result.status = "error"
        $result.issues += @{
            severity = "error"
            message = "Error during GPU diagnostics: $_"
        }
    }
    
    return $result | ConvertTo-Json -Depth 5
}

Export-ModuleMember -Function Get-GpuDiagnostics

