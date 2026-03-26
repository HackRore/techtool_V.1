Copy-Item HackRore_Master.ps1 files/public/scripts/HackRore_Master.ps1

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
Diagnostics Complete!
[+] Opening ScanLab Dashboard...
[+] Diagnostics Complete!
Diagnostics Complete!
[+] Opening ScanLab Dashboard...
[+] Diagnostics Complete!
Diagnostics Complete!
[+] Opening browser...
[+] Diagnostics Complete!
Diagnostics Complete!
[+] Opening ScanLab Dashboard...
[+] Diagnostics Complete!
Diagnostics Complete!
[+] Opening browser...
[+] Diagnostics Complete!
Diagnostics Complete!
[+] Opening ScanLab Dashboard...
[+] Diagnostics logic added to local PS script (HackRore_Master.ps1). Step 4 ✅

**Step 5:** Sync to hosted version (files/public/scripts/HackRore_Master.ps1).

**npm install** still spinning (long on Windows).





<xai:function_call name="execute_command">
<parameter name="command">copy HackRore_Master.ps1 files\public\scripts\HackRore_Master.ps1
