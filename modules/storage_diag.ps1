# =============================================================================
# HackRore TechToolkit - Storage Diagnostics Module
# Version 1.0
# Detects storage devices, SMART status, and issues
# =============================================================================

function Get-StorageDiagnostics {
    <#
    .SYNOPSIS
    Performs storage diagnostics and returns structured JSON result
    #>
    
    $result = @{
        module = "storage"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $drives = @()
        $logicalDisks = Get-CimInstance Win32_LogicalDisk -ErrorAction SilentlyContinue | Where-Object { $_.DriveType -eq 3 }
        
        # Get physical disk information
        $physicalDisks = Get-CimInstance Win32_DiskDrive -ErrorAction SilentlyContinue
        
        foreach ($disk in $physicalDisks) {
            $sizeGB = [math]::Round($disk.Size / 1GB, 0)
            $mediaType = if ($disk.Model -match "SSD|NVMe|M.2") { "SSD" } else { "HDD" }
            
            # Determine interface type
            $interface = "Unknown"
            if ($disk.Model -match "NVMe") { $interface = "NVMe" }
            elseif ($disk.InterfaceType -match "SCSI") { $interface = "SATA" }
            else { $interface = $disk.InterfaceType }
            
            # Determine form factor
            $formFactor = "Unknown"
            if ($interface -eq "NVMe") { $formFactor = "M.2 NVMe" }
            elseif ($mediaType -eq "SSD") { $formFactor = "SATA SSD" }
            else { $formFactor = "3.5 HDD" }
            
            # Try to get SMART data
            $smartStatus = "Unknown"
            try {
                $smartData = Get-WmiObject -Namespace "ROOT\WMI" -Class "MSStorageDriver_ATAPISmartData" -ErrorAction SilentlyContinue | Where-Object { $_.InstanceName -match $disk.PNPDeviceID }
                if ($smartData) {
                    $smartBytes = $smartData.VendorSpecific
                    # Check for SMART attributes (byte 2 = ID, byte 3-8 = value)
                    if ($smartBytes -and $smartBytes.Length -gt 5) {
                        $smartStatus = "Available"
                    }
                }
            }
            catch {}
            
            $drives += @{
                model = $disk.Model
                sizeGB = $sizeGB
                mediaType = $mediaType
                interface = $interface
                formFactor = $formFactor
                firmware = $disk.FirmwareRevision
                serial = $disk.SerialNumber
                smartStatus = $smartStatus
                status = if ($disk.Status -eq "OK") { "Healthy" } else { $disk.Status }
            }
        }
        
        # Get logical disk (partition) information
        $partitions = @()
        foreach ($disk in $logicalDisks) {
            if ($disk.Size -gt 0) {
                $totalGB = [math]::Round($disk.Size / 1GB, 2)
                $freeGB = [math]::Round($disk.FreeSpace / 1GB, 2)
                $usedGB = [math]::Round($totalGB - $freeGB, 2)
                $usedPercent = [math]::Round(($usedGB / $totalGB) * 100, 1)
                
                $partitions += @{
                    drive = $disk.DeviceID
                    volumeName = $disk.VolumeName
                    totalGB = $totalGB
                    usedGB = $usedGB
                    freeGB = $freeGB
                    usagePercent = $usedPercent
                    fileSystem = $disk.FileSystem
                }
            }
        }
        
        $result.data = @{
            physicalDrives = $drives
            partitions = $partitions
        }
        
        # Analyze issues from partitions
        $hasIssues = $false
        foreach ($part in $partitions) {
            if ($part.usagePercent -gt 95) {
                $result.status = "critical"
                $hasIssues = $true
                $result.issues += @{
                    severity = "critical"
                    message = "Drive $($part.drive) is critically low on space ($($part.usagePercent)% used)"
                }
                $result.recommendations += "Free up space on $($part.drive) immediately - delete temporary files, unused programs, or move data to another drive"
            }
            elseif ($part.usagePercent -gt 90) {
                $result.status = "warning"
                $hasIssues = $true
                $result.issues += @{
                    severity = "warning"
                    message = "Drive $($part.drive) is running low on space ($($part.usagePercent)% used)"
                }
                $result.recommendations += "Consider freeing up space on $($part.drive)"
            }
            elseif ($part.usagePercent -gt 80) {
                if ($result.status -ne "warning") { $result.status = "warning" }
                $hasIssues = $true
                $result.issues += @{
                    severity = "warning"
                    message = "Drive $($part.drive) is filling up ($($part.usagePercent)% used)"
                }
            }
        }
        
        # Check for HDD vs SSD
        foreach ($drive in $drives) {
            if ($drive.mediaType -eq "HDD") {
                $result.issues += @{
                    severity = "info"
                    message = "System uses HDD - consider upgrading to SSD for better performance"
                }
                $result.recommendations += "Upgrading from HDD to SSD will significantly improve system responsiveness"
                break
            }
        }
        
        if (-not $hasIssues) {
            $result.status = "ok"
        }
        
    }
    catch {
        $result.status = "error"
        $result.issues += @{
            severity = "error"
            message = "Error during storage diagnostics: $_"
        }
    }
    
    return $result | ConvertTo-Json -Depth 5
}

Export-ModuleMember -Function Get-StorageDiagnostics

