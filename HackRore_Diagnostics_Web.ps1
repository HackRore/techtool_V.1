# ==============================================================================
# HackRore Web Diagnostics - Remote System Diagnostics Tool
# VERSION: 1.0 (Web Edition)
# PURPOSE: Host a web-based diagnostic dashboard accessible from any browser
# DEVELOPER: Ravindra Ahire
# ==============================================================================

param(
    [int]$Port = 8080,
    [switch]$OpenBrowser
)

$ErrorActionPreference = "Continue"

# ==============================================================================
# DIAGNOSTIC FUNCTIONS
# ==============================================================================

function Get-SystemInfo {
    try {
        $cs = Get-CimInstance Win32_ComputerSystem -ErrorAction Stop
        $bios = Get-CimInstance Win32_BIOS -ErrorAction Stop
        $os = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
        $cpu = Get-CimInstance Win32_Processor -ErrorAction Stop | Select-Object -First 1
        
        $chassis = (Get-CimInstance Win32_SystemEnclosure -ErrorAction SilentlyContinue).ChassisTypes
        $isLaptop = ($chassis -match "^(8|9|10|11|12|14|18|21)$") -or ($cs.Model -match "laptop|notebook|thinkpad|elitebook|latitude|inspiron")
        $formFactor = if ($isLaptop) { "LAPTOP" } else { "DESKTOP" }
        
        $cpuGen = "Unknown"
        if ($cpu.Name -match "(\d+)th Gen") { $cpuGen = "$($Matches[1])th Gen" }
        
        return @{
            ComputerSystem = @{ Manufacturer = $cs.Manufacturer; Model = $cs.Model; TotalPhysicalMemory = $cs.TotalPhysicalMemory }
            BIOS = @{ SerialNumber = $bios.SerialNumber; Manufacturer = $bios.Manufacturer; Version = $bios.SMBIOSBIOSVersion }
            OS = @{ Caption = $os.Caption; Version = $os.Version; BuildNumber = $os.BuildNumber; OSArchitecture = $os.OSArchitecture; LastBootUpTime = $os.LastBootUpTime; FreePhysicalMemory = $os.FreePhysicalMemory }
            CPU = @{ Name = $cpu.Name; NumberOfCores = $cpu.NumberOfCores; NumberOfLogicalProcessors = $cpu.NumberOfLogicalProcessors; MaxClockSpeed = $cpu.MaxClockSpeed; LoadPercentage = $cpu.LoadPercentage; Generation = $cpuGen }
            FormFactor = $formFactor
        }
    } catch {
        return @{ ComputerSystem = @{ Manufacturer = "Unknown"; Model = "Unknown"; TotalPhysicalMemory = 0 }; BIOS = @{ SerialNumber = "Unknown" }; OS = @{ Caption = "Unknown"; Version = "Unknown"; LastBootUpTime = Get-Date }; CPU = @{ Name = "Unknown"; NumberOfCores = 0; LoadPercentage = 0 }; FormFactor = "UNKNOWN" }
    }
}

function Get-HardwareInfo {
    try {
        $totalRAM = [math]::Round($Script:ComputerInfo.ComputerSystem.TotalPhysicalMemory / 1GB, 2)
        $freeRAM = [math]::Round($Script:ComputerInfo.OS.FreePhysicalMemory / 1MB, 2)
        $usedRAM = [math]::Round($totalRAM - $freeRAM, 2)
        $ramPercent = if ($totalRAM -gt 0) { [math]::Round(($usedRAM / $totalRAM) * 100, 1) } else { 0 }
        
        $ramModules = Get-CimInstance Win32_PhysicalMemory -ErrorAction SilentlyContinue
        $ramSlots = ($ramModules | Measure-Object).Count
        $ramSpeed = if ($ramModules) { ($ramModules | Select-Object -First 1).Speed } else { "N/A" }
        $ramType = if ($ramModules) { switch (($ramModules | Select-Object -First 1).MemoryType) { 26{"DDR4"} 34{"DDR5"} 24{"DDR3"} default{"DDR"} } } else { "Unknown" }
        
        $result = @{
            Memory = @{ TotalGB = $totalRAM; UsedGB = $usedRAM; FreeGB = $freeRAM; UsagePercent = $ramPercent; SpeedMHz = $ramSpeed; Type = $ramType; Slots = $ramSlots }
            Disks = @()
        }
        
        foreach ($disk in (Get-CimInstance Win32_LogicalDisk -ErrorAction SilentlyContinue | Where-Object { $_.DriveType -eq 3 })) {
            if ($disk.Size -gt 0) {
                $totalGB = [math]::Round($disk.Size / 1GB, 2)
                $freeGB = [math]::Round($disk.FreeSpace / 1GB, 2)
                $usedGB = [math]::Round($totalGB - $freeGB, 2)
                $usedPercent = [math]::Round(($usedGB / $totalGB) * 100, 1)
                $result.Disks += @{ Drive = $disk.DeviceID; VolumeName = $disk.VolumeName; TotalGB = $totalGB; UsedGB = $usedGB; FreeGB = $freeGB; UsagePercent = $usedPercent }
            }
        }
        return $result
    } catch {
        return @{ Memory = @{ TotalGB = 0; UsedGB = 0; FreeGB = 0; UsagePercent = 0 }; Disks = @() }
    }
}

function Get-StorageDetails {
    $drives = @()
    try {
        $physDisks = Get-CimInstance Win32_DiskDrive -ErrorAction SilentlyContinue
        foreach ($pd in $physDisks) {
            $sizeGB = [math]::Round($pd.Size / 1GB, 0)
            $interface = "Unknown"
            $mediaType = "HDD"
            try {
                $msftDisk = Get-PhysicalDisk -ErrorAction SilentlyContinue | Where-Object { $_.SerialNumber -eq $pd.SerialNumber }
                if ($msftDisk) {
                    $busType = $msftDisk.BusType
                    $interface = switch ($busType) { "NVMe"{"NVMe"} "SATA"{"SATA"} default{$busType} }
                    $mediaType = if ($msftDisk.MediaType -eq "SSD" -or $pd.Model -match "SSD|NVMe") { "SSD" } else { "HDD" }
                }
            } catch {}
            if ($interface -eq "Unknown") {
                if ($pd.Model -match "NVMe") { $interface = "NVMe" }
                elseif ($pd.InterfaceType -match "SCSI") { $interface = "SATA" }
            }
            $formFactor = if ($interface -eq "NVMe") { "M.2 NVMe" } elseif ($mediaType -eq "SSD") { "SATA SSD" } else { "HDD" }
            $drives += @{ Index = $pd.Index; Model = $pd.Model; SizeGB = $sizeGB; Interface = $interface; MediaType = $mediaType; FormFactor = $formFactor }
        }
    } catch {}
    return $drives
}

function Get-BatteryInfo {
    try {
        $bat = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue
        if (-not $bat) { return @{ Present = $false } }
        $health = 0
        try {
            $batStatic = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryStaticData" -ErrorAction SilentlyContinue
            $batFull = Get-WmiObject -Namespace "ROOT\WMI" -Class "BatteryFullChargedCapacity" -ErrorAction SilentlyContinue
            if ($batStatic -and $batFull -and $batStatic.DesignedCapacity -gt 0) {
                $health = [math]::Round(($batFull.FullChargedCapacity / $batStatic.DesignedCapacity) * 100, 1)
            }
        } catch {}
        $chargeStatus = switch ($bat.BatteryStatus) { 1{"Discharging"} 2{"AC Power"} 3{"Fully Charged"} 6{"Charging"} default{"Unknown"} }
        return @{ Present = $true; Name = $bat.Name; ChargeLevel = $bat.EstimatedChargeRemaining; Status = $chargeStatus; Health = $health }
    } catch {
        return @{ Present = $false }
    }
}

function Get-GPUInfo {
    $gpus = @()
    try {
        foreach ($gpu in (Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue)) {
            $vramMB = [math]::Round($gpu.AdapterRAM / 1MB, 0)
            $gpus += @{ Name = $gpu.Name; VRAM = if ($vramMB -gt 0) { "${vramMB}MB" } else { "Shared" }; DriverVer = $gpu.DriverVersion; Resolution = "$($gpu.CurrentHorizontalResolution)x$($gpu.CurrentVerticalResolution)" }
        }
    } catch {}
    return $gpus
}

function Get-NetworkAdapters {
    $adapters = @()
    try {
        $nics = Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" -ErrorAction SilentlyContinue
        foreach ($nic in $nics) {
            $adapters += @{ Description = $nic.Description; MACAddress = $nic.MACAddress; IPAddress = ($nic.IPAddress -join ", "); DHCPEnabled = $nic.DHCPEnabled }
        }
    } catch {}
    return $adapters
}

function Get-WindowsActivation {
    try {
        $lic = Get-CimInstance SoftwareLicensingProduct -Filter "Name like 'Windows%' and PartialProductKey is not null" -ErrorAction SilentlyContinue
        if ($lic) {
            $status = $lic.LicenseStatus
            if ($status -eq 0) { return "Unlicensed" }
            elseif ($status -eq 1) { return "Licensed" }
            elseif ($status -eq 4) { return "Non-Genuine" }
            else { return "Unknown" }
        }
    } catch {}
    return "Unknown"
}

function Get-RecentErrors {
    $errors = @()
    try {
        $since = (Get-Date).AddDays(-7)
        $evts = Get-WinEvent -FilterHashtable @{ LogName = 'System'; Level = 1,2; StartTime = $since } -MaxEvents 15 -ErrorAction SilentlyContinue
        foreach ($e in $evts) {
            $errors += @{ Time = $e.TimeCreated.ToString("yyyy-MM-dd HH:mm"); Source = $e.ProviderName; Message = ($e.Message -split "`n")[0]; Level = if ($e.Level -eq 1) { "Critical" } else { "Error" } }
        }
    } catch {}
    return $errors
}

function Get-AllDiagnostics {
    $script:ComputerInfo = Get-SystemInfo
    $script:HardwareInfo = Get-HardwareInfo
    $script:StorageInfo = Get-StorageDetails
    $script:BatteryInfo = Get-BatteryInfo
    $script:GPUInfo = Get-GPUInfo
    $script:NetworkInfo = Get-NetworkAdapters
    $script:WinActivation = Get-WindowsActivation
    $script:RecentErrors = Get-RecentErrors
    
    $uptime = try { (Get-Date) - $script:ComputerInfo.OS.LastBootUpTime } catch { New-TimeSpan }
    
    return @{
        ComputerInfo = $script:ComputerInfo
        HardwareInfo = $script:HardwareInfo
        StorageInfo = $script:StorageInfo
        BatteryInfo = $script:BatteryInfo
        GPUInfo = $script:GPUInfo
        NetworkInfo = $script:NetworkInfo
        WindowsActivation = $script:WinActivation
        RecentErrors = $script:RecentErrors
        Uptime = @{ Days = $uptime.Days; Hours = $uptime.Hours; Minutes = $uptime.Minutes }
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
}

# ==============================================================================
# HTTP SERVER
# ==============================================================================

$script:HttpListener = $null

function Start-HackRoreServer {
    param([int]$ListenPort)
    
    $script:HttpListener = New-Object System.Net.HttpListener
    $script:HttpListener.Prefixes.Add("http://0.0.0.0:${ListenPort}/")
    
    try {
        $script:HttpListener.Start()
    } catch {
        Write-Host "[ERROR] Could not start server on port ${ListenPort}" -ForegroundColor Red
        return $false
    }
    
    $localIP = (Get-NetIPAddress -InterfaceAlias "*" -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch "^169\." } | Select-Object -First 1).IPAddress
    if (-not $localIP) { $localIP = "localhost" }
    
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "   HackRore Web Diagnostics v1.0 Started" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Local:   http://localhost:${ListenPort}" -ForegroundColor Green
    Write-Host "  Network: http://${localIP}:${ListenPort}" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    if ($OpenBrowser) {
        Start-Process "http://localhost:${ListenPort}"
    }
    
    while ($script:HttpListener.IsListening) {
        try {
            $context = $script:HttpListener.GetContextAsync().Wait()
            $request = $context.Task.Result
            $response = $request.Response
            $path = $request.Url.AbsolutePath
            
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            
            $content = ""
            $contentType = "text/html; charset=utf-8"
            
            if ($path -eq "/" -or $path -eq "") {
                $content = Get-IndexHTML
            } elseif ($path -eq "/api/diagnostics") {
                $content = (Get-AllDiagnostics) | ConvertTo-Json -Depth 10
                $contentType = "application/json"
            } elseif ($path -eq "/api/report") {
                $content = Get-ReportHTML
                $contentType = "text/html"
            } else {
                $content = '{"error":"Not found"}'
                $contentType = "application/json"
                $response.StatusCode = 404
            }
            
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.ContentType = $contentType
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
        } catch {}
    }
    return $true
}

function Stop-HackRoreServer {
    if ($script:HttpListener -and $script:HttpListener.IsListening) {
        $script:HttpListener.Stop()
        $script:HttpListener.Close()
    }
}

# ==============================================================================
# HTML TEMPLATES - Using single quotes to avoid PowerShell parsing issues
# ==============================================================================

function Get-IndexHTML {
return @'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HackRore Diagnostics</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; margin: 0; padding: 0; min-height: 100vh; }
        .header { background: linear-gradient(90deg, #161b22, #21262d); padding: 20px 30px; border-bottom: 1px solid #30363d; }
        .brand { font-size: 24px; font-weight: bold; color: #58a6ff; }
        .header-right { float: right; }
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; margin-left: 8px; }
        .btn-refresh { background: #21262d; color: #c9d1d9; border: 1px solid #30363d; }
        .btn-export { background: #238636; color: #fff; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .status-banner { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .device-info h1 { margin: 0 0 10px 0; font-size: 28px; }
        .meta { color: #8b949e; font-size: 13px; }
        .meta span { margin-right: 20px; }
        .status-badge { padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 16px; }
        .status-healthy { background: rgba(46, 160, 67, 0.2); color: #3fb950; border: 1px solid #238636; }
        .status-warning { background: rgba(187, 128, 9, 0.2); color: #d29922; border: 1px solid #9e6a03; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-bottom: 20px; }
        .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; }
        .card-title { font-size: 12px; font-weight: bold; color: #8b949e; text-transform: uppercase; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #30363d; }
        .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #21262d; font-size: 13px; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #8b949e; }
        .info-value { color: #c9d1d9; font-weight: 500; text-align: right; max-width: 60%; word-break: break-word; }
        .bar-container { margin: 10px 0; }
        .bar-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
        .bar { height: 8px; background: #21262d; border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
        .gauge { text-align: center; padding: 15px; }
        .gauge-value { font-size: 36px; font-weight: bold; }
        .gauge-label { font-size: 11px; color: #8b949e; text-transform: uppercase; margin-top: 5px; }
        .disk-item { padding: 10px 0; border-bottom: 1px solid #21262d; }
        .disk-item:last-child { border-bottom: none; }
        .disk-header { display: flex; justify-content: space-between; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
        .disk-details { font-size: 11px; color: #8b949e; display: flex; justify-content: space-between; }
        .event-item { padding: 8px 10px; background: #21262d; border-radius: 4px; margin: 5px 0; border-left: 3px solid #d29922; }
        .event-time { font-size: 11px; color: #8b949e; }
        .event-source { font-size: 12px; color: #58a6ff; font-weight: 500; }
        .event-msg { font-size: 12px; color: #c9d1d9; margin-top: 3px; opacity: 0.8; }
        .alert-ok { padding: 12px; background: rgba(46, 160, 67, 0.1); border: 1px solid #238636; border-radius: 6px; color: #3fb950; text-align: center; }
        .no-data { text-align: center; padding: 20px; color: #8b949e; font-size: 13px; }
        .loading { text-align: center; padding: 60px; color: #8b949e; font-size: 16px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">HackRore Diagnostics</div>
        <div class="header-right">
            <button class="btn btn-refresh" onclick="refreshData()">Refresh</button>
            <button class="btn btn-export" onclick="downloadReport()">Export</button>
        </div>
    <div class="container">
        <div id="loading" class="loading">Loading diagnostics...</div>
        <div id="content" style="display:none;">
            <div class="status-banner">
                <div class="device-info">
                    <h1 id="device-name">-</h1>
                    <div class="meta">
                        <span id="form-factor">-</span>
                        <span>Scanned: <span id="scan-time">-</span>
                        <span>Uptime: <span id="uptime">-</span>
                        <span>Windows: <span id="win-status">-</span>
                    </div>
                <div id="status-badge" class="status-badge status-healthy">HEALTHY</div>
            <div class="grid">
                <div class="card"><div class="card-title">System</div><div id="system-info"></div>
                <div class="card"><div class="card-title">Processor</div><div id="cpu-info"></div>
                <div class="card"><div class="card-title">Memory</div><div id="memory-info"></div>
                <div class="card"><div class="card-title">Storage</div><div id="storage-info"></div>
                <div class="card"><div class="card-title">Battery</div><div id="battery-info"></div>
                <div class="card"><div class="card-title">Graphics</div><div id="gpu-info"></div>
                <div class="card"><div class="card-title">Network</div><div id="network-info"></div>
                <div class="card"><div class="card-title">Disk Usage</div><div id="disk-usage"></div>
            </div>
            <div class="card"><div class="card-title">System Events (Last 7 Days)</div><div id="events-info"></div>
        </div>
    <script>
        function getColor(p) { if(p>90)return'#f85149';if(p>70)return'#d29922';return'#3fb950'; }
        async function refreshData() {
            try {
                var r = await fetch('/api/diagnostics');
                var data = await r.json();
                render(data);
            } catch(e) { console.error(e); }
        }
        function render(data) {
            document.getElementById('loading').style.display='none';
            document.getElementById('content').style.display='block';
            var sys=data.ComputerInfo, hw=data.HardwareInfo;
            document.getElementById('device-name').textContent = sys.ComputerSystem.Manufacturer+' '+sys.ComputerSystem.Model;
            document.getElementById('form-factor').textContent = sys.FormFactor;
            document.getElementById('scan-time').textContent = data.Timestamp;
            document.getElementById('uptime').textContent = data.Uptime.days+'d '+data.Uptime.hours+'h';
            document.getElementById('win-status').textContent = data.WindowsActivation;
            
            document.getElementById('system-info').innerHTML = 
                '<div class="info-row"><span class="info-label">Manufacturer</span><span class="info-value">'+sys.ComputerSystem.Manufacturer+'</span></div>'+
                '<div class="info-row"><span class="info-label">Model</span><span class="info-value">'+sys.ComputerSystem.Model+'</span></div>'+
                '<div class="info-row"><span class="info-label">Serial</span><span class="info-value">'+sys.BIOS.SerialNumber+'</span></div>';
            
            var cpu=sys.CPU, cpuC=getColor(cpu.LoadPercentage);
            document.getElementById('cpu-info').innerHTML = 
                '<div class="info-row"><span class="info-label">CPU</span><span class="info-value">'+cpu.Name+'</span></div>'+
                '<div class="info-row"><span class="info-label">Generation</span><span class="info-value">'+cpu.Generation+'</span></div>'+
                '<div class="bar-container"><div class="bar-label"><span>Usage</span><span style="color:'+cpuC+'">'+cpu.LoadPercentage+'%</span></div><div class="bar"><div class="bar-fill" style="width:'+cpu.LoadPercentage+'%;background:'+cpuC+'"></div></div>';
            
            var mem=hw.Memory, memC=getColor(mem.UsagePercent);
            document.getElementById('memory-info').innerHTML = 
                '<div class="gauge"><div class="gauge-value" style="color:'+memC+'">'+mem.UsagePercent+'%</div><div class="gauge-label">Memory Used</div>'+
                '<div class="info-row"><span class="info-label">Used/Total</span><span class="info-value">'+mem.UsedGB+' / '+mem.TotalGB+' GB</span></div>'+
                '<div class="info-row"><span class="info-label">Type</span><span class="info-value">'+mem.Type+' '+mem.SpeedMHz+' MHz</span></div>';
            
            var storHTML = '';
            if(data.StorageInfo&&data.StorageInfo.length>0){data.StorageInfo.forEach(function(d){storHTML+='<div class="info-row"><span class="info-label">'+d.Model+'</span><span class="info-value">'+d.SizeGB+' GB '+d.FormFactor+'</span></div>';});}
            else storHTML='<div class="no-data">No storage data</div>';
            document.getElementById('storage-info').innerHTML=storHTML;
            
            var batHTML='';
            if(data.BatteryInfo&&data.BatteryInfo.Present){var b=data.BatteryInfo,bc=getColor(b.ChargeLevel);batHTML='<div class="gauge"><div class="gauge-value" style="color:'+bc+'">'+b.ChargeLevel+'%</div><div class="gauge-label">'+b.Status+'</div>';if(b.Health>0)batHTML+='<div class="info-row"><span class="info-label">Health</span><span class="info-value">'+b.Health+'%</span></div>';}
            else batHTML='<div class="no-data">No battery (Desktop)</div>';
            document.getElementById('battery-info').innerHTML=batHTML;
            
            var gpuHTML='';
            if(data.GPUInfo&&data.GPUInfo.length>0){data.GPUInfo.forEach(function(g){gpuHTML+='<div class="info-row"><span class="info-label">'+g.Name+'</span><span class="info-value">'+g.VRAM+'</span></div>';});}
            else gpuHTML='<div class="no-data">No GPU</div>';
            document.getElementById('gpu-info').innerHTML=gpuHTML;
            
            var netHTML='';
            if(data.NetworkInfo&&data.NetworkInfo.length>0){data.NetworkInfo.forEach(function(n){netHTML+='<div class="info-row"><span class="info-label">'+(n.Description.length>30?n.Description.substring(0,30)+'...':n.Description)+'</span><span class="info-value">'+n.IPAddress+'</span></div>';});}
            else netHTML='<div class="no-data">No network</div>';
            document.getElementById('network-info').innerHTML=netHTML;
            
            var diskHTML='';
            if(hw.Disks&&hw.Disks.length>0){hw.Disks.forEach(function(d){var dc=getColor(d.UsagePercent);diskHTML+='<div class="disk-item"><div class="disk-header"><span>'+d.Drive+' '+d.VolumeName+'</span><span style="color:'+dc+'">'+d.UsagePercent+'%</span></div><div class="bar"><div class="bar-fill" style="width:'+d.UsagePercent+'%;background:'+dc+'"></div><div class="disk-details"><span>Used: '+d.UsedGB+' GB</span><span>Free: '+d.FreeGB+' GB</span></div>';});}
            else diskHTML='<div class="no-data">No disk data</div>';
            document.getElementById('disk-usage').innerHTML=diskHTML;
            
            var evtHTML='';
            if(data.RecentErrors&&data.RecentErrors.length>0){data.RecentErrors.slice(0,8).forEach(function(e){evtHTML+='<div class="event-item"><div class="event-time">'+e.Time+'</div><div class="event-source">'+e.Source+'</div><div class="event-msg">'+e.Message+'</div>';});}
            else evtHTML='<div class="alert-ok">OK - No critical events</div>';
            document.getElementById('events-info').innerHTML=evtHTML;
        }
        function downloadReport(){window.open('/api/report','_blank');}
        setInterval(refreshData,30000);
        refreshData();
    </script>
</body>
</html>
'@
}

function Get-ReportHTML {
    $data = Get-AllDiagnostics
    $sys = $data.ComputerInfo
    $hw = $data.HardwareInfo
    
    $cpuC = if($sys.CPU.LoadPercentage -gt 70){"#d29922"}else{"#3fb950"}
    $memC = if($hw.Memory.UsagePercent -gt 70){"#d29922"}else{"#3fb950"}
    
    $storHTML = ""
    if($data.StorageInfo -and $data.StorageInfo.Count -gt 0){
        foreach($s in $data.StorageInfo){$storHTML += "<div class='info-row'><span class='info-label'>$($s.Model)</span><span class='info-value'>$($s.SizeGB) GB $($s.FormFactor)</span></div>"}
    }else{$storHTML="<div class='no-data'>No storage</div>"}
    
    $batHTML = ""
    if($data.BatteryInfo -and $data.BatteryInfo.Present){
        $bat = $data.BatteryInfo
        $batHTML = "<div class='info-row'><span class='info-label'>Status</span><span class='info-value'>$($bat.Status)</span></div><div class='info-row'><span class='info-label'>Charge</span><span class='info-value'>$($bat.ChargeLevel)%</span></div>"
        if($bat.Health -gt 0){$batHTML += "<div class='info-row'><span class='info-label'>Health</span><span class='info-value'>$($bat.Health)%</span></div>"}
    }else{$batHTML="<div class='no-data'>No battery</div>"}
    
    $gpuHTML = ""
    if($data.GPUInfo -and $data.GPUInfo.Count -gt 0){
        foreach($g in $data.GPUInfo){$gpuHTML += "<div class='info-row'><span class='info-label'>$($g.Name)</span><span class='info-value'>$($g.VRAM)</span></div>"}
    }else{$gpuHTML="<div class='no-data'>No GPU</div>"}
    
    $netHTML = ""
    if($data.NetworkInfo -and $data.NetworkInfo.Count -gt 0){
        foreach($n in $data.NetworkInfo){$netHTML += "<div class='info-row'><span class='info-label'>$($n.Description)</span><span class='info-value'>$($n.IPAddress)</span></div>"}
    }else{$netHTML="<div class='no-data'>No network</div>"}
    
    $evtHTML = ""
    if($data.RecentErrors -and $data.RecentErrors.Count -gt 0){
        foreach($e in $data.RecentErrors){$evtHTML += "<div class='event-item'><div class='event-time'>$($e.Time)</div><div class='event-source'>$($e.Source)</div><div class='event-msg'>$($e.Message)</div>"}
    }else{$evtHTML="<div class='alert-ok'>OK - No critical events</div>"}
    
return @'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>HackRore Report</title>
    <style>
        body{font-family:'Segoe UI',sans-serif;background:#0d1117;color:#c9d1d9;margin:0;padding:40px;}
        .header{background:linear-gradient(90deg,#161b22,#21262d);padding:25px;border-radius:8px;margin-bottom:25px;}
        h1{margin:0;font-size:28px;color:#58a6ff;}
        .meta{color:#8b949e;margin-top:8px;}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-bottom:20px;}
        .card{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;}
        .card-title{font-size:12px;font-weight:bold;color:#8b949e;text-transform:uppercase;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #30363d;}
        .info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #21262d;font-size:13px;}
        .info-label{color:#8b949e;}
        .info-value{color:#c9d1d9;font-weight:500;}
        .bar{height:8px;background:#21262d;border-radius:4px;margin:8px 0;}
        .bar-fill{height:100%;border-radius:4px;}
        .event-item{padding:10px;background:#21262d;border-radius:4px;margin:5px 0;border-left:3px solid #d29922;}
        .event-time{font-size:11px;color:#8b949e;}
        .event-source{font-size:12px;color:#58a6ff;font-weight:500;}
        .event-msg{font-size:12px;color:#c9d1d9;margin-top:3px;}
        .alert-ok{padding:12px;background:rgba(46,160,67,0.1);border:1px solid #238636;border-radius:6px;color:#3fb950;text-align:center;}
        .no-data{text-align:center;padding:20px;color:#8b949e;}
        .footer{text-align:center;margin-top:30px;color:#8b949e;font-size:12px;}
    </style>
</head>
<body>
    <div class="header">
        <h1>HackRore Diagnostics Report</h1>
        <div class="meta">@ComputerInfo.ComputerSystem.Manufacturer@ @ComputerInfo.ComputerSystem.Model@ | @Timestamp@</div>
    <div class="grid">
        <div class="card">
            <div class="card-title">System</div>
            <div class="info-row"><span class="info-label">Manufacturer</span><span class="info-value">@ComputerInfo.ComputerSystem.Manufacturer@</span></div>
            <div class="info-row"><span class="info-label">Model</span><span class="info-value">@ComputerInfo.ComputerSystem.Model@</span></div>
            <div class="info-row"><span class="info-label">Serial</span><span class="info-value">@ComputerInfo.BIOS.SerialNumber@</span></div>
            <div class="info-row"><span class="info-label">Form Factor</span><span class="info-value">@ComputerInfo.FormFactor@</span></div>
        <div class="card">
            <div class="card-title">Operating System</div>
            <div class="info-row"><span class="info-label">OS</span><span class="info-value">@ComputerInfo.OS.Caption@</span></div>
            <div class="info-row"><span class="info-label">Build</span><span class="info-value">@ComputerInfo.OS.BuildNumber@</span></div>
            <div class="info-row"><span class="info-label">Uptime</span><span class="info-value">@Uptime.days@d @Uptime.hours@h</span></div>
            <div class="info-row"><span class="info-label">Activation</span><span class="info-value">@WindowsActivation@</span></div>
        <div class="card">
            <div class="card-title">Processor</div>
            <div class="info-row"><span class="info-label">CPU</span><span class="info-value">@ComputerInfo.CPU.Name@</span></div>
            <div class="info-row"><span class="info-label">Cores</span><span class="info-value">@ComputerInfo.CPU.NumberOfCores@</span></div>
            <div class="info-row"><span class="info-label">Usage</span><span class="info-value">@ComputerInfo.CPU.LoadPercentage@%</span></div>
            <div class="bar"><div class="bar-fill" style="width:@ComputerInfo.CPU.LoadPercentage@%;background:@cpuC@"></div>
        </div>
        <div class="card">
            <div class="card-title">Memory</div>
            <div class="info-row"><span class="info-label">Total</span><span class="info-value">@HardwareInfo.Memory.TotalGB@ GB</span></div>
            <div class="info-row"><span class="info-label">Used</span><span class="info-value">@HardwareInfo.Memory.UsedGB@ GB</span></div>
            <div class="info-row"><span class="info-label">Usage</span><span class="info-value">@HardwareInfo.Memory.UsagePercent@%</span></div>
            <div class="bar"><div class="bar-fill" style="width:@HardwareInfo.Memory.UsagePercent@%;background:@memC@"></div>
        </div>
    <div class="card" style="margin-bottom:20px;">
        <div class="card-title">Storage</div>
        @storageHTML@
    </div>
    <div class="card" style="margin-bottom:20px;">
        <div class="card-title">Battery</div>
        @batteryHTML@
    </div>
    <div class="card" style="margin-bottom:20px;">
        <div class="card-title">Graphics</div>
        @gpuHTML@
    </div>
    <div class="card" style="margin-bottom:20px;">
        <div class="card-title">Network</div>
        @netHTML@
    </div>
    <div class="card">
        <div class="card-title">Recent Events</div>
        @evtHTML@
    </div>
    <div class="footer">Generated by HackRore Web Diagnostics</div>
</body>
</html>
'@ -replace '@ComputerInfo.ComputerSystem.Manufacturer@',$sys.ComputerSystem.Manufacturer -replace '@ComputerInfo.ComputerSystem.Model@',$sys.ComputerSystem.Model -replace '@ComputerInfo.BIOS.SerialNumber@',$sys.BIOS.SerialNumber -replace '@ComputerInfo.FormFactor@',$sys.FormFactor -replace '@ComputerInfo.OS.Caption@',$sys.OS.Caption -replace '@ComputerInfo.OS.BuildNumber@',$sys.OS.BuildNumber -replace '@ComputerInfo.CPU.Name@',$sys.CPU.Name -replace '@ComputerInfo.CPU.NumberOfCores@',$sys.CPU.NumberOfCores -replace '@ComputerInfo.CPU.LoadPercentage@',$sys.CPU.LoadPercentage -replace '@HardwareInfo.Memory.TotalGB@',$hw.Memory.TotalGB -replace '@HardwareInfo.Memory.UsedGB@',$hw.Memory.UsedGB -replace '@HardwareInfo.Memory.UsagePercent@',$hw.Memory.UsagePercent -replace '@Uptime.days@',$data.Uptime.days -replace '@Uptime.hours@',$data.Uptime.hours -replace '@WindowsActivation@',$data.WindowsActivation -replace '@Timestamp@',$data.Timestamp -replace '@cpuC@',$cpuC -replace '@memC@',$memC -replace '@storageHTML@',$storHTML -replace '@batteryHTML@',$batHTML -replace '@gpuHTML@',$gpuHTML -replace '@netHTML@',$netHTML -replace '@evtHTML@',$evtHTML
}

# ==============================================================================
# MAIN
# ==============================================================================

[Console]::Title = "HackRore Web Diagnostics"

Write-Host ""
Write-Host "Initializing HackRore Web Diagnostics..." -ForegroundColor Cyan
Write-Host ""

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[NOTE] Running without admin privileges. Some features may be limited." -ForegroundColor Yellow
}

Start-HackRoreServer -ListenPort $Port
