# ==============================================================================
# BRAND: HackRore Diagnostics & Optimizer
# DEVELOPER: Ravindra Ahire
# VERSION: 8.0 (Technician Edition)
# PURPOSE: Enterprise-grade hardware diagnostics for Windows desktop/laptop
#          Designed for PC technicians to assess, diagnose & make repair decisions
# ==============================================================================

$IsDoubleClick = ($args.Count -eq 0)

[CmdletBinding()]
param(
    [switch]$ExportReport,
    [switch]$QuickScan,
    [switch]$FullScan,
    [switch]$Silent,
    [switch]$OpenReport,
    [switch]$CompareScans,
    [switch]$NoOpen,
    [string]$BaselinePath,
    [string]$OutputPath = "$env:USERPROFILE\Desktop"
)

if ($IsDoubleClick -and -not $NoOpen) {
    $ExportReport = $true
    $OpenReport   = $true
}

$ErrorActionPreference = "Continue"

$Script:Config = @{
    HtmlReportPath  = "$OutputPath\HackRore_Report_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
    MinBatteryHealth = 50
    MaxDiskUsage    = 90
    MaxMemoryUsage  = 90
    MaxUptimeDays   = 30
    EventLogDays    = 7
}

$Script:IssuesFound   = @()
$Script:WarningsFound = @()
$Script:ScanStartTime = Get-Date
$Script:ComputerInfo  = @{}
$Script:HardwareInfo  = @{}
$Script:StorageInfo   = @()
$Script:BatteryInfo   = @{}
$Script:NetworkInfo   = @()
$Script:SMARTInfo     = @()

# ── Helpers ──────────────────────────────────────────────────────────────────

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $color = switch ($Level) {
        "ERROR"   { "Red"    }
        "WARNING" { "Yellow" }
        "SUCCESS" { "Green"  }
        default   { "Cyan"   }
    }
    if (-not $Silent) { Write-Host "  $Message" -ForegroundColor $color }
}

function Test-Admin {
    $p = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-ColorForPercent {
    param([double]$Percent)
    if ($Percent -gt 90) { return "#ff4757" }
    elseif ($Percent -gt 70) { return "#ffa502" }
    else { return "#2ed573" }
}

function Get-StatusBadge {
    param([string]$Status)
    switch ($Status) {
        "PASS"    { return @{ color="#2ed573"; bg="rgba(46,213,115,0.12)"; icon="✓" } }
        "WARN"    { return @{ color="#ffa502"; bg="rgba(255,165,2,0.12)";  icon="⚠" } }
        "FAIL"    { return @{ color="#ff4757"; bg="rgba(255,71,87,0.12)";  icon="✕" } }
        "INFO"    { return @{ color="#70a1ff"; bg="rgba(112,161,255,0.12)";icon="i" } }
        default   { return @{ color="#a4b0be"; bg="rgba(164,176,190,0.12)";icon="·" } }
    }
}

# ── Data Collection ───────────────────────────────────────────────────────────

function Get-SystemInfo {
    Write-Log "Collecting system information..." "INFO"
    try {
        $cs   = Get-CimInstance Win32_ComputerSystem   -ErrorAction Stop
        $bios = Get-CimInstance Win32_BIOS             -ErrorAction Stop
        $os   = Get-CimInstance Win32_OperatingSystem  -ErrorAction Stop
        $cpu  = Get-CimInstance Win32_Processor        -ErrorAction Stop | Select-Object -First 1

        # Detect laptop more accurately
        $chassis = (Get-CimInstance Win32_SystemEnclosure -ErrorAction SilentlyContinue).ChassisTypes
        $isLaptop = ($chassis -match "^(8|9|10|11|12|14|18|21)$") -or
                    ($cs.Model -match "laptop|notebook|thinkpad|elitebook|latitude|inspiron|yoga|zenbook|vivobook|pavilion|spectre|envy|stream")
        $formFactor = if ($isLaptop) { "LAPTOP" } else { "DESKTOP" }

        # CPU generation parsing
        $cpuGen = "Unknown"
        if ($cpu.Name -match "(\d+)th Gen") { $cpuGen = "$($Matches[1])th Gen" }
        elseif ($cpu.Name -match "i[3579]-(\d)") { 
            $genNum = [string]$Matches[1][0]
            $cpuGen = "${genNum}th Gen"
        }

        # CPU tier
        $cpuTier = "Unknown"
        if ($cpu.Name -match "Core i9|Ryzen 9") { $cpuTier = "i9 / R9" }
        elseif ($cpu.Name -match "Core i7|Ryzen 7") { $cpuTier = "i7 / R7" }
        elseif ($cpu.Name -match "Core i5|Ryzen 5") { $cpuTier = "i5 / R5" }
        elseif ($cpu.Name -match "Core i3|Ryzen 3") { $cpuTier = "i3 / R3" }
        elseif ($cpu.Name -match "Celeron|Pentium|Atom") { $cpuTier = "Budget" }

        return @{
            ComputerSystem = @{
                Manufacturer        = $cs.Manufacturer
                Model               = $cs.Model
                TotalPhysicalMemory = $cs.TotalPhysicalMemory
                SystemSKUNumber     = $cs.SystemSKUNumber
            }
            BIOS = @{
                SerialNumber  = $bios.SerialNumber
                Manufacturer  = $bios.Manufacturer
                Version       = $bios.SMBIOSBIOSVersion
                ReleaseDate   = $bios.ReleaseDate
            }
            OS = @{
                Caption             = $os.Caption
                Version             = $os.Version
                BuildNumber         = $os.BuildNumber
                OSArchitecture      = $os.OSArchitecture
                LastBootUpTime      = $os.LastBootUpTime
                FreePhysicalMemory  = $os.FreePhysicalMemory
                InstallDate         = $os.InstallDate
                RegisteredUser      = $os.RegisteredUser
            }
            CPU = @{
                Name                      = $cpu.Name
                NumberOfCores             = $cpu.NumberOfCores
                NumberOfLogicalProcessors = $cpu.NumberOfLogicalProcessors
                MaxClockSpeed             = $cpu.MaxClockSpeed
                LoadPercentage            = $cpu.LoadPercentage
                Generation                = $cpuGen
                Tier                      = $cpuTier
                Socket                    = $cpu.SocketDesignation
            }
            FormFactor = $formFactor
        }
    } catch {
        Write-Log "Error collecting system info: $_" "ERROR"
        return @{
            ComputerSystem = @{ Manufacturer="Unknown"; Model="Unknown"; TotalPhysicalMemory=0 }
            BIOS           = @{ SerialNumber="Unknown"; Manufacturer="Unknown"; Version="Unknown" }
            OS             = @{ Caption="Unknown"; Version="Unknown"; BuildNumber="Unknown"; LastBootUpTime=Get-Date; FreePhysicalMemory=0 }
            CPU            = @{ Name="Unknown"; NumberOfCores=0; LoadPercentage=0; Generation="Unknown"; Tier="Unknown" }
            FormFactor     = "UNKNOWN"
        }
    }
}

function Get-HardwareInfo {
    Write-Log "Analyzing memory & storage..." "INFO"
    try {
        $totalRAM   = [math]::Round($Script:ComputerInfo.ComputerSystem.TotalPhysicalMemory / 1GB, 2)
        $freeRAMKB  = $Script:ComputerInfo.OS.FreePhysicalMemory
        $freeRAM    = [math]::Round($freeRAMKB / 1MB, 2)
        $usedRAM    = [math]::Round($totalRAM - $freeRAM, 2)
        $ramPercent = if ($totalRAM -gt 0) { [math]::Round(($usedRAM / $totalRAM) * 100, 1) } else { 0 }

        # RAM slot details
        $ramModules = Get-CimInstance Win32_PhysicalMemory -ErrorAction SilentlyContinue
        $ramSlots   = ($ramModules | Measure-Object).Count
        $ramSpeed   = if ($ramModules) { ($ramModules | Select-Object -First 1).Speed } else { "N/A" }
        $ramType    = if ($ramModules) {
            $memType = ($ramModules | Select-Object -First 1).MemoryType
            switch ($memType) { 26{"DDR4"} 34{"DDR5"} 24{"DDR3"} default{"DDR"} }
        } else { "Unknown" }

        $result = @{
            Memory = @{
                TotalGB      = $totalRAM
                UsedGB       = $usedRAM
                FreeGB       = $freeRAM
                UsagePercent = $ramPercent
                SpeedMHz     = $ramSpeed
                Type         = $ramType
                Slots        = $ramSlots
                Label        = "${totalRAM}GB ${ramType}"
            }
            Disks = @()
        }

        if ($ramPercent -gt 90) { $Script:WarningsFound += "High RAM usage (${ramPercent}%)" }

        foreach ($disk in (Get-CimInstance Win32_LogicalDisk -ErrorAction SilentlyContinue | Where-Object { $_.DriveType -eq 3 })) {
            if ($disk.Size -gt 0) {
                $totalGB    = [math]::Round($disk.Size / 1GB, 2)
                $freeGB     = [math]::Round($disk.FreeSpace / 1GB, 2)
                $usedGB     = [math]::Round($totalGB - $freeGB, 2)
                $usedPct    = [math]::Round(($usedGB / $totalGB) * 100, 1)

                $result.Disks += @{
                    Drive       = $disk.DeviceID
                    VolumeName  = $disk.VolumeName
                    TotalGB     = $totalGB
                    UsedGB      = $usedGB
                    FreeGB      = $freeGB
                    UsagePercent= $usedPct
                }
                if ($usedPct -gt 90) { $Script:WarningsFound += "Disk $($disk.DeviceID) is ${usedPct}% full" }
            }
        }

        return $result
    } catch {
        Write-Log "Error collecting hardware info: $_" "ERROR"
        return @{ Memory=@{ TotalGB=0; UsedGB=0; FreeGB=0; UsagePercent=0; Type="Unknown"; Label="N/A" }; Disks=@() }
    }
}

function Get-StorageDetails {
    Write-Log "Detecting storage type & interface..." "INFO"
    $drives = @()
    try {
        # Physical disk info
        $physDisks = Get-CimInstance Win32_DiskDrive -ErrorAction SilentlyContinue
        foreach ($pd in $physDisks) {
            $sizeGB    = [math]::Round($pd.Size / 1GB, 0)

            # Interface / bus type
            $interface = "Unknown"
            $mediaType = "HDD"
            $formFactor = "Unknown"

            # Check via MSFT_PhysicalDisk (Storage module)
            try {
                $msftDisk = Get-PhysicalDisk -ErrorAction SilentlyContinue | Where-Object { $_.SerialNumber -eq $pd.SerialNumber -or $_.FriendlyName -eq $pd.Model }
                if ($msftDisk) {
                    $busType = $msftDisk.BusType
                    $media   = $msftDisk.MediaType
                    $interface = switch ($busType) {
                        "NVMe"  { "NVMe" }
                        "SATA"  { "SATA" }
                        "SAS"   { "SAS"  }
                        "USB"   { "USB"  }
                        default { $busType }
                    }
                    $mediaType = switch ($media) {
                        "SSD"       { "SSD" }
                        "HDD"       { "HDD" }
                        "SCM"       { "SCM" }
                        default {
                            if ($pd.Model -match "SSD|NVMe|M\.2|KINGSTON|SAMSUNG|WD.*GREEN|CRUCIAL") { "SSD" }
                            elseif ($pd.MediaType -match "Fixed") { "HDD" }
                            else { "Unknown" }
                        }
                    }
                }
            } catch {}

            # Fallback: parse model name
            if ($interface -eq "Unknown") {
                if ($pd.Model -match "NVMe|NVME")          { $interface = "NVMe" }
                elseif ($pd.InterfaceType -match "SCSI")   { $interface = "SATA" }
                elseif ($pd.InterfaceType -match "IDE")    { $interface = "IDE"  }
                else                                        { $interface = $pd.InterfaceType }
            }

            # Form factor detection
            if ($interface -eq "NVMe")     { $formFactor = "M.2 NVMe" }
            elseif ($interface -eq "SATA" -and $mediaType -eq "SSD") { $formFactor = "SATA SSD" }
            elseif ($interface -eq "SATA" -and $mediaType -eq "HDD") { $formFactor = "HDD" }
            else                           { $formFactor = "$interface $mediaType" }

            # Short label for display
            $label = "${sizeGB}GB $formFactor"

            # Health status via SMART (basic check)
            $healthStatus = "Unknown"
            try {
                $smart = Get-WmiObject -Namespace root\wmi -Class MSStorageDriver_FailurePredictStatus -ErrorAction SilentlyContinue |
                         Where-Object { $_.InstanceName -like "*$($pd.Index)*" }
                if ($smart) {
                    $healthStatus = if ($smart.PredictFailure) { "WARNING" } else { "OK" }
                    if ($smart.PredictFailure) { $Script:IssuesFound += "SMART failure predicted: $($pd.Model)" }
                }
            } catch {}

            $drives += @{
                Index       = $pd.Index
                Model       = $pd.Model
                SizeGB      = $sizeGB
                Interface   = $interface
                MediaType   = $mediaType
                FormFactor  = $formFactor
                Label       = $label
                SerialNumber= $pd.SerialNumber
                Health      = $healthStatus
                Partitions  = $pd.Partitions
            }
        }
    } catch {
        Write-Log "Error detecting storage: $_" "WARNING"
    }
    return $drives
}

function Get-BatteryInfo {
    Write-Log "Checking battery..." "INFO"
    try {
        $bat = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue
        if (-not $bat) { return @{ Present=$false } }

        $batDetail = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryStatus" -ErrorAction SilentlyContinue
        $batFull   = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryFullChargedCapacity" -ErrorAction SilentlyContinue
        $batCycle  = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryCycleCount" -ErrorAction SilentlyContinue

        $designCap  = 0
        $fullCap    = 0
        $health     = 0
        $cycleCount = "N/A"

        try {
            $batStatic = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryStaticData" -ErrorAction SilentlyContinue
            if ($batStatic) { $designCap = $batStatic.DesignedCapacity }
        } catch {}

        if ($batFull)  { $fullCap    = $batFull.FullChargedCapacity }
        if ($batCycle) { $cycleCount = $batCycle.CycleCount }
        if ($designCap -gt 0 -and $fullCap -gt 0) {
            $health = [math]::Round(($fullCap / $designCap) * 100, 1)
        }

        $chargeStatus = switch ($bat.BatteryStatus) {
            1  { "Discharging" }
            2  { "AC Power"    }
            3  { "Fully Charged" }
            4  { "Low"         }
            5  { "Critical"    }
            6  { "Charging"    }
            7  { "Charging High" }
            8  { "Charging Low" }
            9  { "Charging Critical" }
            11 { "Partially Charged" }
            default { "Unknown" }
        }

        if ($health -gt 0 -and $health -lt $Script:Config.MinBatteryHealth) {
            $Script:IssuesFound += "Battery health critical: ${health}% (Replace recommended)"
        } elseif ($health -gt 0 -and $health -lt 70) {
            $Script:WarningsFound += "Battery health degraded: ${health}%"
        }

        return @{
            Present      = $true
            Name         = $bat.Name
            ChargeLevel  = $bat.EstimatedChargeRemaining
            Status       = $chargeStatus
            Health       = $health
            DesignCap    = $designCap
            FullCap      = $fullCap
            CycleCount   = $cycleCount
        }
    } catch {
        return @{ Present=$false }
    }
}

function Get-NetworkAdapters {
    Write-Log "Scanning network adapters..." "INFO"
    $adapters = @()
    try {
        $nics = Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" -ErrorAction SilentlyContinue
        foreach ($nic in $nics) {
            $adapters += @{
                Description = $nic.Description
                MACAddress  = $nic.MACAddress
                IPAddress   = ($nic.IPAddress -join ", ")
                DHCPEnabled = $nic.DHCPEnabled
                Speed       = "N/A"
            }
        }
    } catch {}
    return $adapters
}

function Get-ThermalInfo {
    Write-Log "Reading temperatures..." "INFO"
    $temps = @{}
    try {
        $thermal = Get-CimInstance -Namespace "root/WMI" -ClassName "MSAcpi_ThermalZoneTemperature" -ErrorAction SilentlyContinue
        if ($thermal) {
            $idx = 0
            foreach ($t in $thermal) {
                $celsius = [math]::Round(($t.CurrentTemperature - 2732) / 10, 1)
                $temps["Zone$idx"] = $celsius
                if ($celsius -gt 95) { $Script:IssuesFound  += "Thermal Zone $idx overheating: ${celsius}°C" }
                elseif ($celsius -gt 80) { $Script:WarningsFound += "Thermal Zone $idx high temp: ${celsius}°C" }
                $idx++
            }
        }
    } catch {}
    return $temps
}

function Get-GPUInfo {
    Write-Log "Detecting GPU..." "INFO"
    $gpus = @()
    try {
        foreach ($gpu in (Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue)) {
            $vramMB = [math]::Round($gpu.AdapterRAM / 1MB, 0)
            $gpus += @{
                Name       = $gpu.Name
                VRAM       = if ($vramMB -gt 0) { "${vramMB}MB" } else { "Shared" }
                DriverVer  = $gpu.DriverVersion
                Resolution = "$($gpu.CurrentHorizontalResolution)x$($gpu.CurrentVerticalResolution)"
            }
        }
    } catch {}
    return $gpus
}

function Get-WindowsActivation {
    try {
        $lic = Get-CimInstance SoftwareLicensingProduct -Filter "Name like 'Windows%' and PartialProductKey is not null" -ErrorAction SilentlyContinue
        if ($lic) {
            $status = switch ($lic.LicenseStatus) {
                0 { "Unlicensed" }
                1 { "Licensed"   }
                2 { "OOB Grace"  }
                3 { "OOT Grace"  }
                4 { "Non-Genuine" }
                5 { "Notification" }
                default { "Unknown" }
            }
            if ($lic.LicenseStatus -ne 1) { $Script:WarningsFound += "Windows not activated: $status" }
            return $status
        }
    } catch {}
    return "Unknown"
}

function Get-RecentErrors {
    Write-Log "Checking Windows event log..." "INFO"
    $errors = @()
    try {
        $since = (Get-Date).AddDays(-$Script:Config.EventLogDays)
        $evts  = Get-WinEvent -FilterHashtable @{
            LogName   = 'System'
            Level     = 1,2
            StartTime = $since
        } -MaxEvents 20 -ErrorAction SilentlyContinue

        foreach ($e in $evts) {
            $errors += @{
                Time    = $e.TimeCreated.ToString("yyyy-MM-dd HH:mm")
                Source  = $e.ProviderName
                Message = ($e.Message -split "`n")[0] -replace '^\s+','' | Select-Object -First 1
                Level   = if ($e.Level -eq 1) { "Critical" } else { "Error" }
            }
        }
        if ($errors.Count -gt 0) { $Script:WarningsFound += "$($errors.Count) system error(s) in last 7 days" }
    } catch {}
    return $errors
}

# ── Baseline ──────────────────────────────────────────────────────────────────

function Save-Baseline {
    try {
        $sn    = if ($Script:ComputerInfo.BIOS.SerialNumber) { $Script:ComputerInfo.BIOS.SerialNumber } else { "UNKNOWN" }
        $model = ($Script:ComputerInfo.ComputerSystem.Model -replace '[^\w]','_')
        if (-not (Test-Path $OutputPath)) { New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null }
        $path  = "$OutputPath\HackRore_Baseline_${model}_${sn}.json"
        @{
            ComputerName  = $env:COMPUTERNAME
            SerialNumber  = $sn
            Model         = $model
            ScanDate      = Get-Date
            HardwareInfo  = $Script:HardwareInfo
            IssuesCount   = $Script:IssuesFound.Count
            WarningsCount = $Script:WarningsFound.Count
        } | ConvertTo-Json -Depth 5 | Out-File -FilePath $path -Encoding UTF8
        Write-Log "Baseline saved: $path" "SUCCESS"
        return $path
    } catch {
        Write-Log "Error saving baseline: $_" "WARNING"
        return $null
    }
}

function Compare-Baseline {
    param([string]$BaselinePath)
    try {
        if (-not $BaselinePath) {
            $files = Get-ChildItem -Path $OutputPath -Filter "HackRore_Baseline_*.json" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
            if ($files) { $BaselinePath = $files[0].FullName }
        }
        if (-not $BaselinePath -or -not (Test-Path $BaselinePath)) {
            Write-Log "No baseline found." "WARNING"; return
        }
        $baseline = Get-Content $BaselinePath | ConvertFrom-Json
        Write-Host "`n=== COMPARISON WITH BASELINE ===" -ForegroundColor Cyan
        Write-Host "Baseline: $($baseline.ScanDate)"
        $changes = @()
        $memDiff = $Script:HardwareInfo.Memory.UsagePercent - $baseline.HardwareInfo.Memory.UsagePercent
        if ($memDiff -gt 10)  { $changes += "Memory +${memDiff}%" }
        if ($memDiff -lt -10) { $changes += "Memory ${memDiff}%" }
        foreach ($disk in $Script:HardwareInfo.Disks) {
            $bd = $baseline.HardwareInfo.Disks | Where-Object { $_.Drive -eq $disk.Drive }
            if ($bd) {
                $dDiff = $disk.UsagePercent - $bd.UsagePercent
                if ($dDiff -gt 5) { $changes += "Disk $($disk.Drive) +${dDiff}%" }
            }
        }
        if ($Script:WarningsFound.Count -gt $baseline.WarningsCount) {
            $changes += "New warnings ($($Script:WarningsFound.Count) vs $($baseline.WarningsCount))"
        }
        if ($changes.Count -eq 0) { Write-Host "  [OK] No significant changes" -ForegroundColor Green }
        else { foreach ($c in $changes) { Write-Host "  [!] $c" -ForegroundColor Yellow } }
    } catch {
        Write-Log "Error comparing baseline: $_" "WARNING"
    }
}

function Open-InBrowser {
    param([string]$ReportPath)
    if ($ReportPath -and (Test-Path $ReportPath)) {
        try { Start-Process $ReportPath -ErrorAction Stop; Write-Log "Report opened in browser" "SUCCESS" }
        catch { Write-Log "Could not open browser. Report saved: $ReportPath" "WARNING" }
    }
}

# ── HTML Report ───────────────────────────────────────────────────────────────

function Export-HTML {
    $gpus       = Get-GPUInfo
    $thermals   = Get-ThermalInfo
    $netAdapters= Get-NetworkAdapters
    $recentErrs = Get-RecentErrors
    $winActiv   = Get-WindowsActivation
    $storages   = $Script:StorageInfo
    $battery    = $Script:BatteryInfo

    $uptime     = try { (Get-Date) - $Script:ComputerInfo.OS.LastBootUpTime } catch { New-TimeSpan }
    $overall    = if ($Script:IssuesFound.Count -gt 0) { "CRITICAL" } elseif ($Script:WarningsFound.Count -gt 0) { "WARNING" } else { "HEALTHY" }

    # Compose headline spec string: e.g. "i5-11th | 16GB DDR4 | 256GB M.2 NVMe"
    $cpuShort = ""
    if ($Script:ComputerInfo.CPU.Name -match "(i[3579]-\d+\w*)") { $cpuShort = $Matches[1] }
    elseif ($Script:ComputerInfo.CPU.Name -match "(Ryzen \d \d+\w*)") { $cpuShort = $Matches[1] }
    elseif ($Script:ComputerInfo.CPU.Name -match "(Celeron|Pentium|Atom) \w+") { $cpuShort = $Matches[0] }
    else { $cpuShort = ($Script:ComputerInfo.CPU.Name -split "@")[0].Trim() }
    $cpuGen    = $Script:ComputerInfo.CPU.Generation
    $ramLabel  = $Script:HardwareInfo.Memory.Label
    $storLabel = if ($storages.Count -gt 0) { ($storages | ForEach-Object { $_.Label }) -join " + " } else { "N/A" }
    $headlineSpec = "$cpuShort ($cpuGen) · $ramLabel · $storLabel"

    $statusColors = @{ HEALTHY="#2ed573"; WARNING="#ffa502"; CRITICAL="#ff4757" }
    $statusIcons  = @{ HEALTHY="✓"; WARNING="⚠"; CRITICAL="✕" }
    $statusColor  = $statusColors[$overall]
    $statusIcon   = $statusIcons[$overall]

    # Storage cards HTML
    $storageCards = ""
    foreach ($s in $storages) {
        $hColor = if ($s.Health -eq "OK") { "#2ed573" } elseif ($s.Health -eq "WARNING") { "#ffa502" } else { "#a4b0be" }
        $storageCards += @"
        <div class="storage-item">
          <div class="storage-icon">$( if($s.MediaType -eq "SSD"){"⚡"}else{"💾"} )</div>
          <div class="storage-details">
            <div class="storage-model">$($s.Model)</div>
            <div class="storage-meta">
              <span class="tag">$($s.FormFactor)</span>
              <span class="tag">$($s.SizeGB) GB</span>
              <span class="tag" style="color:$hColor">SMART: $($s.Health)</span>
            </div>
          </div>
        </div>
"@
    }

    # GPU cards HTML
    $gpuCards = ""
    foreach ($g in $gpus) {
        $gpuCards += @"
        <div class="info-row">
          <span class="info-label">$($g.Name)</span>
          <span class="info-value">$($g.VRAM) | $($g.Resolution)</span>
        </div>
"@
    }

    # Network adapters HTML
    $netRows = ""
    foreach ($n in $netAdapters) {
        $netRows += @"
        <div class="info-row">
          <span class="info-label">$($n.Description -replace 'Gigabit|Fast|Ethernet|Wireless|Network','...')</span>
          <span class="info-value">$($n.IPAddress)</span>
        </div>
"@
    }

    # Event log errors HTML
    $errRows = ""
    if ($recentErrs.Count -gt 0) {
        foreach ($e in ($recentErrs | Select-Object -First 8)) {
            $errColor = if ($e.Level -eq "Critical") { "#ff4757" } else { "#ffa502" }
            $errRows += "<div class='event-item' style='border-left-color:$errColor'><span class='event-time'>$($e.Time)</span><span class='event-src'>$($e.Source)</span><div class='event-msg'>$($e.Message)</div></div>"
        }
    } else {
        $errRows = "<div style='color:#2ed573;text-align:center;padding:12px;'>✓ No critical events in last 7 days</div>"
    }

    # Battery section HTML
    $batterySection = ""
    if ($battery.Present) {
        $bhColor  = Get-ColorForPercent -Percent $battery.Health
        $bchColor = Get-ColorForPercent -Percent $battery.ChargeLevel
        $batterySection = @"
      <div class="section-card">
        <div class="section-title"><span class="section-icon">🔋</span> Battery</div>
        <div class="info-row"><span class="info-label">Status</span><span class="info-value">$($battery.Status)</span></div>
        <div class="info-row"><span class="info-label">Charge Level</span><span class="info-value" style="color:$bchColor">$($battery.ChargeLevel)%</span></div>
        <div class="bar-wrap"><div class="bar-fill" style="width:$($battery.ChargeLevel)%;background:$bchColor"></div></div>
        $(if($battery.Health -gt 0) {
            "<div class='info-row'><span class='info-label'>Health (Wear)</span><span class='info-value' style='color:$bhColor'>$($battery.Health)%</span></div>
             <div class='bar-wrap'><div class='bar-fill' style='width:$($battery.Health)%;background:$bhColor'></div></div>"
        })
        $(if($battery.CycleCount -ne "N/A") { "<div class='info-row'><span class='info-label'>Cycle Count</span><span class='info-value'>$($battery.CycleCount)</span></div>" })
      </div>
"@
    }

    # Disk usage rows
    $diskRows = ""
    foreach ($d in $Script:HardwareInfo.Disks) {
        $dc = Get-ColorForPercent -Percent $d.UsagePercent
        $diskRows += @"
        <div class="disk-entry">
          <div class="disk-header"><span>$($d.Drive) <small>$($d.VolumeName)</small></span><span style="color:$dc">$($d.UsagePercent)%</span></div>
          <div class="bar-wrap"><div class="bar-fill" style="width:$($d.UsagePercent)%;background:$dc"></div></div>
          <div class="disk-sub"><span>Used: $($d.UsedGB) GB</span><span>Free: $($d.FreeGB) GB / $($d.TotalGB) GB</span></div>
        </div>
"@
    }

    # Issues + warnings
    $issueRows = ""
    foreach ($i in $Script:IssuesFound) {
        $issueRows += "<div class='alert-item alert-critical'>✕ $i</div>"
    }
    foreach ($w in $Script:WarningsFound) {
        $issueRows += "<div class='alert-item alert-warning'>⚠ $w</div>"
    }
    if (-not $issueRows) {
        $issueRows = "<div class='alert-item alert-ok'>✓ All diagnostics passed — system is healthy</div>"
    }

    # Thermal rows
    $thermalRows = ""
    if ($thermals.Count -gt 0) {
        foreach ($key in $thermals.Keys) {
            $tVal = $thermals[$key]
            $tColor = if ($tVal -gt 90) { "#ff4757" } elseif ($tVal -gt 75) { "#ffa502" } else { "#2ed573" }
            $thermalRows += "<div class='info-row'><span class='info-label'>$key</span><span class='info-value' style='color:$tColor'>${tVal}°C</span></div>"
        }
    } else {
        $thermalRows = "<div class='info-row'><span class='info-label'>Thermal</span><span class='info-value' style='color:#a4b0be'>N/A</span></div>"
    }

    $cpuColor = Get-ColorForPercent -Percent $Script:ComputerInfo.CPU.LoadPercentage
    $memColor = Get-ColorForPercent -Percent $Script:HardwareInfo.Memory.UsagePercent

    $scanTime = Get-Date -Format "yyyy-MM-dd  HH:mm:ss"
    $uptimeStr = "$($uptime.Days)d $($uptime.Hours)h $($uptime.Minutes)m"

    $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HackRore — $env:COMPUTERNAME</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg:       #0b0f1a;
      --surface:  #111827;
      --surface2: #1a2236;
      --border:   rgba(255,255,255,0.06);
      --text:     #e2e8f0;
      --muted:    #64748b;
      --accent:   #38bdf8;
      --green:    #2ed573;
      --yellow:   #ffa502;
      --red:      #ff4757;
      --font-mono: 'JetBrains Mono', monospace;
      --font-disp: 'Syne', sans-serif;
    }
    * { box-sizing:border-box; margin:0; padding:0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-mono);
      font-size: 13px;
      min-height: 100vh;
      padding: 0;
    }

    /* ── TOP BANNER ── */
    .top-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      border-bottom: 1px solid var(--border);
      padding: 28px 40px 24px;
      position: relative;
      overflow: hidden;
    }
    .top-banner::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(ellipse at 70% 50%, rgba(56,189,248,0.08) 0%, transparent 65%);
    }
    .banner-grid { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; position:relative; }
    .brand-block {}
    .brand-name { font-family: var(--font-disp); font-size: 13px; font-weight:700; letter-spacing:0.2em; color:var(--accent); text-transform:uppercase; margin-bottom:6px; }
    .device-name { font-family: var(--font-disp); font-size: 28px; font-weight:800; color:#fff; line-height:1.1; margin-bottom:8px; }
    .spec-headline {
      font-size: 12px; color: var(--muted); letter-spacing: 0.05em;
      background: rgba(255,255,255,0.04); border:1px solid var(--border);
      padding: 6px 12px; border-radius:6px; display:inline-block; margin-top:4px;
    }
    .spec-headline span { color: var(--accent); }

    .status-badge {
      font-family: var(--font-disp);
      font-size: 14px; font-weight:700; letter-spacing:0.12em;
      padding: 12px 24px; border-radius:8px; text-transform:uppercase;
      display:flex; align-items:center; gap:10px; white-space:nowrap;
    }
    .status-icon { font-size:24px; }
    .meta-row { display:flex; gap:20px; flex-wrap:wrap; margin-top:16px; position:relative; }
    .meta-chip {
      font-size:11px; color: var(--muted);
      display:flex; align-items:center; gap:6px;
    }
    .meta-chip b { color: var(--text); }
    .serial-chip {
      background: rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.2);
      padding: 6px 14px; border-radius:6px; font-size:12px;
      color:var(--accent); letter-spacing:0.08em; margin-top:16px; display:inline-block;
    }

    /* ── LAYOUT ── */
    .content { padding: 28px 40px; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .three-col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; }
    @media(max-width:900px) { .two-col,.three-col { grid-template-columns:1fr; } }

    /* ── CARDS ── */
    .section-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px 22px;
      margin-bottom: 20px;
    }
    .section-title {
      font-family: var(--font-disp);
      font-size: 12px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase;
      color: var(--muted); margin-bottom:16px;
      display:flex; align-items:center; gap:8px;
    }
    .section-icon { font-size:14px; }

    /* ── INFO ROWS ── */
    .info-row {
      display:flex; justify-content:space-between; align-items:center;
      padding: 7px 0; border-bottom:1px solid var(--border);
    }
    .info-row:last-child { border-bottom:none; }
    .info-label { color: var(--muted); font-size:12px; }
    .info-value  { font-weight:600; color: var(--text); font-size:12px; text-align:right; max-width:55%; word-break:break-word; }

    /* ── BARS ── */
    .bar-wrap { height:6px; background:rgba(255,255,255,0.06); border-radius:3px; margin:8px 0 4px; overflow:hidden; }
    .bar-fill  { height:100%; border-radius:3px; transition:width 0.3s ease; }

    /* ── STORAGE ITEMS ── */
    .storage-item { display:flex; align-items:center; gap:14px; padding:10px 0; border-bottom:1px solid var(--border); }
    .storage-item:last-child { border-bottom:none; }
    .storage-icon { font-size:22px; width:30px; text-align:center; flex-shrink:0; }
    .storage-model { font-size:12px; font-weight:600; margin-bottom:5px; }
    .storage-meta  { display:flex; gap:6px; flex-wrap:wrap; }
    .tag {
      font-size:10px; font-weight:600; letter-spacing:0.08em;
      background:rgba(255,255,255,0.06); border:1px solid var(--border);
      padding: 2px 8px; border-radius:4px; color:var(--muted);
    }

    /* ── DISK ENTRIES ── */
    .disk-entry { padding:10px 0; border-bottom:1px solid var(--border); }
    .disk-entry:last-child { border-bottom:none; }
    .disk-header { display:flex; justify-content:space-between; font-size:12px; font-weight:600; margin-bottom:2px; }
    .disk-sub    { display:flex; justify-content:space-between; font-size:11px; color:var(--muted); margin-top:4px; }

    /* ── ALERTS ── */
    .alert-item { padding:10px 14px; margin:6px 0; border-radius:8px; border-left:3px solid; font-size:12px; line-height:1.5; }
    .alert-critical { background:rgba(255,71,87,0.08);  border-left-color:#ff4757; color:#ff4757; }
    .alert-warning  { background:rgba(255,165,2,0.08);  border-left-color:#ffa502; color:#ffa502; }
    .alert-ok       { background:rgba(46,213,115,0.08); border-left-color:#2ed573; color:#2ed573; }

    /* ── EVENT LOG ── */
    .event-item { padding:9px 12px; margin:5px 0; border-radius:6px; border-left:3px solid; background:rgba(255,255,255,0.02); }
    .event-time { font-size:10px; color:var(--muted); margin-right:8px; }
    .event-src  { font-size:10px; color:var(--accent); font-weight:600; margin-right:8px; }
    .event-msg  { font-size:11px; color:var(--text); margin-top:4px; opacity:0.7; }

    /* ── GAUGE ── */
    .gauge-row { display:flex; gap:16px; margin-bottom:16px; }
    .gauge { flex:1; background:var(--surface2); border-radius:10px; padding:14px 16px; border:1px solid var(--border); text-align:center; }
    .gauge-val { font-family:var(--font-disp); font-size:26px; font-weight:800; line-height:1; }
    .gauge-lbl { font-size:10px; color:var(--muted); margin-top:4px; letter-spacing:0.1em; text-transform:uppercase; }

    /* ── FOOTER ── */
    .footer { text-align:center; padding:28px 40px; border-top:1px solid var(--border); color:var(--muted); font-size:11px; }
    .footer b { color:var(--accent); }
  </style>
</head>
<body>

<!-- ═══ HEADER BANNER ═══ -->
<div class="top-banner">
  <div class="banner-grid">
    <div class="brand-block">
      <div class="brand-name">HackRore Technician Report</div>
      <div class="device-name">$($Script:ComputerInfo.ComputerSystem.Manufacturer) $($Script:ComputerInfo.ComputerSystem.Model)</div>
      <div class="spec-headline">$headlineSpec</div>
      <div class="serial-chip">S/N: $($Script:ComputerInfo.BIOS.SerialNumber)</div>
      <div class="meta-row">
        <div class="meta-chip">🖥 <b>$($Script:ComputerInfo.FormFactor)</b></div>
        <div class="meta-chip">🕐 Scanned: <b>$scanTime</b></div>
        <div class="meta-chip">⏱ Uptime: <b>$uptimeStr</b></div>
        <div class="meta-chip">🔑 Windows: <b>$winActiv</b></div>
      </div>
    </div>
    <div class="status-badge" style="background:rgba(0,0,0,0.3);border:2px solid ${statusColor};color:${statusColor};">
      <span class="status-icon">$statusIcon</span>
      <span>$overall</span>
    </div>
  </div>
</div>

<!-- ═══ CONTENT ═══ -->
<div class="content">

  <!-- Issues & Warnings -->
  <div class="section-card">
    <div class="section-title"><span class="section-icon">🔍</span> Diagnostics Summary — $($Script:IssuesFound.Count) Critical · $($Script:WarningsFound.Count) Warnings</div>
    $issueRows
  </div>

  <div class="two-col">

    <!-- LEFT COL -->
    <div>

      <!-- System Info -->
      <div class="section-card">
        <div class="section-title"><span class="section-icon">💻</span> System</div>
        <div class="info-row"><span class="info-label">Manufacturer</span><span class="info-value">$($Script:ComputerInfo.ComputerSystem.Manufacturer)</span></div>
        <div class="info-row"><span class="info-label">Model</span><span class="info-value">$($Script:ComputerInfo.ComputerSystem.Model)</span></div>
        <div class="info-row"><span class="info-label">Form Factor</span><span class="info-value">$($Script:ComputerInfo.FormFactor)</span></div>
        <div class="info-row"><span class="info-label">BIOS Version</span><span class="info-value">$($Script:ComputerInfo.BIOS.Version)</span></div>
        <div class="info-row"><span class="info-label">BIOS Vendor</span><span class="info-value">$($Script:ComputerInfo.BIOS.Manufacturer)</span></div>
      </div>

      <!-- OS -->
      <div class="section-card">
        <div class="section-title"><span class="section-icon">🪟</span> Operating System</div>
        <div class="info-row"><span class="info-label">OS</span><span class="info-value">$($Script:ComputerInfo.OS.Caption)</span></div>
        <div class="info-row"><span class="info-label">Build</span><span class="info-value">$($Script:ComputerInfo.OS.BuildNumber) ($($Script:ComputerInfo.OS.OSArchitecture))</span></div>
        <div class="info-row"><span class="info-label">Activation</span><span class="info-value" style="color:$(if($winActiv -eq 'Licensed'){'#2ed573'}else{'#ffa502'})">$winActiv</span></div>
        <div class="info-row"><span class="info-label">Install Date</span><span class="info-value">$(try{$Script:ComputerInfo.OS.InstallDate.ToString('yyyy-MM-dd')}catch{'N/A'})</span></div>
        <div class="info-row"><span class="info-label">Last Boot</span><span class="info-value">$(try{$Script:ComputerInfo.OS.LastBootUpTime.ToString('yyyy-MM-dd HH:mm')}catch{'N/A'})</span></div>
      </div>

      <!-- CPU -->
      <div class="section-card">
        <div class="section-title"><span class="section-icon">⚙️</span> Processor</div>
        <div class="info-row"><span class="info-label">CPU</span><span class="info-value">$($Script:ComputerInfo.CPU.Name)</span></div>
        <div class="info-row"><span class="info-label">Generation</span><span class="info-value">$($Script:ComputerInfo.CPU.Generation)</span></div>
        <div class="info-row"><span class="info-label">Cores / Threads</span><span class="info-value">$($Script:ComputerInfo.CPU.NumberOfCores) / $($Script:ComputerInfo.CPU.NumberOfLogicalProcessors)</span></div>
        <div class="info-row"><span class="info-label">Max Speed</span><span class="info-value">$([math]::Round($Script:ComputerInfo.CPU.MaxClockSpeed/1000,2)) GHz</span></div>
        <div class="info-row"><span class="info-label">Current Load</span><span class="info-value" style="color:$cpuColor">$($Script:ComputerInfo.CPU.LoadPercentage)%</span></div>
        <div class="bar-wrap"><div class="bar-fill" style="width:$($Script:ComputerInfo.CPU.LoadPercentage)%;background:$cpuColor"></div></div>
        $thermalRows
      </div>

      <!-- GPU -->
      <div class="section-card">
        <div class="section-title"><span class="section-icon">🎮</span> Graphics</div>
        $gpuCards
      </div>

    </div>

    <!-- RIGHT COL -->
    <div>

      <!-- RAM -->
      <div class="section-card">
        <div class="section-title"><span class="section-icon">🧠</span> Memory (RAM)</div>
        <div class="gauge-row">
          <div class="gauge">
            <div class="gauge-val" style="color:$memColor">$($Script:HardwareInfo.Memory.UsagePercent)%</div>
            <div class="gauge-lbl">Used</div>
          </div>
          <div class="gauge">
            <div class="gauge-val">$($Script:HardwareInfo.Memory.TotalGB)GB</div>
            <div class="gauge-lbl">Total</div>
          </div>
          <div class="gauge">
            <div class="gauge-val" style="color:#38bdf8">$($Script:HardwareInfo.Memory.Type)</div>
            <div class="gauge-lbl">Type</div>
          </div>
        </div>
        <div class="bar-wrap" style="height:10px"><div class="bar-fill" style="width:$($Script:HardwareInfo.Memory.UsagePercent)%;background:$memColor"></div></div>
        <div class="info-row" style="margin-top:8px"><span class="info-label">Used / Free</span><span class="info-value">$($Script:HardwareInfo.Memory.UsedGB) GB / $($Script:HardwareInfo.Memory.FreeGB) GB</span></div>
        <div class="info-row"><span class="info-label">Speed</span><span class="info-value">$($Script:HardwareInfo.Memory.SpeedMHz) MHz</span></div>
        <div class="info-row"><span class="info-label">Slots Populated</span><span class="info-value">$($Script:HardwareInfo.Memory.Slots)</span></div>
      </div>

      <!-- Physical Storage -->
      <div class="section-card">
        <div class="section-title"><span class="section-icon">💽</span> Physical Storage</div>
        $storageCards
      </div>

      <!-- Disk Usage -->
      <div class="section-card">
        <div class="section-title"><span class="section-icon">📊</span> Disk Usage</div>
        $diskRows
      </div>

      <!-- Battery (only if present) -->
      $batterySection

      <!-- Network -->
      <div class="section-card">
        <div class="section-title"><span class="section-icon">🌐</span> Network Adapters</div>
        $netRows
      </div>

    </div>
  </div>

  <!-- Event Log -->
  <div class="section-card">
    <div class="section-title"><span class="section-icon">📋</span> Windows Event Log — Last 7 Days (Critical / Error)</div>
    $errRows
  </div>

</div>

<div class="footer">
  <b>HackRore Technician Edition v8.0</b> &nbsp;·&nbsp; $env:COMPUTERNAME &nbsp;·&nbsp; Report generated $scanTime
</div>

</body>
</html>
"@

    try {
        if (-not (Test-Path $OutputPath)) { New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null }
        $path = $Script:Config.HtmlReportPath
        $html | Out-File -FilePath $path -Encoding UTF8
        Write-Log "Report saved: $path" "SUCCESS"
        return $path
    } catch {
        Write-Log "Error saving report: $_" "ERROR"
        return $null
    }
}

# ══════════════════════════════════════════════════════════════════════════════
#  MAIN EXECUTION
# ══════════════════════════════════════════════════════════════════════════════

if (-not $Silent) {
    Write-Host @"

╔══════════════════════════════════════════════════════════╗
║   HACKRORE  ·  TECHNICIAN EDITION  v8.0                 ║
║   Enterprise Hardware Diagnostics for PC Technicians    ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
    if (-not (Test-Admin)) {
        Write-Host "  [NOTE] Run as Administrator for full SMART/battery/thermal data`n" -ForegroundColor Yellow
    }
}

Write-Log "Starting full system scan..." "INFO"

$Script:ComputerInfo = Get-SystemInfo
$Script:HardwareInfo = Get-HardwareInfo
$Script:StorageInfo  = Get-StorageDetails
$Script:BatteryInfo  = Get-BatteryInfo

if (-not $Silent) {
    Write-Host ""
    Write-Host "  Device   : $($Script:ComputerInfo.ComputerSystem.Manufacturer) $($Script:ComputerInfo.ComputerSystem.Model)" -ForegroundColor White
    Write-Host "  CPU      : $($Script:ComputerInfo.CPU.Name)" -ForegroundColor White
    Write-Host "  RAM      : $($Script:HardwareInfo.Memory.Label) | Usage: $($Script:HardwareInfo.Memory.UsagePercent)%" -ForegroundColor White
    foreach ($s in $Script:StorageInfo) {
        Write-Host "  Storage  : $($s.Label)" -ForegroundColor White
    }
    Write-Host "  Serial   : $($Script:ComputerInfo.BIOS.SerialNumber)" -ForegroundColor Gray
    Write-Host ""
}

$shouldOpen = $OpenReport -or (-not $NoOpen)

if ($ExportReport) {
    $reportPath = Export-HTML
    if ($shouldOpen -and $reportPath) { Open-InBrowser -ReportPath $reportPath }
}

if (-not $CompareScans) {
    $baselinePath = Save-Baseline
    if (-not $Silent -and $baselinePath) { Write-Log "Baseline saved: $baselinePath" "SUCCESS" }
}

if ($CompareScans) { Compare-Baseline -BaselinePath $BaselinePath }

$duration = (Get-Date) - $Script:ScanStartTime

if (-not $Silent) {
    Write-Host ""
    Write-Host "  ═══ RESULTS ═══════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  Critical Issues : $($Script:IssuesFound.Count)"  -ForegroundColor $(if($Script:IssuesFound.Count -gt 0){'Red'}else{'Green'})
    Write-Host "  Warnings        : $($Script:WarningsFound.Count)" -ForegroundColor $(if($Script:WarningsFound.Count -gt 0){'Yellow'}else{'Green'})
    Write-Host "  Scan Duration   : $([math]::Round($duration.TotalSeconds, 1))s" -ForegroundColor Gray
    Write-Host ""
}

Write-Log "Diagnostics complete." "SUCCESS"
