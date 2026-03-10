# ==============================================================================
# HACKRORE TECHTOOLKIT - MASTER EDITION v10.1
# BRAND: HackRore Diagnostics & Optimizer
# DEVELOPER: Ravindra Ahire
# PURPOSE: Unified diagnostic platform for technicians
# ==============================================================================

param(
    [Parameter(Position=0)]
    [string]$Mode = "menu",
    
    [switch]$Console,
    [switch]$Report,
    [switch]$QuickFix,
    [switch]$OpenReport,
    [string]$OutputPath = "$env:USERPROFILE\Desktop",
    [string]$ExportFormat = "html"
)

$ErrorActionPreference = "Continue"
$Script:Version = "10.1 Master"
$Script:Author = "Ravindra Ahire"
$Script:Brand = "HackRore Diagnostics & Optimizer"

# Get script root
$ScriptRoot = $PSScriptRoot
if (-not $ScriptRoot) { $ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path }
$ModulePath = "$ScriptRoot\modules"
$AutomationPath = "$ScriptRoot\automation"
$LogPath = "$ScriptRoot\logs"

# ============================================
# BOOTSTRAP
# ============================================

function Test-IsAdmin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Initialize-Environment {
    $dirs = @($ModulePath, $AutomationPath, "$ScriptRoot\reports", $LogPath)
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    $logFile = "$LogPath\hackrore.log"
    Add-Content -Path $logFile -Value $logEntry -ErrorAction SilentlyContinue
}

function Show-Banner {
    param([string]$subtitle = "")
    $isAdmin = Test-IsAdmin
    $adminTag = if ($isAdmin) { "[ADMIN]" } else { "[USER]" }
    
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "  HACKRORE TECHTOOLKIT - MASTER EDITION v$Script:Version $adminTag" -ForegroundColor Cyan
    Write-Host "  $Script:Brand" -ForegroundColor Cyan
    Write-Host "  Developer: $Script:Author" -ForegroundColor Gray
    Write-Host "======================================================================" -ForegroundColor Cyan
    if ($subtitle) { Write-Host "  $subtitle" -ForegroundColor Gray }
    Write-Host ""
}

# ============================================
# PROGRESS INDICATOR
# ============================================

function Write-ProgressBar {
    param([int]$Percent, [string]$Status = "Scanning...")
    Write-Host "`r[$('=' * [math]::Floor($Percent/5))$(' ' * (20 - [math]::Floor($Percent/5)))] $Percent% $Status" -NoNewline -ForegroundColor Cyan
}

# ============================================
# COLOR HELPERS
# ============================================

function Get-StatusColor {
    param([string]$Status)
    switch ($Status.ToLower()) {
        "ok" { return "Green" }
        "warning" { return "Yellow" }
        "critical" { return "Red" }
        "error" { return "Red" }
        default { return "White" }
    }
}

# ============================================
# DIAGNOSTICS ENGINE - All Modules
# ============================================

function Get-CpuDiagnostics {
    Write-ProgressBar -Percent 10 -Status "CPU..."
    $result = @{
        module = "cpu"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
        if ($cpu) {
            $cpuLoad = $cpu.LoadPercentage
            $result.data = @{
                name = $cpu.Name
                cores = $cpu.NumberOfCores
                threads = $cpu.NumberOfLogicalProcessors
                speedGHz = [math]::Round($cpu.MaxClockSpeed / 1000, 2)
                loadPercent = $cpuLoad
            }
            
            if ($cpuLoad -gt 90) {
                $result.status = "critical"
                $result.issues += @{ severity = "critical"; message = "CPU usage is critically high at $cpuLoad%" }
            }
            elseif ($cpuLoad -gt 70) {
                $result.status = "warning"
                $result.issues += @{ severity = "warning"; message = "CPU usage is elevated at $cpuLoad%" }
            }
            else { $result.status = "ok" }
        }
        else {
            $result.status = "error"
            $result.issues += @{ severity = "error"; message = "Could not detect CPU" }
        }
    }
    catch {
        $result.status = "error"
        $result.issues += @{ severity = "error"; message = "Error: $_" }
    }
    return $result
}

function Get-RamDiagnostics {
    Write-ProgressBar -Percent 20 -Status "RAM..."
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
        
        $totalGB = [math]::Round($cs.TotalPhysicalMemory / 1GB, 2)
        $freeGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
        $usedGB = [math]::Round($totalGB - $freeGB, 2)
        $usedPercent = [math]::Round(($usedGB / $totalGB) * 100, 1)
        
        $result.data = @{ totalGB = $totalGB; usedGB = $usedGB; freeGB = $freeGB; usagePercent = $usedPercent }
        
        if ($usedPercent -gt 90) {
            $result.status = "critical"
            $result.issues += @{ severity = "critical"; message = "Memory usage critical: $usedPercent%" }
            $result.recommendations += "Close applications or upgrade RAM immediately"
        }
        elseif ($usedPercent -gt 80) {
            $result.status = "warning"
            $result.issues += @{ severity = "warning"; message = "Memory usage high: $usedPercent%" }
        }
        else { $result.status = "ok" }
    }
    catch {
        $result.status = "error"
        $result.issues += @{ severity = "error"; message = "Error: $_" }
    }
    return $result
}

function Get-StorageDiagnostics {
    Write-ProgressBar -Percent 30 -Status "Storage..."
    $result = @{
        module = "storage"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $disks = @()
        foreach ($disk in (Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3")) {
            if ($disk.Size -gt 0) {
                $totalGB = [math]::Round($disk.Size / 1GB, 2)
                $freeGB = [math]::Round($disk.FreeSpace / 1GB, 2)
                $usedPercent = [math]::Round((($disk.Size - $disk.FreeSpace) / $disk.Size) * 100, 1)
                
                $disks += @{ drive = $disk.DeviceID; totalGB = $totalGB; freeGB = $freeGB; usedPercent = $usedPercent }
                
                if ($usedPercent -gt 95) {
                    $result.status = "critical"
                    $result.issues += @{ severity = "critical"; message = "Drive $($disk.DeviceID) nearly full: $usedPercent%" }
                }
                elseif ($usedPercent -gt 85) {
                    if ($result.status -ne "critical") { $result.status = "warning" }
                    $result.issues += @{ severity = "warning"; message = "Drive $($disk.DeviceID) filling up: $usedPercent%" }
                }
            }
        }
        $result.data = @{ drives = $disks }
        if ($result.status -eq "unknown") { $result.status = "ok" }
    }
    catch {
        $result.status = "error"
        $result.issues += @{ severity = "error"; message = "Error: $_" }
    }
    return $result
}

function Get-GpuDiagnostics {
    Write-ProgressBar -Percent 40 -Status "GPU..."
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
        foreach ($gpu in (Get-CimInstance Win32_VideoController)) {
            $vramMB = if ($gpu.AdapterRAM) { [math]::Round($gpu.AdapterRAM / 1MB, 0) } else { 0 }
            $gpus += @{ name = $gpu.Name; vramMB = $vramMB; driver = $gpu.DriverVersion }
        }
        $result.data = @{ gpus = $gpus }
        $result.status = if ($gpus.Count -gt 0) { "ok" } else { "warning" }
    }
    catch {
        $result.status = "error"
        $result.issues += @{ severity = "error"; message = "Error: $_" }
    }
    return $result
}

function Get-BatteryDiagnostics {
    Write-ProgressBar -Percent 50 -Status "Battery..."
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
        if ($bat) {
            $result.data = @{
                present = $true
                chargeLevel = $bat.EstimatedChargeRemaining
                status = switch ($bat.BatteryStatus) { 1 { "Discharging" } 2 { "AC Power" } 3 { "Fully Charged" } 6 { "Charging" } default { "Unknown" } }
            }
            $result.status = "ok"
        }
        else {
            $result.data = @{ present = $false }
            $result.status = "ok"
        }
    }
    catch {
        $result.status = "error"
    }
    return $result
}

function Get-BatteryWearReport {
    Write-ProgressBar -Percent 55 -Status "Battery Wear..."
    $result = @{
        module = "battery_wear"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $reportPath = "$env:TEMP\battery-report.xml"
        $null = powercfg /batteryreport /output $reportPath /xml 2>&1
        
        $wearPercent = 0
        $cycleCount = 0
        
        if (Test-Path $reportPath) {
            try {
                [xml]$xml = Get-Content $reportPath -ErrorAction SilentlyContinue
                $battery = $xml.BatteryReport.Batteries.Battery | Select-Object -First 1
                if ($battery) {
                    $designCap = [int]$battery.DesignCapacity
                    $fullCap = [int]$battery.FullChargeCapacity
                    if ($designCap -gt 0 -and $fullCap -gt 0) {
                        $wearPercent = [math]::Round((($designCap - $fullCap) / $designCap) * 100, 1)
                    }
                }
                $cycleCount = [int]($xml.BatteryReport.Batteries.Battery.CycleCount)
            }
            catch {}
        }
        Remove-Item $reportPath -ErrorAction SilentlyContinue
        
        $result.data = @{ wearPercent = $wearPercent; cycleCount = $cycleCount }
        
        if ($wearPercent -gt 40) {
            $result.status = "critical"
            $result.issues += @{ severity = "critical"; message = "Battery wear critical: $wearPercent%" }
            $result.recommendations += "Replace battery"
        }
        elseif ($wearPercent -gt 20) {
            $result.status = "warning"
            $result.issues += @{ severity = "warning"; message = "Battery wear moderate: $wearPercent%" }
        }
        else { $result.status = "ok" }
    }
    catch {
        $result.status = "error"
    }
    return $result
}

function Get-NetworkDiagnostics {
    Write-ProgressBar -Percent 60 -Status "Network..."
    $result = @{
        module = "network"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $adapters = @()
        foreach ($nic in (Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter=True")) {
            $adapters += @{ name = $nic.Name; mac = $nic.MACAddress; status = $nic.NetConnectionStatus }
        }
        $result.data = @{ adapters = $adapters }
        
        try {
            $ping = Test-Connection -ComputerName 8.8.8.8 -Count 1 -Quiet -ErrorAction SilentlyContinue
            $result.status = if ($ping) { "ok" } else { "warning" }
            if (-not $ping) { $result.issues += @{ severity = "warning"; message = "No internet connectivity" } }
        }
        catch {
            $result.status = "warning"
        }
    }
    catch {
        $result.status = "error"
    }
    return $result
}

function Get-ThermalDiagnostics {
    Write-ProgressBar -Percent 70 -Status "Thermal..."
    $result = @{
        module = "thermal"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $temp = Get-WmiObject MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($temp) {
            $tempC = [math]::Round(($temp.CurrentTemperature - 2732) / 10, 0)
            $result.data = @{ temperature = $tempC; unit = "C" }
            
            if ($tempC -gt 90) {
                $result.status = "critical"
                $result.issues += @{ severity = "critical"; message = "CPU temperature critical: ${tempC}C" }
                $result.recommendations += "Clean fans and replace thermal paste"
            }
            elseif ($tempC -gt 80) {
                $result.status = "warning"
                $result.issues += @{ severity = "warning"; message = "CPU temperature high: ${tempC}C" }
            }
            else { $result.status = "ok" }
        }
        else {
            $result.data = @{ note = "Temperature sensors not accessible" }
            $result.status = "ok"
        }
    }
    catch {
        $result.status = "ok"
        $result.data = @{ note = "Not available" }
    }
    return $result
}

function Get-DriverDiagnostics {
    Write-ProgressBar -Percent 80 -Status "Drivers..."
    $result = @{
        module = "drivers"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $problemDevices = @(Get-PnpDevice -ErrorAction SilentlyContinue | Where-Object { $_.Status -ne "OK" })
        $result.data = @{ problemCount = $problemDevices.Count }
    }
    catch {
        Write-Host "FAILED" -ForegroundColor Red
    }
    
    # GPU
    Write-Host "  [GPU] " -NoNewline -ForegroundColor Gray
    try {
        $gpuResult = Get-GpuDiagnostics
        $results.diagnostics["gpu"] = $gpuResult
        $totalScore += Get-HealthScore $gpuResult.status
        $moduleCount++
        Write-Host "OK" -ForegroundColor Green
    }
    catch {
        Write-Host "FAILED" -ForegroundColor Red
    }
    
    # Battery
    Write-Host "  [Battery] " -NoNewline -ForegroundColor Gray
    try {
        $batteryResult = Get-BatteryDiagnostics
        $results.diagnostics["battery"] = $batteryResult
        $totalScore += Get-HealthScore $batteryResult.status
        $moduleCount++
        Write-Host "OK" -ForegroundColor Green
    }
    catch {
        Write-Host "FAILED" -ForegroundColor Red
    }
    
    # Network
    Write-Host "  [Network] " -NoNewline -ForegroundColor Gray
    try {
        $networkResult = Get-NetworkDiagnostics
        $results.diagnostics["network"] = $networkResult
        $totalScore += Get-HealthScore $networkResult.status
        $moduleCount++
        Write-Host "OK" -ForegroundColor Green
    }
    catch {
        Write-Host "FAILED" -ForegroundColor Red
    }
    
    # Calculate overall health score
    if ($moduleCount -gt 0) {
        $results.healthScore = [math]::Round($totalScore / $moduleCount, 0)
    }
    
    # Collect all issues and recommendations
    foreach ($mod in $results.diagnostics.Values) {
        if ($mod.issues) {
            $mod.issues | ForEach-Object { $results.issues += $_ }
        }
        if ($mod.recommendations) {
            $mod.recommendations | ForEach-Object { $results.recommendations += $_ }
        }
    }
    
    Write-Log "Diagnostics complete. Health score: $($results.healthScore)%"
    
    return $results
}

function Get-HealthScore {
    param([string]$Status)
    switch ($Status) {
        "ok" { return 100 }
        "warning" { return 70 }
        "critical" { return 40 }
        "error" { return 20 }
        default { return 50 }
    }
}

# ============================================
# CONSOLE OUTPUT
# ============================================

function Show-ConsoleDiagnostics {
    param([hashtable]$Results)
    
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "                    HACKRORE DIAGNOSTICS RESULTS" -ForegroundColor Cyan
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # System Info
    $comp = $Results.computer
    Write-Host " SYSTEM INFORMATION" -ForegroundColor White
    Write-Host " ----------------------------------------------------------------------"
    Write-Host " Manufacturer : " -NoNewline -ForegroundColor Gray
    Write-Host $comp.manufacturer -ForegroundColor White
    Write-Host " Model       : " -NoNewline -ForegroundColor Gray
    Write-Host $comp.model -ForegroundColor White
    Write-Host " Type        : " -NoNewline -ForegroundColor Gray
    Write-Host $comp.formFactor -ForegroundColor White
    Write-Host " Serial      : " -NoNewline -ForegroundColor Gray
    Write-Host $comp.serial -ForegroundColor White
    Write-Host " OS          : " -NoNewline -ForegroundColor Gray
    Write-Host $comp.os -ForegroundColor White
    Write-Host " Uptime      : " -NoNewline -ForegroundColor Gray
    Write-Host $comp.uptime -ForegroundColor White
    Write-Host ""
    
    # Hardware Summary
    if ($Results.diagnostics.cpu) {
        $cpu = $Results.diagnostics.cpu.data
        Write-Host " CPU          : " -NoNewline -ForegroundColor Gray
        Write-Host "$($cpu.name) ($($cpu.cores) cores)" -ForegroundColor White
        Write-Host " CPU Usage    : " -NoNewline -ForegroundColor Gray
        Write-Host "$($cpu.loadPercent)%" -ForegroundColor White
    }
    
    if ($Results.diagnostics.ram) {
        $ram = $Results.diagnostics.ram.data
        Write-Host " RAM          : " -NoNewline -ForegroundColor Gray
        Write-Host "$($ram.usedGB) GB / $($ram.totalGB) GB ($($ram.usagePercent)%)" -ForegroundColor White
    }
    
    if ($Results.diagnostics.storage) {
        $storage = $Results.diagnostics.storage.data
        if ($storage.drives) {
            foreach ($d in $storage.drives) {
                Write-Host " Disk $($d.drive)    : " -NoNewline -ForegroundColor Gray
                Write-Host "$([math]::Round($d.freeGB,1)) GB free of $([math]::Round($d.totalGB,1)) GB" -ForegroundColor White
            }
        }
    }
    
    if ($Results.diagnostics.battery -and $Results.diagnostics.battery.data.present) {
        $bat = $Results.diagnostics.battery.data
        Write-Host " Battery      : " -NoNewline -ForegroundColor Gray
        Write-Host "$($bat.chargeLevel)% ($($bat.status))" -ForegroundColor White
    }
    
    Write-Host ""
    
    # Health Score
    $scoreColor = if ($Results.healthScore -gt 70) { "Green" } elseif ($Results.healthScore -gt 40) { "Yellow" } else { "Red" }
    Write-Host " SYSTEM HEALTH SCORE" -ForegroundColor White
    Write-Host " ----------------------------------------------------------------------"
    Write-Host " Overall Score: " -NoNewline -ForegroundColor White
    Write-Host "$($Results.healthScore)%" -ForegroundColor $scoreColor
    Write-Host ""
    
    # Issues
    if ($Results.issues.Count -gt 0) {
        Write-Host " ISSUES DETECTED" -ForegroundColor White
        Write-Host " ----------------------------------------------------------------------"
        foreach ($issue in $Results.issues) {
            $sevColor = switch ($issue.severity) { "critical" { "Red" } "warning" { "Yellow" } default { "Cyan" } }
            Write-Host " [!] [$($issue.severity.ToUpper())] $($issue.message)" -ForegroundColor $sevColor
        }
        Write-Host ""
    }
    
    # Recommendations
    if ($Results.recommendations.Count -gt 0) {
        Write-Host " RECOMMENDATIONS" -ForegroundColor White
        Write-Host " ----------------------------------------------------------------------"
        $recCount = 1
        foreach ($rec in $Results.recommendations | Select-Object -Unique | Select-Object -First 5) {
            Write-Host " $recCount. $rec" -ForegroundColor Gray
            $recCount++
        }
        Write-Host ""
    }
    
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host " Diagnostics Complete | Version $($Results.version)" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
}

# ============================================
# HTML REPORT
# ============================================

function New-HTMLReport {
    param([hashtable]$Results, [string]$Path)
    
    $comp = $Results.computer
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>HackRore Diagnostics Report</title>
    <style>
        body { font-family: 'Segoe UI', Arial; background: linear-gradient(135deg, #1a1a2e, #16213e); color: #e2e8f0; padding: 20px; margin: 0; min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #0f172a, #1e3a5f); padding: 30px; border-radius: 16px; margin-bottom: 20px; border: 2px solid #06b6d4; }
        .header h1 { margin: 0 0 10px 0; color: #fff; font-size: 28px; }
        .header p { margin: 0; color: #38bdf8; }
        .score-box { background: linear-gradient(135deg, #06b6d4, #0891b2); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px; }
        .score-value { font-size: 64px; font-weight: bold; color: #fff; }
        .score-label { color: rgba(255,255,255,0.8); font-size: 14px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 20px; }
        .card { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1); }
        .card h3 { margin: 0 0 16px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .label { color: #94a3b8; }
        .value { font-weight: bold; }
        .issue { padding: 10px; border-radius: 6px; margin: 8px 0; }
        .issue.critical { background: rgba(239,68,68,0.2); border-left: 4px solid #ef4444; color: #fca5a5; }
        .issue.warning { background: rgba(245,158,11,0.2); border-left: 4px solid #f59e0b; color: #fcd34d; }
        .footer { text-align: center; color: #64748b; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>HackRore Diagnostics Report</h1>
            <p>$($comp.manufacturer) $($comp.model) | $($comp.formFactor)</p>
            <p style="color:#94a3b8;font-size:12px;margin-top:10px;">Serial: $($comp.serial) | $($comp.os) (Build $($comp.osBuild))</p>
        </div>
        
        <div class="score-box">
            <div class="score-value">$($Results.healthScore)%</div>
            <div class="score-label">SYSTEM HEALTH SCORE</div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>System</h3>
                <div class="row"><span class="label">Manufacturer</span><span class="value">$($comp.manufacturer)</span></div>
                <div class="row"><span class="label">Model</span><span class="value">$($comp.model)</span></div>
                <div class="row"><span class="label">Type</span><span class="value">$($comp.formFactor)</span></div>
                <div class="row"><span class="label">Uptime</span><span class="value">$($comp.uptime)</span></div>
            </div>
"@
    
    # Add CPU info
    if ($Results.diagnostics.cpu) {
        $cpu = $Results.diagnostics.cpu.data
        $html += @"
            <div class="card">
                <h3>Processor</h3>
                <div class="row"><span class="label">CPU</span><span class="value">$($cpu.name)</span></div>
                <div class="row"><span class="label">Cores/Threads</span><span class="value">$($cpu.cores) / $($cpu.threads)</span></div>
                <div class="row"><span class="label">Speed</span><span class="value">$($cpu.speedGHz) GHz</span></div>
                <div class="row"><span class="label">Usage</span><span class="value">$($cpu.loadPercent)%</span></div>
            </div>
"@
    }
    
    # Add RAM info
    if ($Results.diagnostics.ram) {
        $ram = $Results.diagnostics.ram.data
        $html += @"
            <div class="card">
                <h3>Memory</h3>
                <div class="row"><span class="label">Total</span><span class="value">$($ram.totalGB) GB</span></div>
                <div class="row"><span class="label">Used</span><span class="value">$($ram.usedGB) GB</span></div>
                <div class="row"><span class="label">Free</span><span class="value">$($ram.freeGB) GB</span></div>
                <div class="row"><span class="label">Usage</span><span class="value">$($ram.usagePercent)%</span></div>
            </div>
"@
    }
    
    # Add Storage info
    if ($Results.diagnostics.storage -and $Results.diagnostics.storage.data.drives) {
        $html += "<div class='card'><h3>Storage</h3>"
        foreach ($d in $Results.diagnostics.storage.data.drives) {
            $html += "<div class='row'><span class='label'>$($d.drive)</span><span class='value'>$($d.freeGB) GB free</span></div>"
        }
        $html += "</div>"
    }
    
    # Add Battery info
    if ($Results.diagnostics.battery -and $Results.diagnostics.battery.data.present) {
        $bat = $Results.diagnostics.battery.data
        $html += @"
            <div class="card">
                <h3>Battery</h3>
                <div class="row"><span class="label">Charge</span><span class="value">$($bat.chargeLevel)%</span></div>
                <div class="row"><span class="label">Status</span><span class="value">$($bat.status)</span></div>
            </div>
"@
    }
    
    # Add issues
    if ($Results.issues.Count -gt 0) {
        $html += "<div class='card'><h3>Issues</h3>"
        foreach ($issue in $Results.issues) {
            $cssClass = if ($issue.severity -eq "critical") { "critical" } elseif ($issue.severity -eq "warning") { "warning" } else { "" }
            $html += "<div class='issue $cssClass'>$($issue.message)</div>"
        }
        $html += "</div>"
    }
    
    $html += @"
        </div>
        <div class="footer">
            <p>HackRore Diagnostics v$($Results.version) | Generated $($Results.timestamp)</p>
        </div>
    </div>
</body>
</html>
"@
    
    $html | Out-File -FilePath $Path -Encoding UTF8
    Write-Host "Report saved: $Path" -ForegroundColor Green
}

# ============================================
# MAIN MENU
# ============================================

function Show-MainMenu {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "                    HACKRORE TECHTOOLKIT v10.0" -ForegroundColor Cyan
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1] Run Full Diagnostics       - Complete system scan" -ForegroundColor White
    Write-Host "  [2] Generate HTML Report       - Beautiful visual report" -ForegroundColor White
    Write-Host "  [0] Exit                        - Quit application" -ForegroundColor Gray
    Write-Host ""
}

# ============================================
# MAIN ENTRY POINT
# ============================================

Initialize-Environment
Write-Log "HackRore TechToolkit v$Script:Version started"

# Handle command line arguments
$Mode = $Mode.ToLower()

if ($Console -or $Mode -eq "console" -or $Mode -eq "detect") {
    Show-Banner "Running Diagnostics..."
    $results = Get-SystemDiagnostics
    Show-ConsoleDiagnostics -Results $results
}
elseif ($Report -or $Mode -eq "report" -or $Mode -eq "html") {
    Show-Banner "Generating Report..."
    $results = Get-SystemDiagnostics
    $reportPath = "$OutputPath\HackRore_Report_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
    New-HTMLReport -Results $results -Path $reportPath
    if ($OpenReport) {
        Start-Process $reportPath
    }
}
else {
    # Interactive menu mode
    $running = $true
    while ($running) {
        Show-Banner
        Show-MainMenu
        $choice = Read-Host "Select option (0-2)"
        
        switch ($choice) {
            "1" {
                $results = Get-SystemDiagnostics
                Show-ConsoleDiagnostics -Results $results
                Write-Host ""
                Read-Host "Press Enter to continue"
            }
            "2" {
                $results = Get-SystemDiagnostics
                $reportPath = "$OutputPath\HackRore_Report_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
                New-HTMLReport -Results $results -Path $reportPath
                Write-Host ""
                Write-Host "Report saved to: $reportPath" -ForegroundColor Green
                Read-Host "Press Enter to open report"
                Start-Process $reportPath
            }
            "0" {
                Write-Host "Goodbye!" -ForegroundColor Cyan
                Write-Log "HackRore TechToolkit closed"
                $running = $false
            }
        }
    }
}

Write-Log "HackRore TechToolkit ended"

