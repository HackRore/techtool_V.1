# ============================================================
#  HackRore TechToolkit - Master Scanning Engine
#  Version: 2.9 (COMPLETE)
#  Author:  Ravindra | CyberTechX
#  GitHub:  github.com/ravindra/HackRore
# ============================================================
#  Usage:
#    .\HackRore_Master.ps1              → Full scan
#    .\HackRore_Master.ps1 -Mode refurb → Refurbishment report (condensed)
#    .\HackRore_Master.ps1 -Mode quick  → Quick health check (skips slow modules)
#    .\HackRore_Master.ps1 -NoHTML      → JSON only
#    .\HackRore_Master.ps1 -Silent      → No console output
# ============================================================

param(
    [string]$Mode      = "full",
    [string]$OutputDir = "$PSScriptRoot\Reports",
    [switch]$NoHTML,
    [switch]$Silent
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "SilentlyContinue"

# ── Helpers ───────────────────────────────────────────────────
function Write-OK   { param($m) if (!$Silent) { Write-Host "  [OK]  $m" -ForegroundColor Green  } }
function Write-WARN { param($m) if (!$Silent) { Write-Host "  [!!]  $m" -ForegroundColor Yellow } }
function Write-CRIT { param($m) if (!$Silent) { Write-Host "  [XX]  $m" -ForegroundColor Red    } }
function Write-INFO { param($m) if (!$Silent) { Write-Host "  [>>]  $m" -ForegroundColor Cyan   } }
function Write-HEAD { param($m) if (!$Silent) { Write-Host "`n  ===  $m  ===" -ForegroundColor White } }

# ── Mode flags ────────────────────────────────────────────────
$isQuick  = ($Mode -eq "quick")
$isRefurb = ($Mode -eq "refurb")

# ── Admin check ────────────────────────────────────────────────
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")
if (!$isAdmin -and !$Silent) {
    Write-Host "  [!!]  NOT running as Administrator." -ForegroundColor Yellow
    Write-Host "  [!!]  SMART data, battery cycle count, BT registry and Event Viewer" -ForegroundColor Yellow
    Write-Host "  [!!]  require admin. Re-run: Right-click > Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
}

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

  TechToolkit v2.9  |  AI-Powered Diagnostics  |  Mode: $($Mode.ToUpper())
  ─────────────────────────────────────────────────────────────────────
"@ -ForegroundColor Cyan
    if ($isQuick)  { Write-WARN "Quick mode: Event Viewer, Updates, Benchmarks skipped" }
    if ($isRefurb) { Write-INFO "Refurbishment mode: full scan + resale certificate" }
}

# ── Output folder ─────────────────────────────────────────────
if (!(Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$jsonPath  = "$OutputDir\HackRore_$timestamp.json"
$htmlPath  = "$OutputDir\HackRore_$timestamp.html"

# ── Pre-fetch expensive WMI tables once ──────────────────────
# Win32_PnPSignedDriver is slow to query; fetch once, filter locally
Write-Host "  [>>]  Pre-loading driver table..." -ForegroundColor Cyan
$allSignedDrivers = Get-CimInstance Win32_PnPSignedDriver -ErrorAction SilentlyContinue
if (!$allSignedDrivers) { $allSignedDrivers = @() }

# ============================================================
#  MODULE 1 — SYSTEM IDENTITY
# ============================================================
Write-HEAD "MODULE 1: SYSTEM IDENTITY"

$cs    = Get-CimInstance Win32_ComputerSystem
$bios  = Get-CimInstance Win32_BIOS
$os    = Get-CimInstance Win32_OperatingSystem
$board = Get-CimInstance Win32_BaseBoard

$systemInfo = [ordered]@{
    manufacturer = $cs.Manufacturer
    model        = $cs.Model
    serial       = $bios.SerialNumber
    biosVersion  = $bios.SMBIOSBIOSVersion
    biosDate     = if($bios.ReleaseDate){$bios.ReleaseDate.ToString("yyyy-MM-dd")}else{"Unknown"}
    osName       = $os.Caption
    osBuild      = $os.BuildNumber
    osArch       = $os.OSArchitecture
    lastBoot     = ($os.LastBootUpTime).ToString("yyyy-MM-dd HH:mm")
    uptime       = [math]::Round(((Get-Date) - $os.LastBootUpTime).TotalHours, 1)
    domainRole   = switch($cs.DomainRole){ 0{"Standalone"} 1{"Member"} 2{"DC"} default{"Unknown"} }
    pcType       = switch($cs.PCSystemType){ 1{"Desktop"} 2{"Laptop"} 3{"Workstation"} default{"Unknown"} }
    motherboard  = "$($board.Manufacturer) $($board.Product)"
}

# Windows Activation
$licObj = Get-CimInstance SoftwareLicensingProduct -Filter "Name like 'Windows%' AND PartialProductKey IS NOT NULL" -ErrorAction SilentlyContinue | Select-Object -First 1
$licStatus = if ($licObj) { $licObj.LicenseStatus } else { $null }
$activationStatus = switch($licStatus) { 1{"Activated"} 0{"Unlicensed"} 5{"Notification"} $null{"Unable to query"} default{"Unknown ($licStatus)"} }
$systemInfo["activation"] = $activationStatus

Write-OK "Model     : $($systemInfo.model)"
Write-OK "Serial    : $($systemInfo.serial)"
Write-OK "OS        : $($systemInfo.osName) (Build $($systemInfo.osBuild))"
if ($licStatus -eq 1) { Write-OK "Activation: $activationStatus" } elseif ($licStatus -eq $null) { Write-WARN "Activation: $activationStatus" } else { Write-CRIT "Activation: $activationStatus" }

# ============================================================
#  MODULE 2 — CPU
# ============================================================
Write-HEAD "MODULE 2: PROCESSOR"

$proc    = Get-CimInstance Win32_Processor | Select-Object -First 1
$cpuLoad = (Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 1 -MaxSamples 2).CounterSamples.CookedValue |
           Measure-Object -Average | Select-Object -ExpandProperty Average

$cpuInfo = [ordered]@{
    name         = $proc.Name.Trim()
    manufacturer = $proc.Manufacturer
    socket       = $proc.SocketDesignation
    cores        = $proc.NumberOfCores
    threads      = $proc.NumberOfLogicalProcessors
    maxSpeedMHz  = $proc.MaxClockSpeed
    currentMHz   = $proc.CurrentClockSpeed
    l2CacheKB    = $proc.L2CacheSize
    l3CacheKB    = $proc.L3CacheSize
    loadPercent  = [math]::Round($cpuLoad, 1)
    architecture = $proc.Architecture
    tempCelsius  = $null
    tempMethod   = "unavailable"
}

# CPU Temp — 3-method cascade
try {
    $tzRaw      = Get-CimInstance -Namespace "root/wmi" -ClassName "MSAcpi_ThermalZoneTemperature" -ErrorAction Stop
    $validTemps = $tzRaw | ForEach-Object { $c=[math]::Round(($_.CurrentTemperature/10)-273.15,1); if($c -gt 10 -and $c -lt 115){$c} } | Sort-Object -Descending
    if ($validTemps) { $cpuInfo.tempCelsius = $validTemps[0]; $cpuInfo.tempMethod = "MSAcpi_ThermalZone" }
} catch {}
if (!$cpuInfo.tempCelsius) {
    try {
        $ohmSensors = Get-CimInstance -Namespace "root/OpenHardwareMonitor" -ClassName "Sensor" -ErrorAction Stop |
                      Where-Object { $_.SensorType -eq "Temperature" -and $_.Name -match "CPU" }
        if ($ohmSensors) { $cpuInfo.tempCelsius=[math]::Round(($ohmSensors|Measure-Object Value -Maximum).Maximum,1); $cpuInfo.tempMethod="OpenHardwareMonitor" }
    } catch {}
}
if (!$cpuInfo.tempCelsius) {
    try {
        $lhmSensors = Get-CimInstance -Namespace "root/LibreHardwareMonitor" -ClassName "Sensor" -ErrorAction Stop |
                      Where-Object { $_.SensorType -eq "Temperature" -and $_.Name -match "CPU" }
        if ($lhmSensors) { $cpuInfo.tempCelsius=[math]::Round(($lhmSensors|Measure-Object Value -Maximum).Maximum,1); $cpuInfo.tempMethod="LibreHardwareMonitor" }
    } catch {}
}
if (!$cpuInfo.tempCelsius) {
    $cpuInfo["tempNote"] = "No sensor accessible. Run OpenHardwareMonitor then re-scan for real temps."
}

Write-OK "CPU: $($cpuInfo.name)  [$($cpuInfo.cores)C/$($cpuInfo.threads)T @ $($cpuInfo.maxSpeedMHz) MHz]"
Write-INFO "Load: $($cpuInfo.loadPercent)%"
if ($cpuInfo.tempCelsius) {
    if   ($cpuInfo.tempCelsius -gt 90) { Write-CRIT "Temp: $($cpuInfo.tempCelsius)°C CRITICAL [$($cpuInfo.tempMethod)]" }
    elseif ($cpuInfo.tempCelsius -gt 80) { Write-WARN "Temp: $($cpuInfo.tempCelsius)°C High [$($cpuInfo.tempMethod)]" }
    else { Write-OK "Temp: $($cpuInfo.tempCelsius)°C [$($cpuInfo.tempMethod)]" }
} else { Write-WARN "Temp: Sensor unavailable — $($cpuInfo.tempNote)" }

# ============================================================
#  MODULE 3 — MEMORY
# ============================================================
Write-HEAD "MODULE 3: MEMORY"

$ramModules = Get-CimInstance Win32_PhysicalMemory
$os2        = Get-CimInstance Win32_OperatingSystem
$ramInfo    = [ordered]@{
    totalGB     = [math]::Round($cs.TotalPhysicalMemory/1GB,2)
    availableGB = [math]::Round($os2.FreePhysicalMemory/1MB,2)
    usedPercent = [math]::Round((($cs.TotalPhysicalMemory-($os2.FreePhysicalMemory*1KB))/$cs.TotalPhysicalMemory)*100,1)
    slots       = $ramModules.Count
    modules     = @()
}
foreach ($mod in $ramModules) {
    $ramInfo.modules += [ordered]@{
        slot         = $mod.DeviceLocator
        capacityGB   = [math]::Round($mod.Capacity/1GB,0)
        speedMHz     = $mod.ConfiguredClockSpeed
        type         = switch($mod.SMBIOSMemoryType){ 26{"DDR4"} 34{"DDR5"} 24{"DDR3"} default{"DDR($($mod.SMBIOSMemoryType))"} }
        manufacturer = $mod.Manufacturer
        partNumber   = $mod.PartNumber.Trim()
    }
}
Write-OK "Total: $($ramInfo.totalGB) GB | Slots: $($ramInfo.slots) | Usage: $($ramInfo.usedPercent)%"
foreach ($m in $ramInfo.modules) { Write-OK "  $($m.slot): $($m.capacityGB)GB $($m.type) @ $($m.speedMHz) MHz — $($m.partNumber)" }

# ============================================================
#  MODULE 4 — STORAGE + SMART (3-layer)
# ============================================================
Write-HEAD "MODULE 4: STORAGE"

$disks    = Get-CimInstance Win32_DiskDrive
$diskInfo = @()

foreach ($disk in $disks) {
    $entry = [ordered]@{
        model        = $disk.Model
        serialNumber = $disk.SerialNumber.Trim()
        sizeGB       = [math]::Round($disk.Size/1GB,0)
        interface    = $disk.InterfaceType
        status       = $disk.Status
        partitions   = $disk.Partitions
        storageType  = if($disk.Model -match "NVMe|NVME"){"NVMe SSD"} elseif($disk.InterfaceType -eq "USB"){"USB Storage"} elseif($disk.InterfaceType -eq "SCSI"){"SATA SSD/HDD"} else{$disk.InterfaceType}
        smartOK      = $null
        smartStatus  = "Unknown"
    }

    # SMART Layer 1 — Pass/Fail prediction
    try {
        $spAll = Get-CimInstance -Namespace root\wmi -ClassName MSStorageDriver_FailurePredictStatus -ErrorAction Stop
        foreach ($s in $spAll) {
            if ($s.InstanceName -like "*$($disk.PNPDeviceID.Replace('\','_'))*" -or $spAll.Count -eq 1) {
                $entry.smartOK     = !$s.PredictFailure
                $entry.smartStatus = if(!$s.PredictFailure){"Healthy"}else{"FAILURE PREDICTED"}
                break
            }
        }
    } catch {}

    # SMART Layer 2 — Get-PhysicalDisk (MediaType, BusType, HealthStatus)
    try {
        $pd = Get-PhysicalDisk -ErrorAction Stop | Where-Object {
            $_.FriendlyName -like "*$($disk.Model.Split(' ')[0])*" -or $_.SerialNumber -eq $disk.SerialNumber.Trim()
        } | Select-Object -First 1
        if ($pd) {
            $entry["mediaTypeDetailed"] = $pd.MediaType
            $entry["busType"]           = $pd.BusType
            $entry["healthStatus"]      = $pd.HealthStatus
            $entry["operationalStatus"] = $pd.OperationalStatus
            if ($pd.HealthStatus -ne "Healthy") { $entry.smartStatus="WARNING — $($pd.HealthStatus)"; $entry.smartOK=$false }
        }
    } catch {}

    # SMART Layer 3 — Raw attribute parsing (reallocated, POH, cycles, temp, pending, uncorrectable)
    $entry["smartAttributes"] = [ordered]@{}
    try {
        $sdAll = Get-CimInstance -Namespace root\wmi -ClassName MSStorageDriver_FailurePredictData -ErrorAction Stop
        foreach ($sd in $sdAll) {
            if ($sd.InstanceName -like "*$($disk.PNPDeviceID.Replace('\','_'))*" -or $sdAll.Count -eq 1) {
                $raw    = $sd.VendorSpecific
                $attrMap= @{5="reallocatedSectors";9="powerOnHours";12="powerCycles";190="airflowTempC";194="tempCelsius";197="pendingSectors";198="uncorrectableErrors";199="udmaCrcErrors"}
                for ($i=2; $i -lt 362; $i+=12) {
                    if ($i+11 -ge $raw.Count) { break }
                    $id  = $raw[$i]
                    $val = [long]$raw[$i+5]+([long]$raw[$i+6]-shl 8)+([long]$raw[$i+7]-shl 16)+([long]$raw[$i+8]-shl 24)+([long]$raw[$i+9]-shl 32)+([long]$raw[$i+10]-shl 40)
                    if ($id -ne 0 -and $attrMap.ContainsKey($id)) { $entry["smartAttributes"][$attrMap[$id]] = $val }
                }
                $sa = $entry["smartAttributes"]
                if ($sa["reallocatedSectors"] -gt 0) { $entry.smartStatus="CAUTION — Reallocated: $($sa['reallocatedSectors'])"; $entry.smartOK=$false }
                if ($sa["pendingSectors"]     -gt 0) { $entry.smartStatus="WARNING — Pending sectors: $($sa['pendingSectors'])";   $entry.smartOK=$false }
                if ($sa["uncorrectableErrors"]-gt 0) { $entry.smartStatus="CRITICAL — Uncorrectable errors";                      $entry.smartOK=$false }
                break
            }
        }
    } catch { $entry["smartAttributes"]["note"]="SATA attribute parsing unavailable. NVMe: use CrystalDiskInfo." }

    $sa = $entry["smartAttributes"]
    if   ($entry.smartOK -eq $false) { Write-CRIT "Disk: $($entry.model) — $($entry.smartStatus)" }
    elseif ($entry.smartOK -eq $true) { Write-OK  "Disk: $($entry.model) [$($entry.storageType)] SMART OK" }
    else  { Write-WARN "Disk: $($entry.model) SMART status unknown" }
    if ($sa["powerOnHours"])  { Write-INFO "  Power-On Hours: $($sa['powerOnHours']) (~$([math]::Round($sa['powerOnHours']/8760,1)) yrs) | Cycles: $($sa['powerCycles'])" }
    if ($sa["tempCelsius"])   { Write-INFO "  Drive Temp: $($sa['tempCelsius'])°C" }
    if ($sa["reallocatedSectors"] -gt 0) { Write-CRIT "  Reallocated Sectors: $($sa['reallocatedSectors'])" }
    if ($sa["pendingSectors"]     -gt 0) { Write-CRIT "  Pending Sectors    : $($sa['pendingSectors'])" }
    if ($sa["uncorrectableErrors"]-gt 0) { Write-CRIT "  Uncorrectable Errs : $($sa['uncorrectableErrors'])" }

    $diskInfo += $entry
}

# Volume usage
$volumes = @()
foreach ($vol in (Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root })) {
    $usedGB  = [math]::Round($vol.Used/1GB,1)
    $freeGB  = [math]::Round($vol.Free/1GB,1)
    $totalGB = $usedGB + $freeGB
    if ($totalGB -gt 0) {
        $pct = [math]::Round(($usedGB/$totalGB)*100,1)
        $volumes += [ordered]@{ drive=$vol.Root; usedGB=$usedGB; freeGB=$freeGB; totalGB=$totalGB; usedPercent=$pct }
        if   ($pct -gt 90) { Write-CRIT "Volume $($vol.Root): $pct% full" }
        elseif ($pct -gt 75) { Write-WARN "Volume $($vol.Root): $pct% full" }
        else { Write-OK   "Volume $($vol.Root): $usedGB/$totalGB GB ($pct%)" }
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
    $batInfo    = [ordered]@{
        name           = $batWmi.Name
        deviceID       = $batWmi.DeviceID
        statusText     = switch($batWmi.BatteryStatus){1{"Discharging"}2{"AC Connected"}3{"Fully Charged"}4{"Low"}5{"Critical"}6{"Charging"}7{"Charging High"}8{"Charging Low"}9{"Charging Critical"}default{"Unknown"}}
        chargePercent  = $batWmi.EstimatedChargeRemaining
        runtimeMinutes = $batWmi.EstimatedRunTime
        designCap      = $designCap
        fullChargeCap  = $fullChgCap
        wearPercent    = if($designCap -and $fullChgCap -and $designCap -gt 0){[math]::Round((1-($fullChgCap/$designCap))*100,1)}else{$null}
        voltage        = [math]::Round($batWmi.DesignVoltage/1000,2)
        cycleCount     = $null
        cycleSource    = "unavailable"
    }

    # Cycle count — powercfg with 800ms settle + correct XML path
    try {
        $reportPath = "$env:TEMP\hackrore_bat_$timestamp.xml"
        powercfg /batteryreport /output $reportPath /xml 2>$null
        Start-Sleep -Milliseconds 800
        if (Test-Path $reportPath) {
            [xml]$batXml = Get-Content $reportPath -ErrorAction Stop
            $cc = $batXml.BatteryReport.Batteries.Battery.CycleCount
            if ($cc -and [int]$cc -gt 0) {
                $batInfo.cycleCount  = [int]$cc
                $batInfo.cycleSource = "powercfg"
            } elseif ($cc -eq 0) {
                $batInfo.cycleSource = "driver-not-reporting"
                $batInfo["cycleNote"]= "Driver reports 0 — use BatteryInfoView (NirSoft) for real count"
            }
            Remove-Item $reportPath -Force -ErrorAction SilentlyContinue
        }
    } catch { $batInfo.cycleSource = "powercfg-failed" }

    Write-OK "Battery: $($batInfo.name) | $($batInfo.statusText) @ $($batInfo.chargePercent)%"
    if ($batInfo.wearPercent -ne $null) {
        if   ($batInfo.wearPercent -gt 40) { Write-CRIT "Wear: $($batInfo.wearPercent)% — Replace recommended" }
        elseif ($batInfo.wearPercent -gt 20) { Write-WARN "Wear: $($batInfo.wearPercent)% — Moderate degradation" }
        else { Write-OK "Wear: $($batInfo.wearPercent)% — Good condition" }
    }
    if ($batInfo.cycleCount) { Write-OK "Cycle count: $($batInfo.cycleCount) [$($batInfo.cycleSource)]" }
    else { Write-WARN "Cycle count: $($batInfo.cycleSource)" }
} else {
    Write-INFO "No battery — desktop system"
}

# ============================================================
#  MODULE 6 — GPU
# ============================================================
Write-HEAD "MODULE 6: GPU"

$gpuInfo = @()
foreach ($gpu in (Get-CimInstance Win32_VideoController)) {
    $entry = [ordered]@{
        name          = $gpu.Name
        driverVersion = $gpu.DriverVersion
        driverDate    = if($gpu.DriverDate){$gpu.DriverDate.ToString("yyyy-MM-dd")}else{"Unknown"}
        vramMB        = [math]::Round($gpu.AdapterRAM/1MB,0)
        vramNote      = if([math]::Round($gpu.AdapterRAM/1MB,0) -ge 4095){"WMI 32-bit cap — actual VRAM may be higher. Check GPU specs."}else{$null}
        resolution    = "$($gpu.CurrentHorizontalResolution)x$($gpu.CurrentVerticalResolution)"
        refreshRate   = $gpu.CurrentRefreshRate
        status        = $gpu.Status
        errorCode     = $gpu.ConfigManagerErrorCode
    }
    $gpuInfo += $entry
    if ($entry.errorCode -ne 0) { Write-CRIT "GPU ERROR: $($entry.name) [Code $($entry.errorCode)]" }
    else { Write-OK "GPU: $($entry.name) | VRAM: $($entry.vramMB) MB | Driver: $($entry.driverVersion) ($($entry.driverDate))" }
}

# ============================================================
#  MODULE 7 — NETWORK
# ============================================================
Write-HEAD "MODULE 7: NETWORK"

$netAdapters = Get-CimInstance Win32_NetworkAdapter | Where-Object { $_.NetEnabled -ne $null }
$netConfig   = Get-CimInstance Win32_NetworkAdapterConfiguration | Where-Object { $_.IPAddress -ne $null }
$netInfo     = [ordered]@{
    adapters = @()
    ipv4     = ($netConfig | Where-Object { $_.IPAddress -match '\d+\.\d+\.\d+\.\d+' } | Select-Object -First 1).IPAddress[0]
    dns      = ($netConfig | Select-Object -First 1).DNSServerSearchOrder -join ", "
}
foreach ($a in ($netAdapters | Select-Object -First 6)) {
    $netInfo.adapters += [ordered]@{ name=$a.Name; type=$a.AdapterType; mac=$a.MACAddress; speed=if($a.Speed){"$([math]::Round($a.Speed/1MB,0)) Mbps"}else{"N/A"}; enabled=$a.NetEnabled }
    if ($a.NetEnabled) { Write-OK "Adapter: $($a.Name)" }
}

# ============================================================
#  MODULE 7b — BLUETOOTH (full)
# ============================================================
Write-HEAD "MODULE 7b: BLUETOOTH"

$btInfo   = [ordered]@{ adapterFound=$false; adapterName=$null; adapterStatus="Not detected";
                        driverVersion=$null; driverDate=$null; driverProvider=$null; bleSupported=$false;
                        pairedDevices=@(); connectedDevices=@(); errors=@() }
$btAllPnp = Get-PnpDevice | Where-Object { $_.Class -eq "Bluetooth" }
$btRadio  = $btAllPnp | Where-Object { $_.Status -eq "OK" -and $_.FriendlyName -notmatch "Enumerator|AMP|RFCOMM|Generic|HID|Hands" } | Select-Object -First 1

if ($btRadio) {
    $btInfo.adapterFound  = $true
    $btInfo.adapterName   = $btRadio.FriendlyName
    $btInfo.adapterStatus = "OK"
    $btDrv = $allSignedDrivers | Where-Object { $_.DeviceID -eq $btRadio.InstanceId } | Select-Object -First 1
    if ($btDrv) { $btInfo.driverVersion=$btDrv.DriverVersion; $btInfo.driverDate=if($btDrv.DriverDate){$btDrv.DriverDate.ToString("yyyy-MM-dd")}else{"Unknown"}; $btInfo.driverProvider=$btDrv.DriverProviderName }
    $btInfo.bleSupported = !!(Get-PnpDevice | Where-Object { $_.FriendlyName -match "LE|Low Energy|BthLE" -and $_.Status -eq "OK" })
    Write-OK "BT Adapter: $($btInfo.adapterName) | Driver: $($btInfo.driverVersion) ($($btInfo.driverDate))"
    Write-INFO "  BLE: $(if($btInfo.bleSupported){'Supported'}else{'Not confirmed'})"
} else { Write-WARN "Bluetooth adapter: not found or driver error" }

foreach ($e in ($btAllPnp | Where-Object { $_.Status -ne "OK" })) {
    $btInfo.errors += [ordered]@{ name=$e.FriendlyName; status=$e.Status; code=$e.ConfigManagerErrorCode }
    Write-CRIT "BT Error: $($e.FriendlyName) [Code $($e.ConfigManagerErrorCode)]"
}

try {
    $btRegBase = "HKLM:\SYSTEM\CurrentControlSet\Services\BTHPORT\Parameters\Devices"
    if (Test-Path $btRegBase) {
        foreach ($devKey in (Get-ChildItem $btRegBase -ErrorAction SilentlyContinue)) {
            $props   = Get-ItemProperty $devKey.PSPath -ErrorAction SilentlyContinue
            $macRaw  = $devKey.PSChildName
            $mac     = if($macRaw.Length -eq 12){($macRaw -replace '(..)(?=.)','$1:').ToUpper()}else{$macRaw.ToUpper()}
            $devName = if($props.Name){[System.Text.Encoding]::UTF8.GetString($props.Name).TrimEnd([char]0).Trim()}else{"Unknown"}
            if (!$devName) { $devName = "Unknown" }
            $btInfo.pairedDevices += [ordered]@{ name=$devName; mac=$mac }
            Write-INFO "  Paired: $devName ($mac)"
        }
    }
} catch { Write-WARN "  BT paired registry: needs admin" }

foreach ($dev in (Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPClass -eq "Bluetooth" -and $_.Status -eq "OK" -and $_.Name -notmatch "Enumerator|Radio|Controller|AMP|RFCOMM|HFP|Generic" })) {
    $btInfo.connectedDevices += [ordered]@{ name=$dev.Name; manufacturer=$dev.Manufacturer }
    Write-OK "  Connected: $($dev.Name)"
}
Write-INFO "Paired: $($btInfo.pairedDevices.Count) | Connected: $($btInfo.connectedDevices.Count)"
$netInfo["bluetooth"] = $btInfo

# ============================================================
#  MODULE 8 — DEVICE MANAGER (PnP Errors + driver versions + fix codes)
# ============================================================
Write-HEAD "MODULE 8: DEVICE MANAGER"

# Code → fix suggestion map
$codeFixDB = @{
    43 = "Device stopped/removed — reinstall driver or check USB power management settings"
    10 = "Update or rollback driver — hardware may not start"
    28 = "Driver not installed — download from manufacturer website"
    19 = "Registry key corrupt — run: sfc /scannow and check for duplicates"
    31 = "Reinstall driver — device not working properly"
    37 = "Reinstall or update driver — driver package failed"
    45 = "Check hardware connection — device disconnected"
    52 = "Driver not digitally signed — get official driver from vendor"
    1  = "Device config problem — check for driver conflicts"
    3  = "Driver missing — install from Device Manager or vendor site"
    14 = "Restart required to apply driver changes"
    22 = "Device is disabled — right-click > Enable in Device Manager"
    24 = "Device not present or incomplete installation"
    32 = "Driver service disabled — re-enable in services.msc"
    38 = "Driver loaded previously — restart required"
    39 = "Driver corrupt or missing — reinstall driver"
    40 = "INF file problem — reinstall driver"
    41 = "Windows loaded generic driver — install vendor driver"
    42 = "Duplicate device — check for conflicts in Device Manager"
    48 = "Driver blocked by policy — driver update required"
    50 = "Cannot apply firmware — check for BIOS update"
}

$devInfo    = [ordered]@{ errors=@(); warnings=@(); disabled=@(); ok=@() }
$allDevices = Get-PnpDevice
foreach ($dev in $allDevices) {
    $entry = [ordered]@{ name=$dev.FriendlyName; class=$dev.Class; status=$dev.Status; code=$dev.ConfigManagerErrorCode; deviceID=$dev.InstanceId }
    if ($dev.Status -in @("Error","Degraded","Unknown") -and $dev.Status -ne "OK") {
        $drv = $allSignedDrivers | Where-Object { $_.DeviceID -eq $dev.InstanceId } | Select-Object -First 1
        if ($drv) { $entry["driverVersion"]=$drv.DriverVersion; $entry["driverDate"]=if($drv.DriverDate){$drv.DriverDate.ToString("yyyy-MM-dd")}else{"N/A"}; $entry["driverProvider"]=$drv.DriverProviderName }
        if ($codeFixDB.ContainsKey($dev.ConfigManagerErrorCode)) { $entry["suggestedFix"]=$codeFixDB[$dev.ConfigManagerErrorCode] }
    }
    switch ($dev.Status) {
        "Error"    { $devInfo.errors   += $entry }
        "Degraded" { $devInfo.warnings += $entry }
        "Unknown"  { $devInfo.warnings += $entry }
        "Disabled" { $devInfo.disabled += $entry }
        "OK"       { $devInfo.ok       += $entry }
    }
}
Write-OK "Devices: $($allDevices.Count) total"
if ($devInfo.errors.Count   -gt 0) { Write-CRIT "Errors  : $($devInfo.errors.Count)"   }
if ($devInfo.warnings.Count -gt 0) { Write-WARN "Warnings: $($devInfo.warnings.Count)" }
if ($devInfo.disabled.Count -gt 0) { Write-WARN "Disabled: $($devInfo.disabled.Count)" }
foreach ($e in $devInfo.errors) {
    Write-CRIT "  ❌ $($e.name) [Code $($e.code)]"
    if ($e.suggestedFix) { Write-WARN "     Fix: $($e.suggestedFix)" }
}

# ============================================================
#  MODULE 9 — EVENT VIEWER (with EventID + resolution KB)
# ============================================================
Write-HEAD "MODULE 9: EVENT VIEWER"

# Known resolution map: "ProviderName_EventID" => fix note
$evtResolutions = @{
    "Microsoft-Windows-Kernel-Power_41"   = "Unexpected shutdown (power loss/crash). Check PSU, RAM, temps. KB2028504"
    "Microsoft-Windows-Kernel-Power_109"  = "Firmware reset while sleeping — update BIOS/UEFI"
    "disk_7"                              = "Bad sector detected. Run chkdsk /r. Backup immediately"
    "disk_11"                             = "Disk I/O error — check SATA cable and run SMART test"
    "Microsoft-Windows-WHEA-Logger_18"    = "Hardware error (CPU/RAM). Run MemTest86. KB2509869"
    "Microsoft-Windows-WHEA-Logger_19"    = "Corrected hardware error — monitor for increasing count"
    "nvlddmkm_14"                         = "NVIDIA driver crash. DDU clean reinstall recommended"
    "iaStorA_129"                         = "Intel SATA controller reset — update Intel RST driver"
    "Microsoft-Windows-DistributedCOM_10016" = "DCOM permission error — usually harmless, check Component Services"
    "Microsoft-Windows-Kernel-Boot_30"    = "Boot corruption — run: sfc /scannow & DISM /Online /Cleanup-Image /RestoreHealth"
    "volsnap_36"                          = "Shadow copy insufficient space — extend C: drive or disable VSS"
    "Ntfs_55"                             = "NTFS corruption — run chkdsk /f on affected volume"
    "bowser_8003"                         = "Network browser election — usually harmless on home networks"
}

$since   = (Get-Date).AddDays(-7)
$evtInfo = [ordered]@{ critical=@(); errors=@(); warnings=@() }

if (!$isQuick) {
    try {
        foreach ($e in (Get-WinEvent -FilterHashtable @{LogName='System';Level=1;StartTime=$since} -MaxEvents 10 -ErrorAction Stop)) {
            $key  = "$($e.ProviderName)_$($e.Id)"
            $fix  = if($evtResolutions.ContainsKey($key)){$evtResolutions[$key]}else{$null}
            $evtInfo.critical += [ordered]@{ time=$e.TimeCreated.ToString("yyyy-MM-dd HH:mm"); source=$e.ProviderName; eventId=$e.Id; message=$e.Message.Substring(0,[Math]::Min(150,$e.Message.Length)); resolution=$fix }
        }
    } catch {}
    try {
        foreach ($e in (Get-WinEvent -FilterHashtable @{LogName='System';Level=2;StartTime=$since} -MaxEvents 15 -ErrorAction Stop)) {
            $key  = "$($e.ProviderName)_$($e.Id)"
            $fix  = if($evtResolutions.ContainsKey($key)){$evtResolutions[$key]}else{$null}
            $evtInfo.errors += [ordered]@{ time=$e.TimeCreated.ToString("yyyy-MM-dd HH:mm"); source=$e.ProviderName; eventId=$e.Id; message=$e.Message.Substring(0,[Math]::Min(150,$e.Message.Length)); resolution=$fix }
        }
    } catch {}
    try {
        foreach ($e in (Get-WinEvent -FilterHashtable @{LogName='System';Level=3;StartTime=$since} -MaxEvents 10 -ErrorAction Stop)) {
            $evtInfo.warnings += [ordered]@{ time=$e.TimeCreated.ToString("yyyy-MM-dd HH:mm"); source=$e.ProviderName; eventId=$e.Id; message=$e.Message.Substring(0,[Math]::Min(100,$e.Message.Length)) }
        }
    } catch {}
    Write-OK "Event log scanned (last 7 days)"
    if ($evtInfo.critical.Count -gt 0) { Write-CRIT "Critical: $($evtInfo.critical.Count)"; foreach($e in $evtInfo.critical){Write-CRIT "  ID $($e.eventId) — $($e.source)"; if($e.resolution){Write-WARN "  Fix: $($e.resolution)"}} }
    if ($evtInfo.errors.Count   -gt 0) { Write-WARN "Errors  : $($evtInfo.errors.Count)" }
} else {
    Write-INFO "Event log: skipped in quick mode"
    $evtInfo["note"] = "Skipped in quick mode"
}

# ============================================================
#  MODULE 10 — STARTUP & PERFORMANCE
# ============================================================
Write-HEAD "MODULE 10: STARTUP & PERFORMANCE"

$startupItems = @()
$hkcuRun = Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -ErrorAction SilentlyContinue
if ($hkcuRun) { foreach ($p in $hkcuRun.PSObject.Properties|Where-Object{$_.Name -notlike "PS*"}){ $startupItems += [ordered]@{name=$p.Name;location="HKCU Run";path=$p.Value} } }
$hklmRun = Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run" -ErrorAction SilentlyContinue
if ($hklmRun) { foreach ($p in $hklmRun.PSObject.Properties|Where-Object{$_.Name -notlike "PS*"}){ $startupItems += [ordered]@{name=$p.Name;location="HKLM Run";path=$p.Value} } }
foreach ($f in (Get-ChildItem "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup" -ErrorAction SilentlyContinue)) {
    $startupItems += [ordered]@{name=$f.BaseName;location="Startup Folder";path=$f.FullName}
}
# Task Scheduler logon tasks (Teams, OneDrive, Discord, Spotify etc. use these instead of Run keys)
try {
    $logonTasks = Get-ScheduledTask -ErrorAction Stop | Where-Object {
        $_.State -ne "Disabled" -and
        $_.Principal.LogonType -in @("Interactive","S4U") -and
        $_.Triggers | Where-Object { $_.CimClass.CimClassName -eq "MSFT_TaskLogonTrigger" }
    }
    foreach ($t in $logonTasks | Select-Object -First 30) {
        $action = $t.Actions | Select-Object -First 1
        $startupItems += [ordered]@{ name=$t.TaskName; location="Task Scheduler"; path=if($action){$action.Execute}else{"N/A"} }
    }
} catch {}

if ($startupItems.Count -gt 15) { Write-WARN "Startup items: $($startupItems.Count) — may slow boot" }
else { Write-OK "Startup items: $($startupItems.Count)" }

# MODULE 10b — Top Processes
$processInfo = [ordered]@{ topByMemory=@(); topByCpu=@(); totalRamUsedMB=0; processCount=0 }
try {
    $allProcs = Get-Process -ErrorAction Stop
    $processInfo.processCount   = $allProcs.Count
    $processInfo.totalRamUsedMB = [math]::Round(($allProcs | Measure-Object WorkingSet64 -Sum).Sum/1MB,0)
    $processInfo.topByMemory = $allProcs | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 | ForEach-Object {
        [ordered]@{ name=$_.ProcessName; pid=$_.Id; ramMB=[math]::Round($_.WorkingSet64/1MB,1); cpuTimeSec=[math]::Round($_.TotalProcessorTime.TotalSeconds,1) }
    }
    # Note: cpuTimeSec is CUMULATIVE lifetime CPU seconds, not current %. High values = long-running or historically heavy process.
    $processInfo.topByCpuTime = $allProcs | Sort-Object { $_.TotalProcessorTime.TotalSeconds } -Descending | Select-Object -First 10 | ForEach-Object {
        [ordered]@{ name=$_.ProcessName; pid=$_.Id; ramMB=[math]::Round($_.WorkingSet64/1MB,1); cpuTimeSec=[math]::Round($_.TotalProcessorTime.TotalSeconds,1) }
    }
    Write-OK "Processes: $($processInfo.processCount) running | Total RAM: $($processInfo.totalRamUsedMB) MB"
    Write-INFO "Top RAM: $($processInfo.topByMemory[0].name) ($($processInfo.topByMemory[0].ramMB) MB)"
} catch { Write-WARN "Process enumeration failed" }

# MODULE 10c — Windows Updates (with KB numbers, titles, severity)
$updateInfo = [ordered]@{ serviceRunning=$false; pendingCount=$null; updates=@() }
if (!$isQuick) {
    $wuSvc = Get-Service -Name wuauserv -ErrorAction SilentlyContinue
    $updateInfo.serviceRunning = ($wuSvc.Status -eq "Running")
    try {
        $session  = New-Object -ComObject Microsoft.Update.Session
        $searcher = $session.CreateUpdateSearcher()
        $results  = $searcher.Search("IsInstalled=0 and Type='Software'")
        $updateInfo.pendingCount = $results.Updates.Count
        foreach ($upd in $results.Updates) {
            $kbIds = @(); foreach ($kb in $upd.KBArticleIDs) { $kbIds += "KB$kb" }
            $updateInfo.updates += [ordered]@{
                title    = $upd.Title
                kb       = $kbIds -join ", "
                severity = if($upd.MsrcSeverity){$upd.MsrcSeverity}else{"N/A"}
                sizeMB   = [math]::Round($upd.MaxDownloadSize/1MB,1)
            }
        }
        if ($results.Updates.Count -gt 0) { Write-WARN "Pending updates: $($results.Updates.Count)" }
        else { Write-OK "Windows Updates: Up to date" }
    } catch { $updateInfo["note"]="COM update search unavailable" }
} else { $updateInfo["note"]="Skipped in quick mode" }

# ============================================================
#  MODULE 11 — CAMERA
# ============================================================
Write-HEAD "MODULE 11: CAMERA"

$cameraInfo = [ordered]@{ devices=@(); count=0; issues=@() }
foreach ($cam in (Get-PnpDevice -Class Camera -ErrorAction SilentlyContinue)) {
    $camDrv = $allSignedDrivers | Where-Object { $_.DeviceID -eq $cam.InstanceId } | Select-Object -First 1
    $entry  = [ordered]@{
        name          = $cam.FriendlyName
        status        = $cam.Status
        instanceId    = $cam.InstanceId
        driverVersion = if($camDrv){$camDrv.DriverVersion}else{"Unknown"}
        driverDate    = if($camDrv -and $camDrv.DriverDate){$camDrv.DriverDate.ToString("yyyy-MM-dd")}else{"Unknown"}
        type          = if($cam.InstanceId -match "USB\\VID"){"External USB"}else{"Built-in"}
    }
    $cameraInfo.devices += $entry
    if ($cam.Status -eq "OK") { Write-OK "Camera: $($cam.FriendlyName) [$($entry.type)] Driver: $($entry.driverVersion)" }
    else { Write-CRIT "Camera ERROR: $($cam.FriendlyName)"; $cameraInfo.issues += "Camera error: $($cam.FriendlyName)" }
}
if ($cameraInfo.devices.Count -eq 0) {
    foreach ($d in (Get-CimInstance Win32_PnPEntity | Where-Object { ($_.PNPClass -eq "Image" -or $_.Name -match "camera|webcam|imaging") -and $_.Status -eq "OK" })) {
        $cameraInfo.devices += [ordered]@{ name=$d.Name; status=$d.Status; type="Imaging Device"; driverVersion="N/A"; driverDate="N/A" }
        Write-OK "Imaging: $($d.Name)"
    }
}
$cameraInfo.count = $cameraInfo.devices.Count
if ($cameraInfo.count -eq 0) { Write-WARN "No camera detected"; $cameraInfo.issues += "No camera device found" }

# ============================================================
#  MODULE 12 — WIFI SIGNAL
# ============================================================
Write-HEAD "MODULE 12: WIFI SIGNAL"

$wifiInfo = [ordered]@{ currentConnection=$null; availableNetworks=@(); driver=$null; issues=@() }
try {
    $wlanOut    = & netsh wlan show interfaces 2>&1
    $parseIface = [ordered]@{}
    foreach ($line in $wlanOut) {
        if ($line -match "^\s+Name\s+:\s+(.+)")         { $parseIface["adapterName"]   = $Matches[1].Trim() }
        if ($line -match "SSID\s+:\s+(.+)")             { $parseIface["ssid"]          = $Matches[1].Trim() }
        if ($line -match "State\s+:\s+(.+)")            { $parseIface["state"]         = $Matches[1].Trim() }
        if ($line -match "Signal\s+:\s+(\d+)%")         { $parseIface["signalPercent"] = [int]$Matches[1] }
        if ($line -match "Radio type\s+:\s+(.+)")       { $parseIface["radioType"]     = $Matches[1].Trim() }
        if ($line -match "Channel\s+:\s+(\d+)")         { $parseIface["channel"]       = [int]$Matches[1] }
        if ($line -match "Receive rate.*:\s+([\d.]+)")  { $parseIface["rxRateMbps"]    = [double]$Matches[1] }
        if ($line -match "Transmit rate.*:\s+([\d.]+)") { $parseIface["txRateMbps"]    = [double]$Matches[1] }
        if ($line -match "Authentication\s+:\s+(.+)")   { $parseIface["auth"]          = $Matches[1].Trim() }
        if ($line -match "Cipher\s+:\s+(.+)")           { $parseIface["cipher"]        = $Matches[1].Trim() }
        if ($line -match "BSSID\s+:\s+(.+)")            { $parseIface["bssid"]         = $Matches[1].Trim() }
    }
    $wifiInfo.currentConnection = $parseIface
    $sig = $parseIface["signalPercent"]
    if ($sig) {
        if   ($sig -lt 40) { Write-CRIT "WiFi: $sig% — Critical"; $wifiInfo.issues += "WiFi signal critical: $sig%" }
        elseif ($sig -lt 65) { Write-WARN "WiFi: $sig% — Moderate" }
        else { Write-OK "WiFi: $($parseIface.ssid) Signal:$sig% Ch:$($parseIface.channel) Rx:$($parseIface.rxRateMbps)Mbps [$($parseIface.radioType)]" }
    }
    # Nearby networks
    $netList = & netsh wlan show networks mode=bssid 2>&1
    $curNet  = $null
    foreach ($line in $netList) {
        if ($line -match "SSID\s+\d+\s+:\s+(.+)")       { $curNet=[ordered]@{ssid=$Matches[1].Trim()} }
        if ($curNet -and $line -match "Signal\s+:\s+(\d+)%") { $curNet["signal"]=[int]$Matches[1] }
        if ($curNet -and $line -match "Radio type\s+:\s+(.+)") { $curNet["radio"]=$Matches[1].Trim(); $wifiInfo.availableNetworks += $curNet; $curNet=$null }
    }
} catch { $wifiInfo["status"]="netsh wlan not available" }

$wifiPnp = Get-PnpDevice | Where-Object { $_.Class -eq "Net" -and $_.FriendlyName -match "Wi-Fi|Wireless|WLAN|802.11" } | Select-Object -First 1
if ($wifiPnp) {
    $wDrv = $allSignedDrivers | Where-Object { $_.DeviceID -eq $wifiPnp.InstanceId } | Select-Object -First 1
    $wifiInfo.driver = [ordered]@{ adapterName=$wifiPnp.FriendlyName; status=$wifiPnp.Status; driverVersion=if($wDrv){$wDrv.DriverVersion}else{"Unknown"}; driverDate=if($wDrv -and $wDrv.DriverDate){$wDrv.DriverDate.ToString("yyyy-MM-dd")}else{"Unknown"}; provider=if($wDrv){$wDrv.DriverProviderName}else{"Unknown"} }
    Write-OK "WiFi Driver: $($wifiInfo.driver.driverVersion) ($($wifiInfo.driver.driverDate)) — $($wifiInfo.driver.provider)"
}

# ============================================================
#  MODULE 13 — DISPLAY PANEL
# ============================================================
Write-HEAD "MODULE 13: DISPLAY PANEL"

$displayInfo = [ordered]@{ monitors=@(); issues=@() }
function Decode-MonStr { param($b) if(!$b){"Unknown"}else{([System.Text.Encoding]::ASCII.GetString($b) -replace '\x00','').Trim()} }
try {
    $vcDisplay = Get-CimInstance Win32_VideoController | Select-Object -First 1   # fetched once outside loop
    foreach ($mon in (Get-CimInstance -Namespace root\wmi -ClassName WmiMonitorID -ErrorAction Stop)) {
        $vc   = $vcDisplay
        $mfrCode = Decode-MonStr $mon.ManufacturerName   # 3-char EDID manufacturer ID e.g. "AUO","BOE","LEN"
        # Internal laptop panels use specific EDID panel-maker codes (not monitor brands like LG/Samsung)
        $internalMfrCodes = "AUO|BOE|CMN|SHP|IVO|LGD|SDC|HSD|CPT|CHI|HAN|INX|PEN|NCP|KDB|CSW|VBF|TMX"
        $entry = [ordered]@{
            manufacturer   = $mfrCode
            name           = Decode-MonStr $mon.UserFriendlyName
            serial         = Decode-MonStr $mon.SerialNumberID
            yearMfr        = $mon.YearOfManufacture
            weekMfr        = $mon.WeekOfManufacture
            connectionType = if($mfrCode -match $internalMfrCodes){"Internal Panel"}else{"External Monitor"}
            resolution     = if($vc){"$($vc.CurrentHorizontalResolution)x$($vc.CurrentVerticalResolution)"}else{"Unknown"}
            refreshHz      = if($vc){$vc.CurrentRefreshRate}else{0}
            colorBit       = if($vc){$vc.CurrentBitsPerPixel}else{0}
        }
        $displayInfo.monitors += $entry
        Write-OK "Display: $($entry.name) ($($entry.manufacturer)) [$($entry.connectionType)] $($entry.resolution) @ $($entry.refreshHz)Hz"
    }
} catch { $displayInfo["note"]="WmiMonitorID unavailable"; Write-WARN "Display WMI unavailable" }

# ============================================================
#  MODULE 14 — INPUT DEVICES
# ============================================================
Write-HEAD "MODULE 14: INPUT DEVICES"

$inputInfo = [ordered]@{ keyboards=@(); mice=@(); touchpads=@(); issues=@() }
foreach ($kb in (Get-PnpDevice -Class Keyboard -ErrorAction SilentlyContinue)) {
    $entry = [ordered]@{ name=$kb.FriendlyName; status=$kb.Status; type=if($kb.InstanceId -match "USB\\VID"){"External USB"}else{"Built-in"} }
    $inputInfo.keyboards += $entry
    if ($kb.Status -eq "OK") { Write-OK "Keyboard: $($kb.FriendlyName)" } else { Write-CRIT "Keyboard ERROR: $($kb.FriendlyName)"; $inputInfo.issues += "Keyboard error: $($kb.FriendlyName)" }
}
foreach ($m in (Get-PnpDevice -Class Mouse -ErrorAction SilentlyContinue)) {
    $isTp  = $m.FriendlyName -match "TouchPad|Synaptics|ELAN|Alps|Precision|Clickpad"
    $entry = [ordered]@{ name=$m.FriendlyName; status=$m.Status; type=if($isTp){"Touchpad"}elseif($m.InstanceId -match "USB\\VID"){"External USB Mouse"}else{"Mouse"} }
    if ($isTp) { $inputInfo.touchpads += $entry } else { $inputInfo.mice += $entry }
    if ($m.Status -eq "OK") { Write-OK "$($entry.type): $($m.FriendlyName)" } else { Write-CRIT "$($entry.type) ERROR: $($m.FriendlyName)"; $inputInfo.issues += "$($entry.type) error: $($m.FriendlyName)" }
}
if ($inputInfo.touchpads.Count -eq 0) { Write-WARN "No touchpad — may be disabled in BIOS"; $inputInfo.issues += "Touchpad not found" }
Write-OK "Keyboards: $($inputInfo.keyboards.Count) | Mice: $($inputInfo.mice.Count) | Touchpads: $($inputInfo.touchpads.Count)"

# ============================================================
#  MODULE 15 — THERMAL THROTTLING
# ============================================================
Write-HEAD "MODULE 15: THERMAL THROTTLING"

$thermalInfo = [ordered]@{ throttlingDetected=$false; cpuMaxFreqMHz=0; cpuCurrentMHz=0; throttlePercent=0; perfCounterFreqPct=$null; thermalZones=@(); issues=@() }

# PRIMARY throttle detection: perf counter "% of Maximum Frequency"
# This is the ONLY reliable real-time indicator.
# Win32_Processor.CurrentClockSpeed is NOT used for throttle — it reads IDLE C-state
# frequency at rest (e.g. 800 MHz), causing false positives on every modern laptop.
try {
    $pct = (Get-Counter '\Processor Information(_Total)\% of Maximum Frequency' -SampleInterval 1 -MaxSamples 2 -ErrorAction Stop).CounterSamples.CookedValue | Measure-Object -Average
    $thermalInfo["perfCounterFreqPct"] = [math]::Round($pct.Average, 1)
    if ($thermalInfo.perfCounterFreqPct -lt 60) {
        $thermalInfo.throttlingDetected = $true
        Write-CRIT "THERMAL THROTTLING: CPU sustained at $($thermalInfo.perfCounterFreqPct)% of max frequency"
        $thermalInfo.issues += "CPU throttling at $($thermalInfo.perfCounterFreqPct)% of max"
    } elseif ($thermalInfo.perfCounterFreqPct -lt 80) {
        Write-WARN "CPU frequency at $($thermalInfo.perfCounterFreqPct)% of max — monitor for thermal throttling"
    } else {
        Write-OK "No throttling — CPU running at $($thermalInfo.perfCounterFreqPct)% of max frequency"
    }
} catch { $thermalInfo["perfCounterFreqPct"] = $null; Write-WARN "Perf counter unavailable for throttle detection" }

# INFORMATIONAL only: record raw WMI clock speeds (not used for throttle decision)
try {
    $pp = Get-CimInstance Win32_Processor | Select-Object -First 1
    $thermalInfo.cpuMaxFreqMHz  = $pp.MaxClockSpeed
    $thermalInfo.cpuCurrentMHz  = $pp.CurrentClockSpeed
    $thermalInfo.throttlePercent= if($thermalInfo.perfCounterFreqPct){$thermalInfo.perfCounterFreqPct}else{$null}
} catch {}
try {
    foreach ($tz in (Get-CimInstance -Namespace root\wmi -ClassName MSAcpi_ThermalZoneTemperature -ErrorAction Stop)) {
        $tC = [math]::Round(($tz.CurrentTemperature/10)-273.15,1)
        $thermalInfo.thermalZones += [ordered]@{ zone=$tz.InstanceName; tempC=$tC }
        if   ($tC -gt 90) { Write-CRIT "Thermal zone: $tC°C CRITICAL" }
        elseif ($tC -gt 80) { Write-WARN "Thermal zone: $tC°C High" }
        else { Write-OK "Thermal zone: $tC°C" }
    }
} catch { $thermalInfo["thermalZoneNote"]="WMI thermal zones not available" }

# ============================================================
#  MODULE 16 — USB PORT DIAGNOSTICS
# ============================================================
Write-HEAD "MODULE 16: USB PORTS"

$usbInfo = [ordered]@{ controllers=@(); hubs=@(); devices=@(); summary=[ordered]@{}; issues=@() }
foreach ($ctrl in (Get-CimInstance Win32_USBController -ErrorAction SilentlyContinue)) {
    $ctrlDrv = $allSignedDrivers | Where-Object { $_.DeviceID -eq $ctrl.PNPDeviceID } | Select-Object -First 1
    $usbInfo.controllers += [ordered]@{ name=$ctrl.Name; status=$ctrl.Status; manufacturer=$ctrl.Manufacturer; driverVersion=if($ctrlDrv){$ctrlDrv.DriverVersion}else{"Unknown"} }
    if ($ctrl.Status -eq "OK") { Write-OK "USB Ctrl: $($ctrl.Name)" }
    else { Write-CRIT "USB Ctrl ERROR: $($ctrl.Name)"; $usbInfo.issues += "USB controller error: $($ctrl.Name)" }
}
$usb2=0; $usb3=0
foreach ($hub in (Get-PnpDevice | Where-Object { $_.FriendlyName -match "USB Root Hub|USB Hub" -and $_.Status -eq "OK" })) {
    $isU3 = $hub.FriendlyName -match "USB 3|xHCI|SuperSpeed"
    if ($isU3){$usb3++}else{$usb2++}
    $usbInfo.hubs += [ordered]@{ name=$hub.FriendlyName; version=if($isU3){"USB 3.x"}else{"USB 2.0"} }
}
foreach ($dev in (Get-CimInstance Win32_PnPEntity | Where-Object { $_.PNPDeviceID -match "^USB\\" -and $_.PNPClass -notin @("USB","USBDevice") -and $_.Name -notmatch "Root Hub|Host Controller|Composite" -and $_.Status -eq "OK" })) {
    $usbInfo.devices += [ordered]@{ name=$dev.Name; class=$dev.PNPClass; manufacturer=$dev.Manufacturer }
}
$tbDev = Get-PnpDevice | Where-Object { $_.FriendlyName -match "Thunderbolt|USB4" } | Select-Object -First 1
$usbInfo["thunderbolt"] = if($tbDev){[ordered]@{found=$true;name=$tbDev.FriendlyName;status=$tbDev.Status}}else{[ordered]@{found=$false}}
$usbInfo.summary = [ordered]@{ controllerCount=$usbInfo.controllers.Count; usb2Hubs=$usb2; usb3Hubs=$usb3; connectedDevices=$usbInfo.devices.Count; thunderbolt=($tbDev -ne $null) }
Write-OK "USB 2.0 hubs: $usb2 | USB 3.x hubs: $usb3 | Connected devices: $($usbInfo.devices.Count)"
if ($tbDev) { Write-OK "Thunderbolt/USB4: $($tbDev.FriendlyName)" } else { Write-INFO "Thunderbolt: Not detected" }

# ============================================================
#  MODULE 17 — PERFORMANCE BENCHMARKS (skipped in quick mode)
# ============================================================
$benchInfo = [ordered]@{ diskSeqReadMBps=$null; diskSeqWriteMBps=$null; cpuBenchMs=$null; ramBenchGBps=$null; notes=@() }
if (!$isQuick) {
    Write-HEAD "MODULE 17: PERFORMANCE BENCHMARKS"
    # Disk: 128MB sequential read/write
    try {
        $testFile   = "$env:TEMP\HackRore_dt_$timestamp.tmp"
        $blockMB    = 256   # 256MB — large enough to exceed typical file cache on most systems
        $blockBytes = $blockMB * 1MB
        $buf        = New-Object byte[] $blockBytes
        # Fill with random data (defeats SSD compression in SandForce/DRAMless controllers)
        [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($buf)
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        [System.IO.File]::WriteAllBytes($testFile, $buf)
        $sw.Stop()
        $benchInfo["diskSeqWriteMBps"] = [math]::Round($blockMB/$sw.Elapsed.TotalSeconds,1)
        # Read back — may still be OS-cached on RAM-heavy systems; noted in benchNote
        $sw.Restart()
        [void][System.IO.File]::ReadAllBytes($testFile)
        $sw.Stop()
        $benchInfo["diskSeqReadMBps"] = [math]::Round($blockMB/$sw.Elapsed.TotalSeconds,1)
        $benchInfo["benchNote"] = "256MB random data test. Read may be OS-cached on >16GB RAM systems — use CrystalDiskMark for definitive results."
        Remove-Item $testFile -Force -ErrorAction SilentlyContinue
        if   ($benchInfo.diskSeqReadMBps -lt 100)  { Write-CRIT "Disk Read: $($benchInfo.diskSeqReadMBps) MB/s — Very slow (HDD/failing SSD)"; $benchInfo.notes += "Critical disk speed: $($benchInfo.diskSeqReadMBps) MB/s" }
        elseif ($benchInfo.diskSeqReadMBps -lt 400) { Write-WARN "Disk Read: $($benchInfo.diskSeqReadMBps) MB/s — SATA range" }
        else { Write-OK "Disk Read: $($benchInfo.diskSeqReadMBps) MB/s — NVMe/fast SATA" }
        Write-OK "Disk Write: $($benchInfo.diskSeqWriteMBps) MB/s"
    } catch { $benchInfo["diskError"]=$_.Exception.Message }
    # CPU: Sieve of Eratosthenes 500k
    try {
        $sw    = [System.Diagnostics.Stopwatch]::StartNew()
        $limit = 500000; $sieve = New-Object bool[] ($limit+1)
        for ($i=2;$i*$i -le $limit;$i++) { if(!$sieve[$i]){ for($j=$i*$i;$j -le $limit;$j+=$i){$sieve[$j]=$true} } }
        $sw.Stop()
        $benchInfo["cpuBenchMs"] = [math]::Round($sw.Elapsed.TotalMilliseconds,0)
        $benchInfo["cpuBenchTier"] = if($benchInfo.cpuBenchMs -lt 300){"Fast — Modern i5/i7/Ryzen"}elseif($benchInfo.cpuBenchMs -lt 600){"Good — Mid-range"}elseif($benchInfo.cpuBenchMs -lt 1200){"Average — Older i5/i3"}else{"Slow — Old CPU or throttling"}
        Write-OK "CPU Bench: $($benchInfo.cpuBenchMs) ms — $($benchInfo.cpuBenchTier)"
    } catch {}
    # RAM: 64MB copy bandwidth
    try {
        $sw  = [System.Diagnostics.Stopwatch]::StartNew()
        $src = New-Object byte[] (64MB); $dst = New-Object byte[] (64MB)
        [System.Buffer]::BlockCopy($src,0,$dst,0,$src.Length)
        $sw.Stop()
        $benchInfo["ramBenchGBps"] = [math]::Round((64/1024)/$sw.Elapsed.TotalSeconds,2)
        Write-OK "RAM Bandwidth: $($benchInfo.ramBenchGBps) GB/s"
    } catch {}
} else { Write-INFO "Benchmarks: skipped in quick mode" }

# ============================================================
#  SCORING ENGINE
# ============================================================
Write-HEAD "CALCULATING SYSTEM HEALTH SCORE"

$score      = 100
$issues     = @()
$critIssues = @()

# CPU temp
if ($cpuInfo.tempCelsius -gt 90)   { $score-=20; $critIssues+="CPU temp critical ($($cpuInfo.tempCelsius)°C)" }
elseif ($cpuInfo.tempCelsius -gt 80) { $score-=10; $issues+="CPU temp high ($($cpuInfo.tempCelsius)°C)" }

# RAM
if   ($ramInfo.usedPercent -gt 90) { $score-=10; $issues+="RAM usage critical ($($ramInfo.usedPercent)%)" }
elseif ($ramInfo.usedPercent -gt 75) { $score-=5;  $issues+="RAM usage high ($($ramInfo.usedPercent)%)" }

# SMART — deduplicated: only penalise once per disk, list specific attributes
foreach ($d in $diskInfo) {
    $sa = $d.smartAttributes
    $diskCrits = @()
    if ($sa.reallocatedSectors -gt 0) { $diskCrits += "Reallocated sectors: $($sa.reallocatedSectors)" }
    if ($sa.pendingSectors     -gt 0) { $diskCrits += "Pending sectors: $($sa.pendingSectors)" }
    if ($sa.uncorrectableErrors-gt 0) { $diskCrits += "Uncorrectable errors: $($sa.uncorrectableErrors)" }

    if ($d.smartOK -eq $false) {
        if ($diskCrits.Count -gt 0) {
            # Specific attribute failure — report detail, not generic "failure"
            $score -= 30
            foreach ($dc in $diskCrits) { $critIssues += "SMART $($d.model): $dc" }
        } else {
            # Generic failure prediction (Layer 1 or Layer 2)
            $score -= 30
            $critIssues += "SMART failure predicted: $($d.model) — $($d.smartStatus)"
        }
    }
}

# Battery
if ($batInfo -and $batInfo.wearPercent) {
    if   ($batInfo.wearPercent -gt 40) { $score-=15; $issues+="Battery wear high ($($batInfo.wearPercent)%)" }
    elseif ($batInfo.wearPercent -gt 25) { $score-=7;  $issues+="Battery wear moderate ($($batInfo.wearPercent)%)" }
}

# Device errors
$score -= ($devInfo.errors.Count * 5)
foreach ($e in $devInfo.errors) { $issues+="Device error: $($e.name) [Code $($e.code)] — $(if($e.suggestedFix){$e.suggestedFix}else{'check Device Manager'})" }

# Event log
$score -= ($evtInfo.critical.Count * 5)
foreach ($e in $evtInfo.critical) { $critIssues+="Critical event ID $($e.eventId): $($e.source)$(if($e.resolution){' — '+$e.resolution})" }

# Activation
if ($activationStatus -ne "Activated") { $score-=20; $critIssues+="Windows not activated" }

# Camera
foreach ($c in $cameraInfo.issues) { $score-=5; $issues+=$c }

# WiFi
if ($wifiInfo.currentConnection -and $wifiInfo.currentConnection["signalPercent"] -lt 40) { $score-=5; $issues+="WiFi signal critically weak ($($wifiInfo.currentConnection['signalPercent'])%)" }

# Input
foreach ($inp in $inputInfo.issues) { $score-=5; $issues+=$inp }

# Thermal
if ($thermalInfo.throttlingDetected) { $score-=15; $critIssues+="CPU thermal throttling at $($thermalInfo.throttlePercent)% of max" }

# Startup
if ($startupItems.Count -gt 20) { $score-=5; $issues+="High startup count ($($startupItems.Count))" }

# Updates
if ($updateInfo.pendingCount -gt 10) { $score-=5; $issues+="Many pending updates ($($updateInfo.pendingCount))" }

# USB
foreach ($u in $usbInfo.issues) { $score-=5; $issues+=$u }

# Disk speed
if ($benchInfo.diskSeqReadMBps -and $benchInfo.diskSeqReadMBps -lt 100)  { $score-=10; $critIssues+="Disk read critically slow: $($benchInfo.diskSeqReadMBps) MB/s" }
elseif ($benchInfo.diskSeqReadMBps -and $benchInfo.diskSeqReadMBps -lt 250) { $score-=5; $issues+="Disk read below average: $($benchInfo.diskSeqReadMBps) MB/s" }

# Bluetooth errors
foreach ($e in $btInfo.errors) { $score-=5; $issues+="Bluetooth error: $($e.name) [Code $($e.code)]" }

$score   = [math]::Max(0,[math]::Min(100,$score))
$grade   = if($score -ge 85){"GOOD"}elseif($score -ge 65){"FAIR"}elseif($score -ge 45){"POOR"}else{"CRITICAL"}
$verdict = if($critIssues.Count -eq 0 -and $score -ge 70){"PASS"}elseif($critIssues.Count -le 1 -and $score -ge 50){"CONDITIONAL PASS"}else{"FAIL"}

Write-Host "`n  SYSTEM SCORE: $score% ($grade)  →  VERDICT: $verdict`n" -ForegroundColor $(if($score -ge 70){"Green"}elseif($score -ge 50){"Yellow"}else{"Red"})

# ============================================================
#  ASSEMBLE JSON REPORT
# ============================================================
$report = [ordered]@{
    meta         = [ordered]@{ toolName="HackRore TechToolkit"; version="2.9"; scanTime=(Get-Date -Format "yyyy-MM-dd HH:mm:ss"); scanMode=$Mode; scannerHost=$env:COMPUTERNAME; scannerUser=$env:USERNAME }
    score        = [ordered]@{ value=$score; grade=$grade; verdict=$verdict }
    system       = $systemInfo
    cpu          = $cpuInfo
    ram          = $ramInfo
    storage      = [ordered]@{ disks=$diskInfo; volumes=$volumes }
    battery      = $batInfo
    gpu          = $gpuInfo
    network      = $netInfo
    bluetooth    = $btInfo
    devices      = $devInfo
    eventLog     = $evtInfo
    startup      = [ordered]@{ items=$startupItems; count=$startupItems.Count }
    processes    = $processInfo
    updates      = $updateInfo
    camera       = $cameraInfo
    wifi         = $wifiInfo
    display      = $displayInfo
    inputDevices = $inputInfo
    thermal      = $thermalInfo
    usbPorts     = $usbInfo
    benchmarks   = $benchInfo
    diagnosis    = [ordered]@{ criticalIssues=$critIssues; warnings=$issues; totalIssues=$critIssues.Count+$issues.Count }
}

# Refurb mode: add resale certificate section to report
if ($isRefurb) {
    $refurbCert = [ordered]@{
        certDate       = (Get-Date -Format "yyyy-MM-dd")
        technician     = $env:USERNAME
        machine        = "$($systemInfo.manufacturer) $($systemInfo.model)"
        serial         = $systemInfo.serial
        verdict        = $verdict
        score          = $score
        grade          = $grade
        batteryWear    = if($batInfo){"$($batInfo.wearPercent)% wear | $($batInfo.cycleCount) cycles"}else{"N/A (Desktop)"}
        storageHealth  = ($diskInfo | ForEach-Object { "$($_.model): $($_.smartStatus)" }) -join " | "
        osActivation   = $activationStatus
        criticalIssues = $critIssues
        warnings       = $issues
        recommendation = switch($verdict){
            "PASS"             { "Ready for resale. All hardware checks passed." }
            "CONDITIONAL PASS" { "Resale with disclosure. Minor issues present — see warnings." }
            "FAIL"             { "Not recommended for resale without repair. Critical issues found." }
        }
    }
    $report["refurbCertificate"] = $refurbCert
    Write-INFO "Refurbishment certificate added to report"
}

$report | ConvertTo-Json -Depth 8 | Out-File -FilePath $jsonPath -Encoding UTF8
Write-OK "JSON: $jsonPath"

# ============================================================
#  HTML REPORT (self-contained, dark theme, print-ready)
# ============================================================
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
.logo{font-size:22px;font-weight:700;color:#fff;letter-spacing:4px}.logo span{color:#00ff88}
.sub{font-size:9px;color:#333;letter-spacing:2px;margin-top:3px}
.score-big{font-size:36px;font-weight:700;font-family:monospace}
.body{padding:24px 30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.card{background:#0d0d0d;border:1px solid #1a1a1a;border-radius:4px;padding:16px}
.card-title{font-size:9px;letter-spacing:2px;color:#444;text-transform:uppercase;margin-bottom:12px;border-bottom:1px solid #111;padding-bottom:8px}
.row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #0d0d0d;font-size:11px}
.row .k{color:#444}.row .v{color:#bbb;text-align:right;max-width:60%;word-break:break-word}
.badge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:2px;letter-spacing:1px}
.ok{color:#00ff88;border:1px solid #00ff88}.warn{color:#ffbb00;border:1px solid #ffbb00}.crit{color:#ff4444;border:1px solid #ff4444}
.issue{padding:6px 0;border-bottom:1px solid #0d0d0d;font-size:11px;line-height:1.5}
.issue.c{color:#ff6644}.issue.w{color:#ffbb00}.issue.ok{color:#00aa66}
.bar-wrap{margin:6px 0}.bar-label{font-size:10px;color:#555;margin-bottom:3px}
.bar-bg{background:#1a1a1a;height:5px;border-radius:2px;overflow:hidden}
.bar-fill{height:100%;border-radius:2px}
.bar-val{font-size:10px;margin-top:2px}
.verdict-box{grid-column:1/-1;text-align:center;padding:20px;border:1px solid #1a1a1a;border-radius:4px;background:#050505}
.verdict-text{font-size:24px;font-weight:700;letter-spacing:4px;margin-top:8px}
.full{grid-column:1/-1}
.half{grid-column:span 2}
footer{text-align:center;padding:20px;color:#222;font-size:10px;letter-spacing:2px}
.fix-note{font-size:10px;color:#ff9944;padding:2px 0 4px 12px;border-left:2px solid #ff444466}
.evt-id{font-size:9px;color:#555;font-family:monospace}
.kb-badge{font-size:9px;color:#00aaff;padding:1px 5px;border:1px solid #00aaff33;border-radius:2px;margin-left:4px}

/* ── PRINT STYLESHEET (A4 Refurbishment Certificate) ─────── */
@media print {
  body{background:#fff !important;color:#000 !important;font-size:11px}
  .header{background:#fff !important;border-bottom:2px solid #000 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .logo{color:#000 !important}.logo span{color:#006633 !important}
  .score-big{color:#006633 !important}
  .body{grid-template-columns:1fr 1fr;gap:10px;padding:16px}
  .card{background:#fff !important;border:1px solid #ccc !important;break-inside:avoid}
  .card-title{color:#333 !important;border-bottom:1px solid #ccc !important}
  .row .k{color:#666 !important}.row .v{color:#000 !important}
  .verdict-box{background:#fff !important;border:2px solid #000 !important}
  .verdict-text{color:#006633 !important}
  .issue.c{color:#cc0000 !important}.issue.w{color:#996600 !important}.issue.ok{color:#006633 !important}
  .bar-bg{background:#eee !important}.bar-fill{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  footer{color:#999 !important;border-top:1px solid #ccc;margin-top:16px}
  .no-print{display:none !important}
}
</style>
</head>
<body>
<script id="reportData" type="application/json">$jsonContent</script>
<script>
const REPORT = JSON.parse(document.getElementById('reportData').textContent);
function sc(s){return s>=85?'#00ff88':s>=65?'#ffbb00':'#ff4444'}
function bar(val,label,color){const c=val>80?'#ff4444':val>60?'#ffbb00':color||'#00ff88';return '<div class="bar-wrap"><div class="bar-label">'+label+'</div><div class="bar-bg"><div class="bar-fill" style="width:'+Math.min(100,val)+'%;background:'+c+'"></div></div><div class="bar-val" style="color:'+c+'">'+val+'%</div></div>';}
function row(k,v){return '<div class="row"><span class="k">'+k+'</span><span class="v">'+v+'</span></div>'}
function badge(t,cls){return '<span class="badge '+cls+'">'+t+'</span>'}

document.addEventListener('DOMContentLoaded',()=>{
  const R=REPORT, s=R.score;
  document.title='HackRore — '+R.system.model;
  const scoreCol=sc(s.value);

  let html='';

  // Header
  html+='<div class="header"><div><div class="logo">HACK<span>RORE</span></div><div class="sub">TECHTOOLKIT v2.9 · AI-POWERED DIAGNOSTICS · '+R.meta.scanTime+' · MODE: '+R.meta.scanMode.toUpperCase()+'</div></div>';
  html+='<div style="text-align:right"><div style="font-size:10px;color:#444;letter-spacing:2px">SYSTEM SCORE</div><div class="score-big" style="color:'+scoreCol+'">'+s.value+'% <span style="font-size:14px">'+s.grade+'</span></div><button class="no-print" onclick="window.print()" style="margin-top:6px;background:#111;border:1px solid #333;color:#aaa;padding:4px 12px;cursor:pointer;font-size:10px;letter-spacing:1px">🖨 PRINT REPORT</button></div></div>';

  html+='<div class="body">';

  // Verdict
  html+='<div class="verdict-box"><div style="font-size:9px;color:#444;letter-spacing:2px">REFURBISHMENT VERDICT</div><div class="verdict-text" style="color:'+scoreCol+'">'+s.verdict+'</div><div style="font-size:11px;color:#555;margin-top:8px">'+R.system.manufacturer+' '+R.system.model+' · Serial: '+R.system.serial+'</div><div style="font-size:10px;color:#333;margin-top:4px">'+R.system.osName+' · '+R.system.activation+'</div></div>';

  // System
  html+='<div class="card"><div class="card-title">System Identity</div>'+row('Manufacturer',R.system.manufacturer)+row('Model',R.system.model)+row('Serial',R.system.serial)+row('Motherboard',R.system.motherboard)+row('BIOS',R.system.biosVersion+' ('+R.system.biosDate+')')+row('OS',R.system.osName)+row('Build',R.system.osBuild)+row('Architecture',R.system.osArch)+row('Last Boot',R.system.lastBoot)+row('Uptime',R.system.uptime+' hrs')+row('Type',R.system.pcType)+row('Activation',badge(R.system.activation,R.system.activation==='Activated'?'ok':'crit'))+'</div>';

  // CPU
  html+='<div class="card"><div class="card-title">Processor</div>'+row('Model',R.cpu.name)+row('Cores / Threads',R.cpu.cores+'C / '+R.cpu.threads+'T')+row('Max Speed',R.cpu.maxSpeedMHz+' MHz')+row('Current Speed',R.cpu.currentMHz+' MHz')+row('L2 Cache',R.cpu.l2CacheKB+' KB')+row('L3 Cache',R.cpu.l3CacheKB+' KB')+bar(R.cpu.loadPercent,'CPU Load %');
  if(R.cpu.tempCelsius){const tc=R.cpu.tempCelsius>90?'#ff4444':R.cpu.tempCelsius>80?'#ffbb00':'#00aa66'; html+=row('Temperature','<span style="color:'+tc+'">'+R.cpu.tempCelsius+'°C</span> <span style="font-size:9px;color:#444">['+R.cpu.tempMethod+']</span>'); }
  else if(R.cpu.tempNote){ html+='<div style="font-size:10px;color:#555;margin-top:6px;padding:6px;background:#0a0a0a;border:1px solid #1a1a1a">⚠ '+R.cpu.tempNote+'</div>'; }
  html+='</div>';

  // RAM
  html+='<div class="card"><div class="card-title">Memory</div>'+row('Total RAM',R.ram.totalGB+' GB')+row('Available',R.ram.availableGB+' GB')+row('Slots Used',R.ram.slots)+bar(R.ram.usedPercent,'RAM Usage %');
  (R.ram.modules||[]).forEach(m=>{ html+=row(m.slot,m.capacityGB+'GB '+m.type+' '+m.speedMHz+'MHz'); if(m.partNumber) html+='<div style="font-size:9px;color:#333;padding-bottom:4px">'+m.partNumber+'</div>'; });
  html+='</div>';

  // Storage
  (R.storage.disks||[]).forEach(d=>{
    html+='<div class="card"><div class="card-title">Storage</div>'+row('Model',d.model)+row('Type',d.storageType||d.interface)+row('Size',d.sizeGB+' GB')+row('Serial',d.serialNumber)+row('SMART',badge(d.smartStatus,d.smartOK===false?'crit':d.smartOK===true?'ok':'warn'));
    if(d.busType) html+=row('Bus',d.busType);
    if(d.mediaTypeDetailed) html+=row('Media',d.mediaTypeDetailed);
    const sa=d.smartAttributes||{};
    if(sa.powerOnHours!=null) html+=row('Power-On Hours',sa.powerOnHours+' (~'+Math.round(sa.powerOnHours/8760*10)/10+' yrs)');
    if(sa.powerCycles!=null)  html+=row('Power Cycles',sa.powerCycles);
    if(sa.tempCelsius!=null)  html+=row('Drive Temp',sa.tempCelsius+'°C');
    if(sa.reallocatedSectors>0) html+='<div class="issue c">❌ Reallocated Sectors: '+sa.reallocatedSectors+'</div>';
    if(sa.pendingSectors>0)     html+='<div class="issue c">❌ Pending Sectors: '+sa.pendingSectors+'</div>';
    if(sa.uncorrectableErrors>0)html+='<div class="issue c">❌ Uncorrectable Errors: '+sa.uncorrectableErrors+'</div>';
    html+='</div>';
  });
  (R.storage.volumes||[]).forEach(v=>{ html+='<div class="card"><div class="card-title">Volume '+v.drive+'</div>'+bar(v.usedPercent,'Used %')+'<div style="font-size:10px;color:#555;margin-top:4px">'+v.usedGB+' GB used / '+v.totalGB+' GB</div></div>'; });

  // Battery
  if(R.battery){
    html+='<div class="card"><div class="card-title">Battery</div>'+row('Name',R.battery.name)+row('Status',R.battery.statusText)+row('Charge',R.battery.chargePercent+'%')+row('Voltage',R.battery.voltage+' V')+row('Est. Runtime',R.battery.runtimeMinutes+' min');
    if(R.battery.wearPercent!=null) html+=bar(R.battery.wearPercent,'Wear % (0=new)','#00aaff');
    if(R.battery.cycleCount)   html+=row('Cycle Count',R.battery.cycleCount+' <span style="font-size:9px;color:#444">['+R.battery.cycleSource+']</span>');
    else html+=row('Cycle Count','<span style="color:#555">'+R.battery.cycleSource+'</span>');
    if(R.battery.cycleNote) html+='<div style="font-size:10px;color:#555;margin-top:4px">'+R.battery.cycleNote+'</div>';
    html+='</div>';
  }

  // GPU
  (R.gpu||[]).forEach(g=>{
    const vramCapped=g.vramMB>=4095;
    const vramDisplay=vramCapped?g.vramMB+' MB <span style="color:#ff9944;font-size:9px">⚠ WMI 32-bit cap — actual VRAM likely higher</span>':g.vramMB+' MB';
    html+='<div class="card"><div class="card-title">GPU</div>'+row('Name',g.name)+row('VRAM',vramDisplay)+row('Resolution',g.resolution)+row('Refresh Rate',g.refreshRate+' Hz')+row('Driver',g.driverVersion)+row('Driver Date',g.driverDate)+row('Status',badge(g.errorCode===0?'OK':'Error '+g.errorCode,g.errorCode===0?'ok':'crit'));
    if(vramCapped) html+='<div style="font-size:10px;color:#ff9944;margin-top:6px;padding:5px 8px;background:#1a0f00;border:1px solid #ff994433;border-radius:2px">WMI reports max 4095 MB due to 32-bit field. Check GPU spec sheet or GPU-Z for true VRAM.</div>';
    html+='</div>';
  });

  // Network
  html+='<div class="card"><div class="card-title">Network</div>'+row('IPv4',R.network.ipv4||'N/A')+row('DNS',R.network.dns||'N/A');
  (R.network.adapters||[]).forEach(a=>{ if(a.enabled) html+=row(a.name,a.speed||'N/A'); });
  html+='</div>';

  // Bluetooth
  if(R.bluetooth){
    const bt=R.bluetooth;
    html+='<div class="card"><div class="card-title">Bluetooth</div>'+row('Adapter',badge(bt.adapterName||'Not Detected',bt.adapterFound?'ok':'crit'))+row('Status',bt.adapterStatus);
    if(bt.driverVersion) html+=row('Driver',bt.driverVersion+' ('+bt.driverDate+')');
    if(bt.driverProvider) html+=row('Provider',bt.driverProvider);
    html+=row('BLE Support',bt.bleSupported?badge('Supported','ok'):badge('Unknown','warn'))+row('Paired Devices',(bt.pairedDevices||[]).length)+row('Connected Now',(bt.connectedDevices||[]).length);
    if(bt.pairedDevices&&bt.pairedDevices.length>0){
      html+='<div style="font-size:9px;color:#444;letter-spacing:1px;margin-top:10px;margin-bottom:4px">PAIRED HISTORY</div>';
      bt.pairedDevices.forEach(d=>{ html+='<div style="padding:3px 0;border-bottom:1px solid #0d0d0d;display:flex;justify-content:space-between;font-size:10px"><span style="color:#aaa">'+d.name+'</span><span style="color:#333">'+d.mac+'</span></div>'; });
    }
    if(bt.connectedDevices&&bt.connectedDevices.length>0){
      html+='<div style="font-size:9px;color:#00aa66;letter-spacing:1px;margin-top:8px;margin-bottom:4px">CONNECTED NOW</div>';
      bt.connectedDevices.forEach(d=>{ html+='<div style="font-size:10px;color:#00aa66;padding:2px 0">🔵 '+d.name+'</div>'; });
    }
    (bt.errors||[]).forEach(e=>{ html+='<div class="issue c">❌ '+e.name+' [Code '+e.code+']</div>'; });
    html+='</div>';
  }

  // Device Manager
  html+='<div class="card full"><div class="card-title">Device Manager — Errors: '+(R.devices.errors||[]).length+' | Warnings: '+(R.devices.warnings||[]).length+' | Disabled: '+(R.devices.disabled||[]).length+'</div>';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">';
  html+='<div>'+(R.devices.errors||[]).slice(0,10).map(e=>'<div class="issue c">❌ '+e.name+' [Code '+e.code+']'+(e.suggestedFix?'<div class="fix-note">→ '+e.suggestedFix+'</div>':'')+'</div>').join('')+'</div>';
  html+='<div>'+(R.devices.warnings||[]).slice(0,10).map(w=>'<div class="issue w">⚠ '+w.name+'</div>').join('')+'</div>';
  html+='<div>'+(R.devices.ok||[]).slice(0,8).map(o=>'<div class="issue ok" style="color:#1a331a">✓ '+o.name+'</div>').join('')+'</div>';
  html+='</div></div>';

  // Event Log
  html+='<div class="card half"><div class="card-title">Event Log (Last 7 days) — Critical: '+(R.eventLog.critical||[]).length+' | Errors: '+(R.eventLog.errors||[]).length+'</div>';
  if(R.eventLog.note){ html+='<div style="color:#555;font-size:11px">'+R.eventLog.note+'</div>'; }
  (R.eventLog.critical||[]).forEach(e=>{
    html+='<div class="issue c"><span class="evt-id">'+e.time+' · '+e.source+' · ID '+e.eventId+'</span><br>'+e.message.substring(0,100);
    if(e.resolution) html+='<div class="fix-note">→ '+e.resolution+'</div>';
    html+='</div>';
  });
  (R.eventLog.errors||[]).slice(0,6).forEach(e=>{ html+='<div class="issue w"><span class="evt-id">'+e.time+' · '+e.source+' · ID '+e.eventId+'</span><br>'+e.message.substring(0,80)+(e.resolution?'<div class="fix-note">→ '+e.resolution+'</div>':'')+'</div>'; });
  html+='</div>';

  // Windows Updates
  html+='<div class="card"><div class="card-title">Windows Updates</div>';
  if(R.updates.note&&!R.updates.pendingCount){ html+='<div style="color:#555;font-size:11px">'+R.updates.note+'</div>'; }
  else if(R.updates.pendingCount===0){ html+='<div style="color:#00aa66;font-size:11px;padding:8px 0">✅ Up to date</div>'; }
  else {
    html+=row('Pending',R.updates.pendingCount);
    (R.updates.updates||[]).slice(0,8).forEach(u=>{
      const sc2=u.severity==='Critical'?'#ff4444':u.severity==='Important'?'#ffbb00':'#aaa';
      html+='<div style="padding:5px 0;border-bottom:1px solid #0d0d0d;font-size:10px"><span style="color:'+sc2+'">'+u.title.substring(0,60)+'</span>';
      if(u.kb) html+='<span class="kb-badge">'+u.kb+'</span>';
      html+='</div>';
    });
  }
  html+='</div>';

  // Processes
  if(R.processes){
    html+='<div class="card"><div class="card-title">Top Processes</div>'+row('Total Processes',R.processes.processCount)+row('Total RAM Used',R.processes.totalRamUsedMB+' MB');
    if(R.processes.topByMemory&&R.processes.topByMemory.length>0){
      html+='<div style="font-size:9px;color:#444;letter-spacing:1px;margin:8px 0 4px">TOP BY MEMORY</div>';
      R.processes.topByMemory.slice(0,5).forEach(p=>{ html+='<div style="padding:3px 0;border-bottom:1px solid #0d0d0d;display:flex;justify-content:space-between;font-size:10px"><span style="color:#888">'+p.name+'</span><span style="color:#00aaff">'+p.ramMB+' MB</span></div>'; });
    }
    html+='</div>';
  }

  // Camera
  html+='<div class="card"><div class="card-title">Camera ('+R.camera.count+')</div>';
  (R.camera.devices||[]).forEach(c=>{ html+='<div style="padding:6px 0;border-bottom:1px solid #0d0d0d"><div style="color:'+(c.status==='OK'?'#00aa66':'#ff4444')+'">'+(c.status==='OK'?'✅':'❌')+' '+c.name+'</div><div style="font-size:10px;color:#444">'+c.type+' · Driver: '+c.driverVersion+' ('+c.driverDate+')</div></div>'; });
  if(R.camera.count===0) html+='<div style="color:#ffbb00;font-size:10px;margin-top:6px">⚠ No camera detected</div>';
  html+='</div>';

  // WiFi
  if(R.wifi){
    const cc=R.wifi.currentConnection||{}, sig=cc.signalPercent, sigc=sig<40?'#ff4444':sig<65?'#ffbb00':'#00aa66';
    html+='<div class="card"><div class="card-title">WiFi Signal</div>';
    if(sig!=null){
      html+='<div style="text-align:center;padding:8px 0"><div style="font-size:28px;font-weight:700;color:'+sigc+'">'+sig+'%</div><div style="font-size:9px;color:#444;letter-spacing:1px">SIGNAL STRENGTH</div></div>';
      html+=row('SSID',cc.ssid||'N/A')+row('Radio',cc.radioType||'N/A')+row('Channel',cc.channel||'N/A')+row('Tx Rate',(cc.txRateMbps||'N/A')+' Mbps')+row('Rx Rate',(cc.rxRateMbps||'N/A')+' Mbps')+row('Auth',cc.auth||'N/A');
    } else { html+='<div style="color:#555;font-size:11px;padding:8px 0">Not connected / No WiFi adapter</div>'; }
    if(R.wifi.driver) html+=row('Driver',R.wifi.driver.driverVersion+' ('+R.wifi.driver.driverDate+')');
    if(R.wifi.availableNetworks&&R.wifi.availableNetworks.length>0){
      html+='<div style="font-size:9px;color:#444;letter-spacing:1px;margin-top:10px;margin-bottom:4px">NEARBY ('+R.wifi.availableNetworks.length+')</div>';
      R.wifi.availableNetworks.slice(0,5).forEach(n=>{ const nc=n.signal<40?'#ff4444':n.signal<65?'#ffbb00':'#00aa66'; html+='<div style="padding:3px 0;border-bottom:1px solid #0d0d0d;display:flex;justify-content:space-between;font-size:10px"><span style="color:#777">'+n.ssid+'</span><span style="color:'+nc+'">'+n.signal+'%</span></div>'; });
    }
    html+='</div>';
  }

  // Display
  if(R.display&&(R.display.monitors||[]).length>0){
    html+='<div class="card"><div class="card-title">Display Panel</div>';
    R.display.monitors.forEach(m=>{ html+=row('Panel',m.name)+row('Manufacturer',m.manufacturer)+row('Serial',m.serial)+row('Type',m.connectionType)+row('Resolution',m.resolution)+row('Refresh',m.refreshHz+'Hz')+row('Color Depth',m.colorBit+'-bit')+row('Mfr Date','Wk '+m.weekMfr+'/'+m.yearMfr); });
    html+='</div>';
  }

  // Input Devices
  if(R.inputDevices){
    html+='<div class="card"><div class="card-title">Input Devices</div>';
    (R.inputDevices.keyboards||[]).forEach(k=>{ html+='<div class="issue '+(k.status==='OK'?'ok':'c')+'">⌨ '+k.name+' ['+k.type+']</div>'; });
    (R.inputDevices.touchpads||[]).forEach(t=>{ html+='<div class="issue '+(t.status==='OK'?'ok':'c')+'">🖱 '+t.name+' [Touchpad]</div>'; });
    (R.inputDevices.mice||[]).forEach(m=>{ html+='<div class="issue '+(m.status==='OK'?'ok':'c')+'">🖱 '+m.name+'</div>'; });
    if(!R.inputDevices.touchpads||R.inputDevices.touchpads.length===0) html+='<div style="color:#ffbb00;font-size:10px;margin-top:6px">⚠ No touchpad detected</div>';
    html+='</div>';
  }

  // Thermal
  if(R.thermal){
    html+='<div class="card"><div class="card-title">Thermal Throttling</div>';
    html+=R.thermal.throttlingDetected?'<div style="padding:8px;background:#1a0000;border:1px solid #ff444433;border-radius:3px;margin-bottom:8px"><span style="color:#ff4444;font-weight:700">❌ THROTTLING DETECTED</span><br><span style="color:#ff8844;font-size:11px">CPU at '+R.thermal.throttlePercent+'% of max speed</span></div>':'<div style="color:#00aa66;font-size:11px;padding:6px 0;margin-bottom:6px">✅ No throttling detected</div>';
    html+=row('Max Freq',R.thermal.cpuMaxFreqMHz+' MHz')+row('Current Freq',R.thermal.cpuCurrentMHz+' MHz')+row('Speed Ratio',R.thermal.throttlePercent+'%');
    if(R.thermal.perfCounterFreqPct!=null) html+=row('Perf Counter',R.thermal.perfCounterFreqPct+'% of max');
    if((R.thermal.thermalZones||[]).length>0){
      html+='<div style="font-size:9px;color:#444;letter-spacing:1px;margin-top:8px;margin-bottom:4px">THERMAL ZONES</div>';
      R.thermal.thermalZones.forEach(z=>{ const zc=z.tempC>90?'#ff4444':z.tempC>80?'#ffbb00':'#00aa66'; html+='<div style="padding:3px 0;border-bottom:1px solid #0d0d0d;display:flex;justify-content:space-between;font-size:10px"><span style="color:#555">'+z.zone.split('\\').pop()+'</span><span style="color:'+zc+'">'+z.tempC+'°C</span></div>'; });
    }
    html+='</div>';
  }

  // USB Ports
  if(R.usbPorts){
    const u=R.usbPorts, su=u.summary||{};
    html+='<div class="card"><div class="card-title">USB Ports</div>'+row('USB 2.0 Hubs',su.usb2Hubs||0)+row('USB 3.x Hubs',su.usb3Hubs||0)+row('Controllers',su.controllerCount||0)+row('Connected Devices',su.connectedDevices||0)+row('Thunderbolt/USB4',su.thunderbolt?badge('Detected','ok'):badge('Not Detected','warn'));
    if(u.devices&&u.devices.length>0){
      html+='<div style="font-size:9px;color:#444;letter-spacing:1px;margin-top:8px;margin-bottom:4px">CONNECTED ('+u.devices.length+')</div>';
      u.devices.slice(0,6).forEach(d=>{ html+='<div style="padding:3px 0;border-bottom:1px solid #0d0d0d;font-size:10px;color:#666">⬡ '+d.name+'</div>'; });
    }
    (u.issues||[]).forEach(i=>{ html+='<div class="issue c">❌ '+i+'</div>'; });
    html+='</div>';
  }

  // Benchmarks
  if(R.benchmarks&&(R.benchmarks.diskSeqReadMBps||R.benchmarks.cpuBenchMs)){
    const b=R.benchmarks;
    html+='<div class="card"><div class="card-title">Performance Benchmarks</div>';
    if(b.diskSeqReadMBps!=null){
      const dc=b.diskSeqReadMBps<100?'#ff4444':b.diskSeqReadMBps<400?'#ffbb00':'#00aa66';
      html+='<div style="text-align:center;margin:8px 0"><div style="font-size:22px;font-weight:700;color:'+dc+'">'+b.diskSeqReadMBps+' MB/s</div><div style="font-size:9px;color:#444;letter-spacing:1px">DISK SEQ READ</div></div>';
      html+=row('Disk Write',b.diskSeqWriteMBps+' MB/s');
    }
    if(b.cpuBenchMs!=null){
      const cc2=b.cpuBenchMs<300?'#00aa66':b.cpuBenchMs<600?'#00aaff':b.cpuBenchMs<1200?'#ffbb00':'#ff4444';
      html+=row('CPU Bench','<span style="color:'+cc2+'">'+b.cpuBenchMs+' ms</span>');
      if(b.cpuBenchTier) html+='<div style="font-size:10px;color:#555;padding:3px 0">'+b.cpuBenchTier+'</div>';
    }
    if(b.ramBenchGBps!=null) html+=row('RAM Bandwidth',b.ramBenchGBps+' GB/s');
    (b.notes||[]).forEach(n=>{ html+='<div class="issue c">❌ '+n+'</div>'; });
    html+='</div>';
  }

  // Issues summary
  html+='<div class="card"><div class="card-title">Critical Issues ('+(R.diagnosis.criticalIssues||[]).length+')</div>';
  (R.diagnosis.criticalIssues||[]).forEach(i=>{ html+='<div class="issue c">❌ '+i+'</div>'; });
  if(!(R.diagnosis.criticalIssues||[]).length) html+='<div style="color:#00aa66;font-size:11px;padding:6px 0">✅ No critical issues</div>';
  html+='</div>';

  html+='<div class="card"><div class="card-title">Warnings ('+(R.diagnosis.warnings||[]).length+')</div>';
  (R.diagnosis.warnings||[]).forEach(w=>{ html+='<div class="issue w">⚠ '+w+'</div>'; });
  if(!(R.diagnosis.warnings||[]).length) html+='<div style="color:#00aa66;font-size:11px;padding:6px 0">✅ No warnings</div>';
  html+='</div>';

  html+='<div class="card"><div class="card-title">Startup Items ('+R.startup.count+')</div>';
  (R.startup.items||[]).slice(0,10).forEach(i=>{ html+='<div style="padding:3px 0;border-bottom:1px solid #0d0d0d;font-size:10px;display:flex;justify-content:space-between"><span style="color:#888">'+i.name+'</span><span style="color:#444">'+i.location+'</span></div>'; });
  html+='</div>';

  html+='</div>'; // end .body
  html+='<footer>HACKRORE TECHTOOLKIT v2.9 · Generated: '+R.meta.scanTime+' · Device: '+R.meta.scannerUser+'@'+R.meta.scannerHost+' · Mode: '+R.meta.scanMode.toUpperCase()+'</footer>';

  document.getElementById('root').innerHTML = html;
});
</script>
<div id="root"></div>
</body>
</html>
"@
    $htmlContent | Out-File -FilePath $htmlPath -Encoding UTF8
    Write-OK "HTML: $htmlPath"
}

# ── Summary ────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  SCAN COMPLETE                  HackRore v2.9" -ForegroundColor White
Write-Host "  Score  : $score% ($grade)" -ForegroundColor $(if($score -ge 70){"Green"}elseif($score -ge 50){"Yellow"}else{"Red"})
Write-Host "  Verdict: $verdict" -ForegroundColor $(if($verdict -eq "PASS"){"Green"}elseif($verdict -eq "CONDITIONAL PASS"){"Yellow"}else{"Red"})
Write-Host "  Issues : $($critIssues.Count) critical  |  $($issues.Count) warnings" -ForegroundColor White
Write-Host "  JSON   : $jsonPath" -ForegroundColor DarkGray
if (!$NoHTML) { Write-Host "  HTML   : $htmlPath" -ForegroundColor DarkGray }
Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

if (!$NoHTML -and !$Silent) {
    $open = Read-Host "  Open HTML report? (Y/N)"
    if ($open -eq "Y" -or $open -eq "y") { Start-Process $htmlPath }
}

return $report