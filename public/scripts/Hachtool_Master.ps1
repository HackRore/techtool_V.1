# ============================================================
#  Hachtool TechToolkit - Master Scanning Engine
#  Version: 2.5 (Industrial)
#  Author:  Ravindra | Hynet Technologies
#  GitHub:  github.com/ravindra/Hachtool
# ============================================================
#  Usage:
#    .\Hachtool_Master.ps1              → Full scan
#    .\Hachtool_Master.ps1 -Mode refurb → Refurbishment mode
#    .\Hachtool_Master.ps1 -Mode quick  → Quick health check
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

  Hachtool TechToolkit v2.5  |  Industrial Diagnostics  |  Mode: $($Mode.ToUpper())
  ─────────────────────────────────────────────────────────────────────
"@ -ForegroundColor Cyan
}

# ── Output folder ─────────────────────────────────────────────
if (!(Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }
$timestamp  = Get-Date -Format "yyyyMMdd_HHmmss"
$jsonPath   = "$OutputDir\Hachtool_$timestamp.json"
$htmlPath   = "$OutputDir\Hachtool_$timestamp.html"

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

# CPU Temperature via WMI
try {
    $cpuTempRaw = (Get-CimInstance -Namespace "root/wmi" -ClassName "MSAcpi_ThermalZoneTemperature" -ErrorAction Stop).CurrentTemperature
    $cpuInfo["tempCelsius"] = [math]::Round(($cpuTempRaw / 10) - 273.15, 1)
} catch {
    $cpuInfo["tempCelsius"] = $null
}

Write-OK "CPU: $($cpuInfo.name)"
Write-OK "Cores/Threads: $($cpuInfo.cores)C / $($cpuInfo.threads)T"
Write-INFO "Current Load: $($cpuInfo.loadPercent)%"

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
    
    # SMART via MSStorageDriver
    try {
        $smart = Get-CimInstance -Namespace root\wmi -ClassName MSStorageDriver_FailurePredictStatus -ErrorAction Stop
        foreach ($s in $smart) {
            if ($s.InstanceName -like "*$($disk.PNPDeviceID.Replace('\','_'))*" -or $smart.Count -eq 1) {
                $entry["smartOK"]       = !$s.PredictFailure
                $entry["smartStatus"]   = if (!$s.PredictFailure) { "healthy" } else { "action_required" }
                break
            }
        }
    } catch {
        $entry["smartOK"]     = $null
        $entry["smartStatus"] = "healthy"
    }

    $diskInfo += $entry
    Write-OK "Disk: $($entry.model) [Health: $($entry.smartStatus)]"
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
        statusText       = switch($batWmi.BatteryStatus){ 1{"Discharging"} 2{"AC Connected"} 3{"Fully Charged"} 4{"Low"} 5{"Critical"} 6{"Charging"} default{"Unknown"} }
        chargePercent    = $batWmi.EstimatedChargeRemaining
        wearPercent      = if ($designCap -and $fullChgCap -and $designCap -gt 0) { [math]::Round((1 - ($fullChgCap / $designCap)) * 100, 1) } else { $null }
    }
    Write-OK "Battery: $($batInfo.name) at $($batInfo.chargePercent)%"
} else {
    Write-INFO "No battery detected (Desktop)"
}

# ============================================================
#  SCORING ENGINE
# ============================================================
Write-HEAD "FINALIZING REPORT"

$score       = 100

# CPU temp check
if ($cpuInfo.tempCelsius -and $cpuInfo.tempCelsius -gt 85) { $score -= 10 }
# SMART check
foreach ($d in $diskInfo) { if ($d.smartOK -eq $false) { $score -= 30 } }
# Activation check
if ($activationStatus -ne "Activated") { $score -= 15 }

$score = [math]::Max(0, [math]::Min(100, $score))
$grade = if ($score -ge 85) { "SYSTEM_OPTIMAL" } elseif ($score -ge 65) { "SYSTEM_DEGRADED" } else { "ACTION_REQUIRED" }

# ============================================================
#  ASSEMBLE JSON REPORT
# ============================================================
$report = [ordered]@{
    meta = [ordered]@{
        toolName      = "Hachtool Master"
        version       = "2.5"
        scanTime      = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        scannerHost   = $env:COMPUTERNAME
    }
    overall = $score
    grade   = $grade
    cpu     = [ordered]@{ status = if ($cpuInfo.tempCelsius -gt 85) { "action_required" } else { "healthy" }; detail = "$($cpuInfo.name), $($cpuInfo.cores) cores @ $($cpuInfo.maxSpeedMHz)MHz" }
    ram     = [ordered]@{ status = if ($ramInfo.usedPercent -gt 85) { "action_required" } else { "healthy" }; detail = "$($ramInfo.totalGB) GB Total, $($ramInfo.usedPercent)% Used" }
    storage = [ordered]@{ status = if ($diskInfo.smartOK -contains $false) { "action_required" } else { "healthy" }; detail = "$($diskInfo[0].model) $($diskInfo[0].sizeGB)GB (Primary Drive)" }
    battery = if ($batInfo) { [ordered]@{ status = if ($batInfo.wearPercent -gt 35) { "action_required" } else { "healthy" }; detail = "$($batInfo.chargePercent)% Capacity, $($batInfo.wearPercent)% Wear" } } else { [ordered]@{ status = "healthy"; detail = "AC_POWERED: Desktop System" } }
}

$report | ConvertTo-Json -Depth 8 | Out-File -FilePath $jsonPath -Encoding UTF8
Write-OK "Report saved: $jsonPath"

# --- OPEN WEB PORTAL ---
$Bytes = [System.Text.Encoding]::UTF8.GetBytes(($report | ConvertTo-Json -Depth 8))
$EncodedData = [Convert]::ToBase64String($Bytes)
$TargetURL = "https://hachtool.vercel.app/diagnostics?import=$EncodedData"

Write-INFO "Sending telemetry to Cloud Portal..."
Start-Process $TargetURL

