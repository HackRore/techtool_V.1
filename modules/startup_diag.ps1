# =============================================================================
# HackRore TechToolkit - Startup & Boot Diagnostics
# Version 1.0
# Analyzes boot time and startup programs
# =============================================================================

function Get-StartupDiagnostics {
    <#
    .SYNOPSIS
    Performs startup and boot time diagnostics
    #>
    
    $result = @{
        module = "startup"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $os = Get-CimInstance Win32_OperatingSystem
        $bootTime = (Get-Date) - $os.LastBootUpTime
        $bootSeconds = [math]::Round($bootTime.TotalSeconds, 0)
        $bootMinutes = [math]::Round($bootTime.TotalMinutes, 0)
        $bootHours = [math]::Round($bootTime.TotalHours, 1)
        
        # Calculate approximate boot time (uptime doesn't give boot time directly)
        # We use uptime and current time to estimate
        $bootTimeStr = "$bootMinutes minutes ($bootHours hours uptime)"
        
        # Get startup programs
        $startupPrograms = @()
        
        # Check registry startup
        try {
            $regStartups = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -ErrorAction SilentlyContinue
            $regStartups2 = Get-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -ErrorAction SilentlyContinue
            
            $propNames = $regStartups.PSObject.Properties.Name | Where-Object { $_ -notlike "PS*" }
            foreach ($name in $propNames) {
                $startupPrograms += @{
                    name = $name
                    location = "Registry (Machine)"
                    command = $regStartups.$name
                }
            }
            
            $propNames2 = $regStartups2.PSObject.Properties.Name | Where-Object { $_ -notlike "PS*" }
            foreach ($name in $propNames2) {
                $startupPrograms += @{
                    name = $name
                    location = "Registry (User)"
                    command = $regStartups2.$name
                }
            }
        }
        catch {}
        
        # Check startup folder
        try {
            $startupFolder = [Environment]::GetFolderPath("Startup")
            if (Test-Path $startupFolder) {
                $folderItems = Get-ChildItem $startupFolder -ErrorAction SilentlyContinue
                foreach ($item in $folderItems) {
                    $startupPrograms += @{
                        name = $item.Name
                        location = "Startup Folder"
                        command = $item.FullName
                    }
                }
            }
        }
        catch {}
        
        # Check scheduled tasks that run at startup
        $scheduledStartup = @()
        try {
            $tasks = Get-ScheduledTask -ErrorAction SilentlyContinue | Where-Object { $_.Triggers | Where-Object { $_ -is [Microsoft.PowerShell.Cmdletization.GeneratedTypes.ScheduledTask.CIM_TriggerBase] -and $_.CimClass.CimClassName -match "Boot|Logon" } }
            foreach ($task in $tasks) {
                $scheduledStartup += @{
                    name = $task.TaskName
                    state = $task.State
                    path = $task.TaskPath
                }
            }
        }
        catch {}
        
        $result.data = @{
            uptime = @{
                days = $bootTime.Days
                hours = $bootTime.Hours
                minutes = $bootTime.Minutes
                seconds = $bootTime.Seconds
                totalMinutes = $bootMinutes
                totalSeconds = $bootSeconds
            }
            lastBootTime = $os.LastBootUpTime.ToString("yyyy-MM-dd HH:mm:ss")
            startupPrograms = $startupPrograms
            scheduledStartup = $scheduledStartup
            startupProgramCount = $startupPrograms.Count
            scheduledTaskCount = $scheduledStartup.Count
        }
        
        # Analyze startup impact
        if ($startupPrograms.Count -gt 10) {
            $result.issues += @{
                severity = "warning"
                message = "High number of startup programs: $($startupPrograms.Count)"
            }
            $result.recommendations += "Consider disabling unnecessary startup programs to improve boot time"
        }
        
        # Check for scheduled tasks that might slow boot
        if ($scheduledStartup.Count -gt 15) {
            $result.issues += @{
                severity = "info"
                message = "Many scheduled tasks running at startup: $($scheduledStartup.Count)"
            }
        }
        
        # Check for recent reboot
        if ($bootTime.TotalMinutes -lt 5) {
            $result.issues += @{
                severity = "info"
                message = "System recently rebooted - results may not be accurate"
            }
        }
        
        $result.status = "ok"
        
    }
    catch {
        $result.status = "error"
        $result.issues += @{
            severity = "error"
            message = "Error during startup diagnostics: $_"
        }
    }
    
    return $result | ConvertTo-Json -Depth 5
}

Export-ModuleMember -Function Get-StartupDiagnostics

