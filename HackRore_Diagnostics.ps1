# ==============================================================================
# BRAND: HackRore Diagnostics & Optimizer
# DEVELOPER: Ravindra Ahire
# VERSION: 8.3 (Enhanced Edition)
# PURPOSE: Enterprise-grade hardware diagnostics for Windows desktop/laptop
# ==============================================================================

param(
    [switch]$ExportReport,
    [switch]$QuickScan,
    [switch]$FullScan,
    [switch]$Silent,
    [switch]$OpenReport,
    [switch]$NoOpen
)

$ErrorActionPreference = "Continue"

# Colors
function Get-ColorForPercent {
    param([double]$Percent)
    if ($Percent -gt 90) { return "#ef4444" }
    elseif ($Percent -gt 70) { return "#f59e0b" }
    else { return "#22c55e" }
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   HACKRORE DIAGNOSTICS v8.3" -ForegroundColor Cyan
Write-Host "   Enterprise Hardware Diagnostics" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# System Info
Write-Host "Collecting system information..." -ForegroundColor Yellow

try {
    $cs = Get-CimInstance Win32_ComputerSystem
    $bios = Get-CimInstance Win32_BIOS
    $os = Get-CimInstance Win32_OperatingSystem
    $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
    
    # Form factor detection
    $chassis = (Get-CimInstance Win32_SystemEnclosure -ErrorAction SilentlyContinue).ChassisTypes
    $isLaptop = ($chassis -match "^(8|9|10|11|12|14|18|21)$") -or ($cs.Model -match "laptop|notebook|thinkpad")
    $formFactor = if ($isLaptop) { "Laptop" } else { "Desktop" }
    
    # Memory
    $totalRAM = [math]::Round($cs.TotalPhysicalMemory / 1GB, 2)
    $freeRAM = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
    $usedRAM = [math]::Round($totalRAM - $freeRAM, 2)
    $ramPercent = if ($totalRAM -gt 0) { [math]::Round(($usedRAM / $totalRAM) * 100, 1) } else { 0 }
    
    # RAM Details
    $ramModules = Get-CimInstance Win32_PhysicalMemory -ErrorAction SilentlyContinue
    $ramSlots = ($ramModules | Measure-Object).Count
    $ramSpeed = if ($ramModules) { ($ramModules | Select-Object -First 1).Speed } else { "N/A" }
    $ramType = if ($ramModules) {
        switch (($ramModules | Select-Object -First 1).MemoryType) {
            26 { "DDR4" } 34 { "DDR5" } 24 { "DDR3" } default { "DDR" }
        }
    } else { "Unknown" }
    
    # Disks
    $disks = @()
    foreach ($disk in (Get-CimInstance Win32_LogicalDisk -ErrorAction SilentlyContinue | Where-Object { $_.DriveType -eq 3 })) {
        if ($disk.Size -gt 0) {
            $totalGB = [math]::Round($disk.Size / 1GB, 2)
            $freeGB = [math]::Round($disk.FreeSpace / 1GB, 2)
            $usedGB = [math]::Round($totalGB - $freeGB, 2)
            $usedPercent = [math]::Round(($usedGB / $totalGB) * 100, 1)
            $disks += @{ Drive = $disk.DeviceID; VolumeName = $disk.VolumeName; TotalGB = $totalGB; UsedGB = $usedGB; FreeGB = $freeGB; UsagePercent = $usedPercent }
        }
    }
    
    # Storage drives
    $storages = @()
    try {
        foreach ($pd in (Get-CimInstance Win32_DiskDrive -ErrorAction SilentlyContinue)) {
            $sizeGB = [math]::Round($pd.Size / 1GB, 0)
            $mediaType = if ($pd.Model -match "SSD|NVMe|M.2") { "SSD" } else { "HDD" }
            $interface = if ($pd.Model -match "NVMe") { "NVMe" } elseif ($pd.InterfaceType -match "SCSI") { "SATA" } else { $pd.InterfaceType }
            $storages += @{ Model = $pd.Model; SizeGB = $sizeGB; MediaType = $mediaType; Interface = $interface }
        }
    } catch {}
    
    # Battery
    $battery = @{ Present = $false; ChargeLevel = 0; Health = 0 }
    try {
        $bat = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue
        if ($bat) {
            $health = 0
            try {
                $batStatic = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryStaticData" -ErrorAction SilentlyContinue
                $batFull = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryFullChargedCapacity" -ErrorAction SilentlyContinue
                if ($batStatic -and $batFull -and $batStatic.DesignedCapacity -gt 0) {
                    $health = [math]::Round(($batFull.FullChargedCapacity / $batStatic.DesignedCapacity) * 100, 1)
                }
            } catch {}
            $battery = @{ Present = $true; ChargeLevel = $bat.EstimatedChargeRemaining; Health = $health }
        }
    } catch {}
    
    # GPU
    $gpus = @()
    try {
        foreach ($gpu in (Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue)) {
            $vramMB = [math]::Round($gpu.AdapterRAM / 1MB, 0)
            $gpus += @{ Name = $gpu.Name; VRAM = if ($vramMB -gt 0) { "${vramMB}MB" } else { "Shared" } }
        }
    } catch {}
    
    # Network
    $network = @()
    try {
        foreach ($nic in (Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" -ErrorAction SilentlyContinue)) {
            $network += @{ Description = $nic.Description; IPAddress = ($nic.IPAddress -join ", ") }
        }
    } catch {}
    
    # Bluetooth
    $bluetooth = @{ Present = $false; Status = "Not Found" }
    try {
        $bt = Get-CimInstance Win32_PnPEntity -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "Bluetooth" -and $_.Status -ne "Error" }
        if ($bt) {
            $bluetooth = @{ Present = $true; Status = $bt.Status; Name = $bt.Name }
        }
    } catch {}
    
    # Windows Activation
    $winAct = "Unknown"
    try {
        $lic = Get-CimInstance SoftwareLicensingProduct -Filter "Name like 'Windows%' and PartialProductKey is not null" -ErrorAction SilentlyContinue
        if ($lic) { $winAct = if ($lic.LicenseStatus -eq 1) { "Licensed" } else { "Unlicensed" } }
    } catch {}
    
    # Uptime
    $uptime = (Get-Date) - $os.LastBootUpTime
    
    # ===== DISPLAY RESULTS =====
    Write-Host ""
    Write-Host "--- SYSTEM ---" -ForegroundColor Cyan
    Write-Host "  Manufacturer: $($cs.Manufacturer)"
    Write-Host "  Model: $($cs.Model)"
    Write-Host "  Serial: $($bios.SerialNumber)"
    Write-Host "  Form Factor: $formFactor"
    
    Write-Host ""
    Write-Host "--- OPERATING SYSTEM ---" -ForegroundColor Cyan
    Write-Host "  OS: $($os.Caption)"
    Write-Host "  Version: $($os.Version) (Build $($os.BuildNumber))"
    Write-Host "  Architecture: $($os.OSArchitecture)"
    Write-Host "  Uptime: $($uptime.Days) days $($uptime.Hours) hours"
    Write-Host "  Activation: $winAct"
    
    Write-Host ""
    Write-Host "--- PROCESSOR ---" -ForegroundColor Cyan
    Write-Host "  CPU: $($cpu.Name)"
    Write-Host "  Cores: $($cpu.NumberOfCores) | Threads: $($cpu.NumberOfLogicalProcessors)"
    Write-Host "  Speed: $([math]::Round($cpu.MaxClockSpeed/1000,2)) GHz"
    Write-Host "  Usage: $($cpu.LoadPercentage)%"
    
    Write-Host ""
    Write-Host "--- MEMORY ---" -ForegroundColor Cyan
    Write-Host "  Total: $totalRAM GB"
    Write-Host "  Used: $usedRAM GB | Free: $freeRAM GB"
    Write-Host "  Usage: $ramPercent%"
    Write-Host "  Type: $ramType | Speed: $ramSpeed MHz | Slots: $ramSlots"
    
    Write-Host ""
    Write-Host "--- STORAGE ---" -ForegroundColor Cyan
    foreach ($s in $storages) {
        Write-Host "  $($s.Model) - $($s.SizeGB) GB $($s.MediaType)"
    }
    
    Write-Host ""
    Write-Host "--- DISK USAGE ---" -ForegroundColor Cyan
    foreach ($d in $disks) {
        $color = Get-ColorForPercent -Percent $d.UsagePercent
        Write-Host "  Drive $($d.Drive) ($($d.VolumeName)): $($d.UsagePercent)% used ($($d.UsedGB) GB / $($d.TotalGB) GB)"
    }
    
    if ($battery.Present) {
        Write-Host ""
        Write-Host "--- BATTERY ---" -ForegroundColor Cyan
        Write-Host "  Charge: $($battery.ChargeLevel)%"
        if ($battery.Health -gt 0) {
            Write-Host "  Health: $($battery.Health)%"
        }
    }
    
    Write-Host ""
    Write-Host "--- BLUETOOTH ---" -ForegroundColor Cyan
    if ($bluetooth.Present) {
        Write-Host "  Status: $($bluetooth.Status)"
    } else {
        Write-Host "  Status: Not Detected"
    }
    
    Write-Host ""
    Write-Host "--- GRAPHICS ---" -ForegroundColor Cyan
    foreach ($g in $gpus) {
        Write-Host "  $($g.Name) - $($g.VRAM)"
    }
    
    Write-Host ""
    Write-Host "--- NETWORK ---" -ForegroundColor Cyan
    foreach ($n in $network) {
        Write-Host "  $($n.Description): $($n.IPAddress)"
    }
    
    # ===== GENERATE HTML REPORT =====
    if ($ExportReport) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $reportPath = "$env:USERPROFILE\Desktop\HackRore_Report_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
        
        $cpuColor = Get-ColorForPercent -Percent $cpu.LoadPercentage
        $memColor = Get-ColorForPercent -Percent $ramPercent
        
        # ===== GENERATE HEADLINE SPEC =====
        # CPU Generation detection
        $cpuGen = "Unknown"
        if ($cpu.Name -match "(\d+)th Gen") { $cpuGen = "$($Matches[1])th Gen" }
        elseif ($cpu.Name -match "i[3579]-(\d+)") { 
            $genNum = [string]$Matches[1][0]
            $cpuGen = "${genNum}th Gen"
        }
        
        # Short CPU name
        $cpuShort = ""
        if ($cpu.Name -match "(i[3579]-\d+\w*)") { $cpuShort = $Matches[1] }
        elseif ($cpu.Name -match "(Ryzen \d \d+\w*)") { $cpuShort = $Matches[1] }
        else { 
            $cpuShort = ($cpu.Name -split "@")[0].Trim()
            if ($cpuShort.Length -gt 25) { $cpuShort = $cpuShort.Substring(0, 25) + "..." }
        }
        
        # RAM Label
        $ramLabel = "$([math]::Round($totalRAM))GB $ramType"
        
        # Storage Label
        $storLabel = "Unknown"
        if ($storages.Count -gt 0) {
            $firstStorage = $storages[0]
            $storLabel = "$([math]::Round($firstStorage.SizeGB))GB $($firstStorage.MediaType)"
            if ($firstStorage.Interface -eq "NVMe" -or $firstStorage.Model -match "NVMe") { 
                $storLabel = "$([math]::Round($firstStorage.SizeGB))GB NVMe" 
            }
        }
        
        # OS Short Version
        $osShort = "Windows $($os.Version.Split('.')[0])"
        
        # Battery health for headline
        $batteryHeadline = ""
        if ($battery.Present -and $battery.Health -gt 0) {
            $batteryHeadline = " | Battery: $($battery.Health)% health"
        }
        
        # Headline for top of report
        $headlineSpec = "$($cs.Model) | $cpuShort ($cpuGen) | $ramLabel | $storLabel"
        $headlineSub = "$osShort$batteryHeadline"
        $deviceSerial = "S/N: $($bios.SerialNumber)"
        
        # Bluetooth status
        $bluetoothHtml = ""
        if ($bluetooth.Present) {
            $btColor = if ($bluetooth.Status -eq "OK") { "#22c55e" } else { "#f59e0b" }
            $bluetoothHtml = "<div class='row'><span class='label'>Bluetooth</span><span class='value' style='color:$btColor'>$($bluetooth.Status)</span></div>"
        } else {
            $bluetoothHtml = "<div class='row'><span class='label'>Bluetooth</span><span class='value' style='color:#94a3b8'>Not Detected</span></div>"
        }
        
        $diskHtml = ""
        foreach ($d in $disks) {
            $dColor = Get-ColorForPercent -Percent $d.UsagePercent
            $diskHtml += "<div class='disk-item'><div class='disk-header'><span>$($d.Drive) $($d.VolumeName)</span><span style='color:$dColor'>$($d.UsagePercent)%</span></div><div class='bar-wrap'><div class='bar-fill' style='width:$($d.UsagePercent)%;background:$dColor'></div><div class='disk-sub'><span>Used: $($d.UsedGB) GB</span><span>Free: $($d.FreeGB) GB</span></div>"
        }
        
        $storageHtml = ""
        foreach ($s in $storages) {
            $storageHtml += "<div class='row'><span class='label'>$($s.Model)</span><span class='value'>$($s.SizeGB) GB $($s.MediaType)</span></div>"
        }
        
        $gpuHtml = ""
        foreach ($g in $gpus) {
            $gpuHtml += "<div class='row'><span class='label'>$($g.Name)</span><span class='value'>$($g.VRAM)</span></div>"
        }
        
        $netHtml = ""
        foreach ($n in $network) {
            $netHtml += "<div class='row'><span class='label'>$($n.Description)</span><span class='value'>$($n.IPAddress)</span></div>"
        }
        
        $batteryHtmlDetail = ""
        if ($battery.Present) {
            $bColor = Get-ColorForPercent -Percent $battery.ChargeLevel
            $batteryHtmlDetail = "<div class='gauge'><div class='gauge-value' style='color:$bColor'>$($battery.ChargeLevel)%</div><div class='gauge-label'>Charge Level</div>"
            if ($battery.Health -gt 0) {
                $hColor = Get-ColorForPercent -Percent $battery.Health
                $batteryHtmlDetail += "<div class='row'><span class='label'>Health</span><span class='value' style='color:$hColor'>$($battery.Health)%</span></div>"
            }
            $batteryHtmlDetail += "</div>"
        } else {
            $batteryHtmlDetail = "<div class='gauge'><div class='gauge-value'>N/A</div><div class='gauge-label'>No Battery (Desktop)</div>"
        }
        
        $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HackRore Diagnostics</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #0f172a, #1e293b); min-height: 100vh; padding: 40px; color: #e2e8f0; }
        .container { max-width: 1200px; margin: 0 auto; }
        
        /* COLORFUL HEADLINE BANNER */
        .headline-banner {
            background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #1e3a5f 100%);
            border-radius: 16px;
            padding: 28px 32px;
            margin-bottom: 24px;
            border: 1px solid rgba(56, 189, 248, 0.3);
            position: relative;
            overflow: hidden;
        }
        .headline-banner::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #06b6d4, #38bdf8, #06b6d4);
        }
        .headline-main {
            font-size: 22px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }
        .headline-sub {
            font-size: 14px;
            color: #38bdf8;
            font-weight: 500;
            margin-bottom: 12px;
        }
        .headline-serial {
            font-size: 12px;
            color: rgba(255,255,255,0.6);
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
            display: inline-block;
            background: rgba(0,0,0,0.3);
            padding: 6px 12px;
            border-radius: 6px;
        }
        
        .header { background: linear-gradient(135deg, #06b6d4, #0891b2); border-radius: 16px; padding: 30px; margin-bottom: 30px; color: white; }
        .header h1 { font-size: 32px; margin-bottom: 10px; }
        .header .meta { opacity: 0.9; font-size: 14px; }
        .status { display: inline-block; background: rgba(0,0,0,0.3); padding: 8px 20px; border-radius: 30px; margin-top: 15px; font-weight: 600; }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; }
        .card h3 { color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .row:last-child { border-bottom: none; }
        .label { color: #94a3b8; }
        .value { font-weight: 600; color: #f1f5f9; text-align: right; }
        .bar-wrap { height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; margin: 15px 0; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 5px; transition: width 0.5s; }
        .gauge { text-align: center; padding: 20px; }
        .gauge-value { font-size: 48px; font-weight: 700; }
        .gauge-label { color: #94a3b8; font-size: 12px; text-transform: uppercase; margin-top: 5px; }
        .disk-item { margin: 15px 0; }
        .disk-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .disk-sub { display: flex; justify-content: space-between; color: #94a3b8; font-size: 12px; margin-top: 5px; }
        .footer { text-align: center; color: #64748b; padding: 30px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        
        <!-- HEADLINE BANNER -->
        <div class="headline-banner">
            <div class="headline-main">$headlineSpec</div>
            <div class="headline-sub">$headlineSub</div>
            <div class="headline-serial">$deviceSerial</div>
        
        <div class="header">
            <h1>HackRore Diagnostics</h1>
            <div class="meta">$timestamp</div>
            <div class="status">$formFactor | $($os.Caption)</div>
        
        <div class="grid">
            <div class="card">
                <h3>System</h3>
                <div class="row"><span class="label">Manufacturer</span><span class="value">$($cs.Manufacturer)</span></div>
                <div class="row"><span class="label">Model</span><span class="value">$($cs.Model)</span></div>
                <div class="row"><span class="label">Serial Number</span><span class="value">$($bios.SerialNumber)</span></div>
                <div class="row"><span class="label">Form Factor</span><span class="value">$formFactor</span></div>
                <div class="row"><span class="label">BIOS</span><span class="value">$($bios.SMBIOSBIOSVersion)</span></div>
                $bluetoothHtml
            </div>
            
            <div class="card">
                <h3>Operating System</h3>
                <div class="row"><span class="label">OS</span><span class="value">$($os.Caption)</span></div>
                <div class="row"><span class="label">Version</span><span class="value">$($os.Version) (Build $($os.BuildNumber))</span></div>
                <div class="row"><span class="label">Architecture</span><span class="value">$($os.OSArchitecture)</span></div>
                <div class="row"><span class="label">Uptime</span><span class="value">$($uptime.Days) days $($uptime.Hours) hours</span></div>
                <div class="row"><span class="label">Activation</span><span class="value">$winAct</span></div>
            
            <div class="card">
                <h3>Processor</h3>
                <div class="gauge">
                    <div class="gauge-value" style="color:$cpuColor">$($cpu.LoadPercentage)%</div>
                    <div class="gauge-label">CPU Usage</div>
                <div class="bar-wrap"><div class="bar-fill" style="width:$($cpu.LoadPercentage)%;background:$cpuColor"></div>
                <div class="row"><span class="label">CPU</span><span class="value" style="font-size:11px">$($cpu.Name)</span></div>
                <div class="row"><span class="label">Cores / Threads</span><span class="value">$($cpu.NumberOfCores) / $($cpu.NumberOfLogicalProcessors)</span></div>
                <div class="row"><span class="label">Max Speed</span><span class="value">$([math]::Round($cpu.MaxClockSpeed/1000,2)) GHz</span></div>
            
            <div class="card">
                <h3>Memory (RAM)</h3>
                <div class="gauge">
                    <div class="gauge-value" style="color:$memColor">$ramPercent%</div>
                    <div class="gauge-label">Memory Usage</div>
                <div class="bar-wrap"><div class="bar-fill" style="width:$ramPercent%;background:$memColor"></div>
                <div class="row"><span class="label">Used</span><span class="value">$usedRAM GB</span></div>
                <div class="row"><span class="label">Total</span><span class="value">$totalRAM GB</span></div>
                <div class="row"><span class="label">Type / Speed</span><span class="value">$ramType / $ramSpeed MHz</span></div>
                <div class="row"><span class="label">Slots</span><span class="value">$ramSlots</span></div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>Storage Drives</h3>
                $storageHtml
            </div>
            
            <div class="card">
                <h3>Disk Usage</h3>
                $diskHtml
            </div>
            
            <div class="card">
                <h3>Battery</h3>
                $batteryHtmlDetail
            </div>
            
            <div class="card">
                <h3>Graphics</h3>
                $gpuHtml
            </div>
        
        <div class="grid">
            <div class="card" style="grid-column: span 2;">
                <h3>Network Adapters</h3>
                $netHtml
            </div>
        
        <div class="footer">
            <p>HackRore Diagnostics v8.3 | Generated $timestamp | $env:COMPUTERNAME</p>
        </div>
</body>
</html>
"@
        
        if (-not (Test-Path "$env:USERPROFILE\Desktop")) {
            New-Item -ItemType Directory -Path "$env:USERPROFILE\Desktop" -Force | Out-Null
        }
        
        $html | Out-File -FilePath $reportPath -Encoding UTF8
        
        Write-Host ""
        Write-Host "Report saved: $reportPath" -ForegroundColor Green
        
        if ($OpenReport -or (-not $NoOpen)) {
            Start-Process $reportPath
        }
    }
    
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Green
    Write-Host "   Diagnostics Complete!" -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host "Please try running as Administrator." -ForegroundColor Yellow
}

Write-Host ""
