# ============================================================
#  HackRore TechToolkit - Master Scanning Engine
#  Version: 2.4
#  Author:  Ravindra | CyberTechX
#  GitHub:  github.com/ravindra/HackRore
# ============================================================
#  Usage:
#    .\HackRore_Master.ps1              → Full scan
#    .\HackRore_Master.ps1 -Mode refurb → Refurbishment mode
#    .\HackRore_Master.ps1 -Mode quick  → Quick health check
# ============================================================

param(
    [string]$Mode = "full",
    [string]$OutputDir = "$PSScriptRoot\Reports",
    [switch]$NoHTML,
    [switch]$Silent
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "SilentlyContinue"

# ── Colours ──────────────────────────────────────────────────
function Write-OK    { param($m) if (!$Silent) { Write-Host "  [OK]  $m" -ForegroundColor Green  } }
function Write-WARN  { param($m) if (!$Silent) { Write-Host "  [!!]  $m" -ForegroundColor Yellow } }
function Write-CRIT  { param($m) if (!$Silent) { Write-Host "  [XX]  $m" -ForegroundColor Red    } }
function Write-INFO  { param($m) if (!$Silent) { Write-Host "  [>>]  $m" -ForegroundColor Cyan   } }
function Write-HEAD  { param($m) if (!$Silent) { Write-Host "`n  ===  $m  ===" -ForegroundColor White } }

# ── Banner ────────────────────────────────────────────────────
if (!$Silent) {
    Clear-Host
    Write-Host @"

  ██╗  ██╗ █████╗  ██████╗██╗  ██╗██████╗  ██████╗ ██████╗ ███████╗
  ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██╔════╝
  ███████║███████║██║     █████╔╝ ██████╔╝██║   ██║██████╔╝█████╗
  ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══██╗██║   ██║██╔══██╗██╔══╝
  ██║  ██║██║  ██║╚██████╗██║  ██╗██║  ██║╚██████╔╝██║  ██║███████╗
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝

  TechToolkit v2.4  |  AI-Powered Diagnostics  |  Mode: $($Mode.ToUpper())
  ─────────────────────────────────────────────────────────────────────
"@ -ForegroundColor Cyan
}

# ── Output folder ─────────────────────────────────────────────
if (!(Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }
$timestamp  = Get-Date -Format "yyyyMMdd_HHmmss"
$jsonPath   = "$OutputDir\HackRore_$timestamp.json"
$htmlPath   = "$OutputDir\HackRore_$timestamp.html"

# ============================================================
#  MODULE 1 — SYSTEM IDENTITY
# ============================================================
Write-HEAD "MODULE 1: SYSTEM IDENTITY"

$cs    = Get-CimInstance Win32_ComputerSystem
$bios  = Get-CimInstance Win32_BIOS
$os    = Get-CimInstance Win32_OperatingSystem
$board = Get-CimInstance Win32_BaseBoard

$systemInfo = [ordered]@{
    manufacturer  = $cs.Manufacturer
    model         = $cs.Model
    serial        = $bios.SerialNumber
    biosVersion   = $bios.SMBIOSBIOSVersion
    biosDate      = ($bios.ReleaseDate).ToString("yyyy-MM-dd")
    osName        = $os.Caption
    osBuild       = $os.BuildNumber
    osArch        = $os.OSArchitecture
    lastBoot      = ($os.LastBootUpTime).ToString("yyyy-MM-dd HH:mm")
    uptime        = [math]::Round(((Get-Date) - $os.LastBootUpTime).TotalHours, 1)
    domainRole    = switch($cs.DomainRole){ 0{"Standalone"} 1{"Member"} 2{"DC"} default{"Unknown"} }
    pcType        = switch($cs.PCSystemType){ 1{"Desktop"} 2{"Laptop"} 3{"Workstation"} default{"Unknown"} }
    motherboard   = "$($board.Manufacturer) $($board.Product)"
}

Write-OK "Model: $($systemInfo.model)"
Write-OK "Serial: $($systemInfo.serial)"
Write-OK "OS: $($systemInfo.osName)"

# ── Windows Activation ───────────────────────────────────────
$licStatus = (Get-CimInstance SoftwareLicensingProduct -Filter "Name like 'Windows%' AND PartialProductKey IS NOT NULL").LicenseStatus
$activationStatus = switch($licStatus) { 1{"Activated"} 0{"Unlicensed"} 5{"Notification"} default{"Unknown ($licStatus)"} }
$systemInfo["activation"] = $activationStatus
if ($licStatus -eq 1) { Write-OK "Activation: $activationStatus" } else { Write-CRIT "Activation: $activationStatus" }

# ============================================================
#  MODULE 2 — CPU
# ============================================================
Write-HEAD "MODULE 2: PROCESSOR"

$proc = Get-CimInstance Win32_Processor | Select-Object -First 1

# CPU Load (sample over 2 seconds)
$cpuLoad = (Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 1 -MaxSamples 2).CounterSamples.CookedValue | Measure-Object -Average | Select-Object -ExpandProperty Average

$cpuInfo = [ordered]@{
    name         = $proc.Name.Trim()
    manufacturer = $proc.Manufacturer
    socket       = $proc.SocketDesignation
    cores        = $proc.NumberOfCores
    threads      = $proc.NumberOfLogicalProcessors
    maxSpeedMHz  = $proc.MaxClockSpeed
    currentMHz   = $proc.CurrentClockSpeed
    l2CacheKB    = [math]::Round($proc.L2CacheSize / 1, 0)
    l3CacheKB    = [math]::Round($proc.L3CacheSize / 1, 0)
    loadPercent  = [math]::Round($cpuLoad, 1)
    architecture = $proc.Architecture
}

# CPU Temperature via WMI (requires hardware vendor support)
try {
    $cpuTempRaw = (Get-CimInstance -Namespace "root/wmi" -ClassName "MSAcpi_ThermalZoneTemperature" -ErrorAction Stop).CurrentTemperature
    $cpuInfo["tempCelsius"] = [math]::Round(($cpuTempRaw / 10) - 273.15, 1)
} catch {
    $cpuInfo["tempCelsius"] = $null
    $cpuInfo["tempNote"]    = "WMI thermal not available - use HWiNFO for temps"
}

Write-OK "CPU: $($cpuInfo.name)"
Write-OK "Cores/Threads: $($cpuInfo.cores)C / $($cpuInfo.threads)T"
Write-INFO "Current Load: $($cpuInfo.loadPercent)%"
if ($cpuInfo.tempCelsius) {
    if ($cpuInfo.tempCelsius -gt 90)  { Write-CRIT "Temp: $($cpuInfo.tempCelsius)°C — CRITICAL" }
    elseif ($cpuInfo.tempCelsius -gt 80) { Write-WARN "Temp: $($cpuInfo.tempCelsius)°C — High" }
    else { Write-OK "Temp: $($cpuInfo.tempCelsius)°C" }
}

# ============================================================
#  MODULE 3 — MEMORY
# ============================================================
Write-HEAD "MODULE 3: MEMORY"

$ramModules = Get-CimInstance Win32_PhysicalMemory
$os2        = Get-CimInstance Win32_OperatingSystem

$ramInfo = [ordered]@{
    totalGB       = [math]::Round($cs.TotalPhysicalMemory / 1GB, 2)
    availableGB   = [math]::Round($os2.FreePhysicalMemory / 1MB, 2)
    usedPercent   = [math]::Round((($cs.TotalPhysicalMemory - ($os2.FreePhysicalMemory * 1KB)) / $cs.TotalPhysicalMemory) * 100, 1)
    slots         = $ramModules.Count
    modules       = @()
}

foreach ($mod in $ramModules) {
    $ramInfo.modules += [ordered]@{
        slot         = $mod.DeviceLocator
        capacityGB   = [math]::Round($mod.Capacity / 1GB, 0)
        speedMHz     = $mod.ConfiguredClockSpeed
        type         = switch($mod.SMBIOSMemoryType){ 26{"DDR4"} 34{"DDR5"} 24{"DDR3"} default{"DDR ($($mod.SMBIOSMemoryType))"} }
        manufacturer = $mod.Manufacturer
        partNumber   = $mod.PartNumber.Trim()
    }
}

Write-OK "Total RAM: $($ramInfo.totalGB) GB"
Write-OK "Slots populated: $($ramInfo.slots)"
Write-INFO "Usage: $($ramInfo.usedPercent)%"
foreach ($m in $ramInfo.modules) { Write-OK "  Slot $($m.slot): $($m.capacityGB)GB $($m.type) @ $($m.speedMHz) MHz" }

# ============================================================
#  MODULE 4 — STORAGE + SMART
# ============================================================
Write-HEAD "MODULE 4: STORAGE"

$disks      = Get-CimInstance Win32_DiskDrive
$diskInfo   = @()

foreach ($disk in $disks) {
    $entry = [ordered]@{
        model        = $disk.Model
        serialNumber = $disk.SerialNumber.Trim()
        sizeGB       = [math]::Round($disk.Size / 1GB, 0)
        interface    = $disk.InterfaceType
        mediaType    = $disk.MediaType
        status       = $disk.Status
        partitions   = $disk.Partitions
    }

    # Determine interface type more precisely
    if ($disk.Model -match "NVMe|NVME") {
        $entry["storageType"] = "NVMe SSD"
    } elseif ($disk.InterfaceType -eq "SCSI" -and $disk.Model -notmatch "USB") {
        $entry["storageType"] = "SATA SSD/HDD"
    } elseif ($disk.InterfaceType -eq "USB") {
        $entry["storageType"] = "USB Storage"
    } else {
        $entry["storageType"] = $disk.InterfaceType
    }

    # SMART via MSStorageDriver
    try {
        $smart = Get-CimInstance -Namespace root\wmi -ClassName MSStorageDriver_FailurePredictStatus -ErrorAction Stop
        foreach ($s in $smart) {
            if ($s.InstanceName -like "*$($disk.PNPDeviceID.Replace('\','_'))*" -or $smart.Count -eq 1) {
                $entry["smartOK"]       = !$s.PredictFailure
                $entry["smartStatus"]   = if (!$s.PredictFailure) { "Healthy" } else { "FAILURE PREDICTED" }
                $entry["smartReason"]   = $s.Reason
                break
            }
        }
    } catch {
        $entry["smartOK"]     = $null
        $entry["smartStatus"] = "SMART unavailable"
    }

    $diskInfo += $entry

    $typeTag = $entry["storageType"]
    if ($entry["smartOK"] -eq $false) { Write-CRIT "Disk: $($entry.model) — SMART FAILURE PREDICTED" }
    elseif ($entry["smartOK"] -eq $true) { Write-OK "Disk: $($entry.model) [$typeTag] SMART OK" }
    else { Write-WARN "Disk: $($entry.model) [$typeTag] SMART status unknown" }
}

# Volume / partition usage
$volumes = @()
foreach ($vol in (Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root })) {
    $usedGB = [math]::Round(($vol.Used) / 1GB, 1)
    $freeGB = [math]::Round(($vol.Free) / 1GB, 1)
    $totalGB = $usedGB + $freeGB
    if ($totalGB -gt 0) {
        $pct = [math]::Round(($usedGB / $totalGB) * 100, 1)
        $volumes += [ordered]@{ drive = $vol.Root; usedGB = $usedGB; freeGB = $freeGB; totalGB = $totalGB; usedPercent = $pct }
        if ($pct -gt 90) { Write-CRIT "Volume $($vol.Root) at $pct% capacity" }
        elseif ($pct -gt 75) { Write-WARN "Volume $($vol.Root) at $pct% capacity" }
        else { Write-OK "Volume $($vol.Root): $usedGB GB used / $totalGB GB ($pct%)" }
    }
}

# ============================================================
#  MODULE 5 — BATTERY
# ============================================================
Write-HEAD "MODULE 5: BATTERY"

$batWmi  = Get-CimInstance Win32_Battery | Select-Object -First 1
$batInfo = $null

if ($batWmi) {
    $designCap  = $batWmi.DesignCapacity
    $fullChgCap = $batWmi.FullChargeCapacity

    $batInfo = [ordered]@{
        name             = $batWmi.Name
        deviceID         = $batWmi.DeviceID
        status           = $batWmi.BatteryStatus
        statusText       = switch($batWmi.BatteryStatus){ 1{"Discharging"} 2{"AC Connected"} 3{"Fully Charged"} 4{"Low"} 5{"Critical"} 6{"Charging"} 7{"Charging High"} 8{"Charging Low"} 9{"Charging Critical"} default{"Unknown"} }
        chargePercent    = $batWmi.EstimatedChargeRemaining
        runtimeMinutes   = $batWmi.EstimatedRunTime
        designCap        = $designCap
        fullChargeCap    = $fullChgCap
        wearPercent      = if ($designCap -and $fullChgCap -and $designCap -gt 0) { [math]::Round((1 - ($fullChgCap / $designCap)) * 100, 1) } else { $null }
        voltage          = [math]::Round($batWmi.DesignVoltage / 1000, 2)
    }

    # Battery report for cycle count (requires admin)
    try {
        $reportPath = "$env:TEMP\battery_report.xml"
        powercfg /batteryreport /output $reportPath /xml 2>$null
        if (Test-Path $reportPath) {
            [xml]$batXml = Get-Content $reportPath
            $batInfo["cycleCount"] = $batXml.BatteryReport.Batteries.Battery.CycleCount
            Remove-Item $reportPath -Force
        }
    } catch {}

    Write-OK "Battery: $($batInfo.name)"
    Write-OK "Status: $($batInfo.statusText) @ $($batInfo.chargePercent)%"
    if ($batInfo.wearPercent) {
        if ($batInfo.wearPercent -gt 40) { Write-CRIT "Wear Level: $($batInfo.wearPercent)% — Replace soon" }
        elseif ($batInfo.wearPercent -gt 20) { Write-WARN "Wear Level: $($batInfo.wearPercent)%" }
        else { Write-OK "Wear Level: $($batInfo.wearPercent)%" }
    }
} else {
    Write-INFO "No battery detected (Desktop system)"
}

# ============================================================
#  MODULE 6 — GPU
# ============================================================
Write-HEAD "MODULE 6: DISPLAY & GPU"

$gpus    = Get-CimInstance Win32_VideoController
$gpuInfo = @()

foreach ($gpu in $gpus) {
    $entry = [ordered]@{
        name            = $gpu.Name
        driverVersion   = $gpu.DriverVersion
        driverDate      = $gpu.DriverDate
        vramMB          = [math]::Round($gpu.AdapterRAM / 1MB, 0)
        resolution      = "$($gpu.CurrentHorizontalResolution)x$($gpu.CurrentVerticalResolution)"
        refreshRate     = $gpu.CurrentRefreshRate
        status          = $gpu.Status
        driverStatus    = $gpu.ConfigManagerErrorCode
    }
    $gpuInfo += $entry
    Write-OK "GPU: $($entry.name)"
    if ($entry.driverStatus -ne 0) { Write-WARN "GPU driver error code: $($entry.driverStatus)" }
}

# ============================================================
#  MODULE 7 — NETWORK & BLUETOOTH
# ============================================================
Write-HEAD "MODULE 7: NETWORK"

$netAdapters = Get-CimInstance Win32_NetworkAdapter | Where-Object { $_.NetEnabled -ne $null }
$netConfig   = Get-CimInstance Win32_NetworkAdapterConfiguration | Where-Object { $_.IPAddress -ne $null }

$netInfo = [ordered]@{
    adapters = @()
    ipv4     = ($netConfig | Where-Object { $_.IPAddress -match '\d+\.\d+\.\d+\.\d+' } | Select-Object -First 1).IPAddress[0]
    dns      = ($netConfig | Select-Object -First 1).DNSServerSearchOrder -join ", "
}

foreach ($a in $netAdapters | Select-Object -First 6) {
    $netInfo.adapters += [ordered]@{
        name    = $a.Name
        type    = $a.AdapterType
        mac     = $a.MACAddress
        speed   = if ($a.Speed) { "$([math]::Round($a.Speed/1MB,0)) Mbps" } else { "N/A" }
        enabled = $a.NetEnabled
    }
    if ($a.NetEnabled) { Write-OK "Adapter: $($a.Name)" }
}

# Bluetooth
$btAdapter = Get-PnpDevice | Where-Object { $_.Class -eq "Bluetooth" -and $_.Status -eq "OK" } | Select-Object -First 1
$netInfo["bluetooth"] = if ($btAdapter) { @{ found = $true; name = $btAdapter.FriendlyName; status = "OK" } }
                        else { @{ found = $false; name = "Not found / Error" } }

if ($btAdapter) { Write-OK "Bluetooth: $($btAdapter.FriendlyName)" }
else { Write-WARN "Bluetooth: Not detected or driver error" }

# ============================================================
#  MODULE 8 — DEVICE MANAGER (PnP Errors)
# ============================================================
Write-HEAD "MODULE 8: DEVICE MANAGER"

$allDevices = Get-PnpDevice
$devInfo    = [ordered]@{
    errors   = @()
    warnings = @()
    disabled = @()
    ok       = @()
}

foreach ($dev in $allDevices) {
    $entry = [ordered]@{
        name     = $dev.FriendlyName
        class    = $dev.Class
        status   = $dev.Status
        code     = $dev.ConfigManagerErrorCode
        deviceID = $dev.InstanceId
    }
    switch ($dev.Status) {
        "Error"    { $devInfo.errors   += $entry }
        "Degraded" { $devInfo.warnings += $entry }
        "Unknown"  { $devInfo.warnings += $entry }
        "Disabled" { $devInfo.disabled += $entry }
        "OK"       { $devInfo.ok       += $entry }
    }
}

Write-OK "Total devices: $($allDevices.Count)"
if ($devInfo.errors.Count -gt 0)   { Write-CRIT "Devices with errors: $($devInfo.errors.Count)" }
if ($devInfo.warnings.Count -gt 0) { Write-WARN "Devices with warnings: $($devInfo.warnings.Count)" }
if ($devInfo.disabled.Count -gt 0) { Write-WARN "Disabled devices: $($devInfo.disabled.Count)" }
foreach ($e in $devInfo.errors) { Write-CRIT "  Error: $($e.name) [Code $($e.code)]" }

# ============================================================
#  MODULE 9 — EVENT VIEWER LOGS
# ============================================================
Write-HEAD "MODULE 9: EVENT VIEWER"

$since      = (Get-Date).AddDays(-7)
$evtInfo    = [ordered]@{ critical = @(); errors = @(); warnings = @() }

try {
    $critEvts = Get-WinEvent -FilterHashtable @{ LogName='System'; Level=1; StartTime=$since } -MaxEvents 10 -ErrorAction Stop
    foreach ($e in $critEvts) {
        $evtInfo.critical += [ordered]@{ time = $e.TimeCreated.ToString("yyyy-MM-dd HH:mm"); source = $e.ProviderName; message = $e.Message.Substring(0,[Math]::Min(150,$e.Message.Length)) }
    }
} catch {}

try {
    $errEvts = Get-WinEvent -FilterHashtable @{ LogName='System'; Level=2; StartTime=$since } -MaxEvents 15 -ErrorAction Stop
    foreach ($e in $errEvts) {
        $evtInfo.errors += [ordered]@{ time = $e.TimeCreated.ToString("yyyy-MM-dd HH:mm"); source = $e.ProviderName; message = $e.Message.Substring(0,[Math]::Min(150,$e.Message.Length)) }
    }
} catch {}

try {
    $warnEvts = Get-WinEvent -FilterHashtable @{ LogName='System'; Level=3; StartTime=$since } -MaxEvents 10 -ErrorAction Stop
    foreach ($e in $warnEvts) {
        $evtInfo.warnings += [ordered]@{ time = $e.TimeCreated.ToString("yyyy-MM-dd HH:mm"); source = $e.ProviderName; message = $e.Message.Substring(0,[Math]::Min(150,$e.Message.Length)) }
    }
} catch {}

Write-OK "Event log scanned (last 7 days)"
if ($evtInfo.critical.Count -gt 0) { Write-CRIT "Critical events: $($evtInfo.critical.Count)" }
if ($evtInfo.errors.Count -gt 0)   { Write-WARN "Error events: $($evtInfo.errors.Count)" }

# ============================================================
#  MODULE 10 — STARTUP & PERFORMANCE
# ============================================================
Write-HEAD "MODULE 10: STARTUP & PERFORMANCE"

$startupItems = @()
# HKCU Run
$hkcuRun = Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -ErrorAction SilentlyContinue
if ($hkcuRun) {
    foreach ($prop in $hkcuRun.PSObject.Properties | Where-Object { $_.Name -notlike "PS*" }) {
        $startupItems += [ordered]@{ name = $prop.Name; location = "HKCU Run"; path = $prop.Value }
    }
}
# HKLM Run
$hklmRun = Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run" -ErrorAction SilentlyContinue
if ($hklmRun) {
    foreach ($prop in $hklmRun.PSObject.Properties | Where-Object { $_.Name -notlike "PS*" }) {
        $startupItems += [ordered]@{ name = $prop.Name; location = "HKLM Run"; path = $prop.Value }
    }
}
# Startup folder
$startupFolder = Get-ChildItem "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup" -ErrorAction SilentlyContinue
foreach ($f in $startupFolder) {
    $startupItems += [ordered]@{ name = $f.BaseName; location = "Startup Folder"; path = $f.FullName }
}

Write-INFO "Startup items: $($startupItems.Count)"
if ($startupItems.Count -gt 15) { Write-WARN "High startup count ($($startupItems.Count)) — may slow boot" }

# Windows Update Pending
$wuService  = Get-Service -Name wuauserv -ErrorAction SilentlyContinue
$updateInfo = [ordered]@{ serviceRunning = ($wuService.Status -eq "Running") }
try {
    $wuSession = New-Object -ComObject Microsoft.Update.Session
    $searcher  = $wuSession.CreateUpdateSearcher()
    $result    = $searcher.Search("IsInstalled=0 and Type='Software'")
    $updateInfo["pendingCount"] = $result.Updates.Count
    if ($result.Updates.Count -gt 0) { Write-WARN "Pending Windows Updates: $($result.Updates.Count)" }
    else { Write-OK "Windows Updates: Up to date" }
} catch {
    $updateInfo["pendingCount"] = $null
    $updateInfo["note"]         = "COM update search unavailable"
}

# ============================================================
#  SCORING ENGINE
# ============================================================
Write-HEAD "CALCULATING SYSTEM HEALTH SCORE"

$score       = 100
$issues      = @()
$critIssues  = @()

# CPU temp
if ($cpuInfo.tempCelsius -gt 90)  { $score -= 20; $critIssues += "CPU temperature critical ($($cpuInfo.tempCelsius)°C)" }
elseif ($cpuInfo.tempCelsius -gt 80) { $score -= 10; $issues += "CPU temperature high ($($cpuInfo.tempCelsius)°C)" }

# RAM usage
if ($ramInfo.usedPercent -gt 90) { $score -= 10; $issues += "RAM usage critical ($($ramInfo.usedPercent)%)" }
elseif ($ramInfo.usedPercent -gt 75) { $score -= 5; $issues += "RAM usage high ($($ramInfo.usedPercent)%)" }

# Disk SMART
foreach ($d in $diskInfo) {
    if ($d.smartOK -eq $false) { $score -= 30; $critIssues += "SMART failure predicted: $($d.model)" }
}

# Battery wear
if ($batInfo -and $batInfo.wearPercent) {
    if ($batInfo.wearPercent -gt 40) { $score -= 15; $issues += "Battery wear high ($($batInfo.wearPercent)%)" }
    elseif ($batInfo.wearPercent -gt 25) { $score -= 7; $issues += "Battery wear moderate ($($batInfo.wearPercent)%)" }
}

# Device errors
$score -= ($devInfo.errors.Count * 5)
foreach ($e in $devInfo.errors) { $issues += "Device error: $($e.name)" }

# Event log
$score -= ($evtInfo.critical.Count * 5)
foreach ($e in $evtInfo.critical) { $critIssues += "Critical event: $($e.source)" }

# Windows activation
if ($activationStatus -ne "Activated") { $score -= 20; $critIssues += "Windows not activated" }

# Startup overload
if ($startupItems.Count -gt 20) { $score -= 5; $issues += "Too many startup items ($($startupItems.Count))" }

# Updates
if ($updateInfo.pendingCount -gt 10) { $score -= 5; $issues += "Many pending updates ($($updateInfo.pendingCount))" }

$score = [math]::Max(0, [math]::Min(100, $score))
$grade = if ($score -ge 85) { "GOOD" } elseif ($score -ge 65) { "FAIR" } elseif ($score -ge 45) { "POOR" } else { "CRITICAL" }
$verdict = if ($critIssues.Count -eq 0 -and $score -ge 70) { "PASS" } elseif ($critIssues.Count -le 1 -and $score -ge 50) { "CONDITIONAL PASS" } else { "FAIL" }

Write-Host "`n  SYSTEM SCORE: $score% ($grade)  →  VERDICT: $verdict`n" -ForegroundColor $(if($score -ge 70){"Green"} elseif($score -ge 50){"Yellow"} else{"Red"})

# ============================================================
#  ASSEMBLE JSON REPORT
# ============================================================
$report = [ordered]@{
    meta = [ordered]@{
        toolName      = "HackRore TechToolkit"
        version       = "2.4"
        scanTime      = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        scanMode      = $Mode
        scannerHost   = $env:COMPUTERNAME
        scannerUser   = $env:USERNAME
    }
    score = [ordered]@{
        value   = $score
        grade   = $grade
        verdict = $verdict
    }
    system      = $systemInfo
    cpu         = $cpuInfo
    ram         = $ramInfo
    storage     = [ordered]@{ disks = $diskInfo; volumes = $volumes }
    battery     = $batInfo
    gpu         = $gpuInfo
    network     = $netInfo
    devices     = $devInfo
    eventLog    = $evtInfo
    startup     = [ordered]@{ items = $startupItems; count = $startupItems.Count }
    updates     = $updateInfo
    diagnosis   = [ordered]@{
        criticalIssues  = $critIssues
        warnings        = $issues
        totalIssues     = $critIssues.Count + $issues.Count
    }
}

# ── Write JSON ────────────────────────────────────────────────
$report | ConvertTo-Json -Depth 8 | Out-File -FilePath $jsonPath -Encoding UTF8
Write-OK "JSON report saved: $jsonPath"

# ── Write HTML (inline viewer) ────────────────────────────────
if (!$NoHTML) {
    $jsonContent = Get-Content $jsonPath -Raw
    $htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>HackRore Report — $($systemInfo.model)</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#080808;color:#ccc;font-family:'Courier New',monospace;font-size:13px}
  .header{background:#050505;border-bottom:1px solid #1a1a1a;padding:20px 30px;display:flex;align-items:center;justify-content:space-between}
  .logo{font-size:22px;font-weight:700;color:#fff;letter-spacing:4px}
  .logo span{color:#00ff88}
  .sub{font-size:9px;color:#333;letter-spacing:2px;margin-top:3px}
  .score-big{font-size:36px;font-weight:700;font-family:monospace}
  .body{padding:24px 30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
  .card{background:#0d0d0d;border:1px solid #1a1a1a;border-radius:4px;padding:16px}
  .card-title{font-size:9px;letter-spacing:2px;color:#444;text-transform:uppercase;margin-bottom:12px;border-bottom:1px solid #111;padding-bottom:8px}
  .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #0d0d0d;font-size:11px}
  .row .k{color:#444}.row .v{color:#bbb;text-align:right}
  .badge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:2px;letter-spacing:1px}
  .ok{color:#00ff88;border:1px solid #00ff88}.warn{color:#ffbb00;border:1px solid #ffbb00}.crit{color:#ff4444;border:1px solid #ff4444}
  .issue-list{margin-top:10px}
  .issue{padding:6px 0;border-bottom:1px solid #0d0d0d;font-size:11px;line-height:1.5}
  .issue.c{color:#ff6644}.issue.w{color:#ffbb00}.issue.ok{color:#00aa66}
  .bar-wrap{margin:6px 0}.bar-label{font-size:10px;color:#555;margin-bottom:3px}
  .bar-bg{background:#1a1a1a;height:5px;border-radius:2px;overflow:hidden}
  .bar-fill{height:100%;border-radius:2px;transition:width 1s}
  .bar-val{font-size:10px;margin-top:2px}
  .verdict-box{grid-column:1/-1;text-align:center;padding:20px;border:1px solid #1a1a1a;border-radius:4px;background:#050505}
  .verdict-text{font-size:24px;font-weight:700;letter-spacing:4px;margin-top:8px}
  .full{grid-column:1/-1}
  footer{text-align:center;padding:20px;color:#222;font-size:10px;letter-spacing:2px}
</style>
</head>
<body>
<script>
const REPORT = $jsonContent;
function scoreColor(s){return s>=85?'#00ff88':s>=65?'#ffbb00':'#ff4444'}
function bar(val,label,color){
  const c=val>80?'#ff4444':val>60?'#ffbb00':color||'#00ff88';
  return '<div class="bar-wrap"><div class="bar-label">'+label+'</div><div class="bar-bg"><div class="bar-fill" style="width:'+Math.min(100,val)+'%;background:'+c+'"></div></div><div class="bar-val" style="color:'+c+'">'+val+'%</div></div>';
}
function row(k,v){return '<div class="row"><span class="k">'+k+'</span><span class="v">'+v+'</span></div>'}
function badge(t,cls){return '<span class="badge '+cls+'">'+t+'</span>'}

document.addEventListener('DOMContentLoaded',()=>{
  const R=REPORT, s=R.score;
  document.title='HackRore — '+R.system.model;

  document.getElementById('root').innerHTML = '<div class="header"><div><div class="logo">HACK<span>RORE</span></div><div class="sub">TECHTOOLKIT v2.4 · AI-POWERED DIAGNOSTICS · '+R.meta.scanTime+'</div></div><div><div style="font-size:10px;color:#444;text-align:right;letter-spacing:2px">SYSTEM SCORE</div><div class="score-big" style="color:'+scoreColor(s.value)+'">'+s.value+'% <span style="font-size:14px">'+s.grade+'</span></div></div></div>'
  +
  '<div class="body">'
  // Verdict
  +'<div class="verdict-box"><div style="font-size:9px;color:#444;letter-spacing:2px">REFURBISHMENT VERDICT</div><div class="verdict-text" style="color:'+scoreColor(s.value)+'">'+s.verdict+'</div><div style="font-size:10px;color:#444;margin-top:8px">'+R.system.manufacturer+' '+R.system.model+' | Serial: '+R.system.serial+'</div></div>'
  // System
  +'<div class="card"><div class="card-title">System Identity</div>'+row('Manufacturer',R.system.manufacturer)+row('Model',R.system.model)+row('Serial',R.system.serial)+row('BIOS',R.system.biosVersion)+row('OS',R.system.osName)+row('Activation',badge(R.system.activation,R.system.activation==='Activated'?'ok':'crit'))+'</div>'
  // CPU
  +'<div class="card"><div class="card-title">Processor</div>'+row('Model',R.cpu.name)+row('Cores/Threads',R.cpu.cores+'C / '+R.cpu.threads+'T')+row('Speed',R.cpu.maxSpeedMHz+' MHz')+(R.cpu.tempCelsius?bar(R.cpu.tempCelsius,'CPU Temp °C','#ff8800'):'')+bar(R.cpu.loadPercent,'CPU Load %')+'</div>'
  // RAM
  +'<div class="card"><div class="card-title">Memory</div>'+row('Total',R.ram.totalGB+' GB')+row('Slots',R.ram.slots)+bar(R.ram.usedPercent,'RAM Usage %')+(R.ram.modules||[]).map(m=>row(m.slot,m.capacityGB+'GB '+m.type+' '+m.speedMHz+'MHz')).join('')+'</div>'
  // Storage
  +(R.storage.disks||[]).map(d=>'<div class="card"><div class="card-title">Storage</div>'+row('Model',d.model)+row('Type',d.storageType)+row('Size',d.sizeGB+' GB')+row('SMART',badge(d.smartStatus,d.smartOK===false?'crit':d.smartOK===true?'ok':'warn'))+'</div>').join('')
  // Battery
  +(R.battery?'<div class="card"><div class="card-title">Battery</div>'+row('Name',R.battery.name)+row('Status',R.battery.statusText)+row('Charge',R.battery.chargePercent+'%')+(R.battery.wearPercent!==null?bar(R.battery.wearPercent,'Wear %','#00aaff'):'')+(R.battery.cycleCount?row('Cycles',R.battery.cycleCount):'')+'</div>':'')
  // Devices
  +'<div class="card full"><div class="card-title">Device Manager</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">'
  +'<div>'+(R.devices.errors||[]).slice(0,8).map(e=>'<div class="issue c">❌ '+e.name+' ['+e.code+']</div>').join('')+'</div>'
  +'<div>'+(R.devices.warnings||[]).slice(0,8).map(w=>'<div class="issue w">⚠ '+w.name+'</div>').join('')+'</div>'
  +'<div>'+(R.devices.ok||[]).slice(0,8).map(o=>'<div class="issue ok" style="color:#335533">✅ '+o.name+'</div>').join('')+'</div>'
  +'</div></div>'
  // Issues
  +'<div class="card"><div class="card-title">Critical Issues ('+((R.diagnosis.criticalIssues||[]).length)+')</div>'+(R.diagnosis.criticalIssues||[]).map(i=>'<div class="issue c">❌ '+i+'</div>').join('')+((R.diagnosis.criticalIssues||[]).length===0?'<div style="color:#00aa66;font-size:11px;padding:6px 0">✅ No critical issues</div>':'')+'</div>'
  +'<div class="card"><div class="card-title">Warnings ('+((R.diagnosis.warnings||[]).length)+')</div>'+(R.diagnosis.warnings||[]).map(w=>'<div class="issue w">⚠ '+w+'</div>').join('')+((R.diagnosis.warnings||[]).length===0?'<div style="color:#00aa66;font-size:11px;padding:6px 0">✅ No warnings</div>':'')+'</div>'
  +'<div class="card"><div class="card-title">System Info</div>'+row('Boot Time',R.system.lastBoot)+row('Uptime',R.system.uptime+' hrs')+row('Startup Items',R.startup.count)+row('Pending Updates',R.updates.pendingCount!==null?R.updates.pendingCount:'Unknown')+'</div>'
  +'</div>'
  +'<footer>HACKRORE TECHTOOLKIT v2.4 · Generated '+R.meta.scanTime+' · Scanned by '+R.meta.scannerUser+'@'+R.meta.scannerHost+'</footer>';
});
</script>
<div id="root"></div>
</body>
</html>
"@
    $htmlContent | Out-File -FilePath $htmlPath -Encoding UTF8
    Write-OK "HTML report saved: $htmlPath"
}

# ── Summary ───────────────────────────────────────────────────
Write-Host ""
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  SCAN COMPLETE" -ForegroundColor White
Write-Host "  Score  : $score% ($grade)" -ForegroundColor $(if($score -ge 70){"Green"} elseif($score -ge 50){"Yellow"} else{"Red"})
Write-Host "  Verdict: $verdict" -ForegroundColor $(if($verdict -eq "PASS"){"Green"} elseif($verdict -eq "CONDITIONAL PASS"){"Yellow"} else{"Red"})
Write-Host "  Issues : $($critIssues.Count) critical  |  $($issues.Count) warnings" -ForegroundColor White
Write-Host "  JSON   : $jsonPath" -ForegroundColor DarkGray
if (!$NoHTML) { Write-Host "  HTML   : $htmlPath" -ForegroundColor DarkGray }
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# --- END OF SCRIPT LOGIC ---
Write-Host "`n[+] Diagnostics Complete!" -ForegroundColor Green
$ReportPath = "$env:USERPROFILE\Desktop\HackRore_Report.json"

# Copy report to Desktop
Copy-Item $jsonPath $ReportPath -Force

# Check if report exists
if (Test-Path $ReportPath) {
    Write-Host "[+] Opening ScanLab Dashboard..." -ForegroundColor Cyan
    
    # We use Base64 to ensure the JSON doesn't break the URL string
    $Bytes = [System.Text.Encoding]::UTF8.GetBytes((Get-Content $ReportPath -Raw))
    $EncodedData = [Convert]::ToBase64String($Bytes)
    
    # Open the browser directly to your ScanLab with the data payload
    $TargetURL = "https://hachtool.vercel.app/diagnostics?import=$EncodedData"
    Start-Process $TargetURL
} else {
    Write-Error "Report file not found. Please check permissions."
}
