# HackRore Technician Toolkit - Severity-Classified Diagnostics
# Version 1.0 - With Severity Levels

param(
    [string]$OutputPath = "$env:USERPROFILE\Desktop",
    [switch]$OpenBrowser
)

$ErrorActionPreference = "Continue"

# Severity levels
$SEVERITY_INFO = "INFO"
$SEVERITY_WARNING = "WARNING"
$SEVERITY_CRITICAL = "CRITICAL"

$script:Findings = @()

function Add-Finding {
    param([string]$Severity, [string]$Category, [string]$Message)
    $script:Findings += @{
        Severity = $Severity
        Category = $Category
        Message = $Message
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
}

# Collect diagnostics
Write-Host "Collecting system information..." -ForegroundColor Cyan

try {
    $cs = Get-CimInstance Win32_ComputerSystem
    $bios = Get-CimInstance Win32_BIOS
    $os = Get-CimInstance Win32_OperatingSystem
    $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
    
    # Severity: Check CPU Usage
    if ($cpu.LoadPercentage -gt 90) {
        Add-Finding -Severity $SEVERITY_CRITICAL -Category "CPU" -Message "CPU usage is very high: $($cpu.LoadPercentage)%"
    } elseif ($cpu.LoadPercentage -gt 70) {
        Add-Finding -Severity $SEVERITY_WARNING -Category "CPU" -Message "CPU usage is elevated: $($cpu.LoadPercentage)%"
    } else {
        Add-Finding -Severity $SEVERITY_INFO -Category "CPU" -Message "CPU usage is normal: $($cpu.LoadPercentage)%"
    }
    
    # Memory
    $totalRAM = [math]::Round($cs.TotalPhysicalMemory / 1GB, 2)
    $freeRAM = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
    $usedRAM = [math]::Round($totalRAM - $freeRAM, 2)
    $ramPercent = [math]::Round(($usedRAM / $totalRAM) * 100, 1)
    
    if ($ramPercent -gt 90) {
        Add-Finding -Severity $SEVERITY_CRITICAL -Category "Memory" -Message "Memory usage is critical: $ramPercent%"
    } elseif ($ramPercent -gt 70) {
        Add-Finding -Severity $SEVERITY_WARNING -Category "Memory" -Message "Memory usage is high: $ramPercent%"
    } else {
        Add-Finding -Severity $SEVERITY_INFO -Category "Memory" -Message "Memory usage is normal: $ramPercent%"
    }
    
    # Disk Usage
    foreach ($disk in (Get-CimInstance Win32_LogicalDisk -ErrorAction SilentlyContinue | Where-Object { $_.DriveType -eq 3 })) {
        if ($disk.Size -gt 0) {
            $usedPct = [math]::Round((($disk.Size - $disk.FreeSpace) / $disk.Size) * 100, 1)
            if ($usedPct -gt 90) {
                Add-Finding -Severity $SEVERITY_CRITICAL -Category "Storage" -Message "Disk $($disk.DeviceID) is nearly full: $usedPct%"
            } elseif ($usedPct -gt 80) {
                Add-Finding -Severity $SEVERITY_WARNING -Category "Storage" -Message "Disk $($disk.DeviceID) is filling up: $usedPct%"
            } else {
                Add-Finding -Severity $SEVERITY_INFO -Category "Storage" -Message "Disk $($disk.DeviceID) has space: $usedPct% used"
            }
        }
    }
    
    # Battery
    $bat = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue
    if ($bat) {
        if ($bat.EstimatedChargeRemaining -lt 20) {
            Add-Finding -Severity $SEVERITY_WARNING -Category "Battery" -Message "Battery low: $($bat.EstimatedChargeRemaining)%"
        } else {
            Add-Finding -Severity $SEVERITY_INFO -Category "Battery" -Message "Battery OK: $($bat.EstimatedChargeRemaining)%"
        }
    }
    
    # Windows Activation
    try {
        $lic = Get-CimInstance SoftwareLicensingProduct -Filter "Name like 'Windows%' and PartialProductKey is not null" -ErrorAction SilentlyContinue
        if ($lic -and $lic.LicenseStatus -ne 1) {
            Add-Finding -Severity $SEVERITY_WARNING -Category "Windows" -Message "Windows not activated"
        } else {
            Add-Finding -Severity $SEVERITY_INFO -Category "Windows" -Message "Windows is activated"
        }
    } catch {}
    
    # Event Log Errors
    $errCount = (Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2; StartTime=(Get-Date).AddDays(-7)} -MaxEvents 10 -ErrorAction SilentlyContinue | Measure-Object).Count
    if ($errCount -gt 5) {
        Add-Finding -Severity $SEVERITY_WARNING -Category "Events" -Message "$errCount system errors in last 7 days"
    } elseif ($errCount -gt 0) {
        Add-Finding -Severity $SEVERITY_INFO -Category "Events" -Message "$errCount system events logged"
    }
    
    # Count severities
    $criticalCount = ($script:Findings | Where-Object { $_.Severity -eq $SEVERITY_CRITICAL }).Count
    $warningCount = ($script:Findings | Where-Object { $_.Severity -eq $SEVERITY_WARNING }).Count
    $infoCount = ($script:Findings | Where-Object { $_.Severity -eq $SEVERITY_INFO }).Count
    
    # Generate HTML
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $reportPath = "$OutputPath\HackRore_Severity_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>HackRore Severity Report - $env:COMPUTERNAME</title>
    <style>
        body { font-family: Arial; background: #1a1a2e; color: #fff; padding: 20px; margin: 0; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; border-radius: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #fff; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .summary-card { background: #16213e; padding: 20px; border-radius: 8px; flex: 1; text-align: center; }
        .critical { border-left: 4px solid #ff4757; }
        .warning { border-left: 4px solid #ffa502; }
        .info { border-left: 4px solid #2ed573; }
        .count { font-size: 36px; font-weight: bold; }
        .critical .count { color: #ff4757; }
        .warning .count { color: #ffa502; }
        .info .count { color: #2ed573; }
        .findings { background: #16213e; padding: 20px; border-radius: 8px; }
        .finding { padding: 12px; margin: 8px 0; border-radius: 4px; }
        .finding.critical { background: rgba(255,71,87,0.1); border-left: 4px solid #ff4757; }
        .finding.warning { background: rgba(255,165,2,0.1); border-left: 4px solid #ffa502; }
        .finding.info { background: rgba(46,213,115,0.1); border-left: 4px solid #2ed573; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-right: 10px; }
        .badge.critical { background: #ff4757; color: #fff; }
        .badge.warning { background: #ffa502; color: #fff; }
        .badge.info { background: #2ed573; color: #fff; }
        .system-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
        .sys-card { background: #16213e; padding: 15px; border-radius: 8px; }
        .sys-card h3 { margin-top: 0; color: #667eea; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔧 HackRore Severity Report</h1>
        <p>$env:COMPUTERNAME | $timestamp</p>
    </div>
    
    <div class="summary">
        <div class="summary-card critical">
            <div class="count">$criticalCount</div>
            <div>Critical</div>
        </div>
        <div class="summary-card warning">
            <div class="count">$warningCount</div>
            <div>Warnings</div>
        </div>
        <div class="summary-card info">
            <div class="count">$infoCount</div>
            <div>Info</div>
        </div>
    </div>
    
    <div class="findings">
        <h2>📋 Diagnostic Findings</h2>
"@
    
    foreach ($f in $script:Findings) {
        $html += @"
        <div class="finding $($f.Severity.ToLower())">
            <span class="badge $($f.Severity.ToLower())">$($f.Severity)</span>
            <strong>$($f.Category):</strong> $($f.Message)
        </div>
"@
    }
    
    $html += @"
    </div>
    
    <div class="system-info">
        <div class="sys-card">
            <h3>💻 System</h3>
            <p>$($cs.Manufacturer) $($cs.Model)</p>
            <p>Serial: $($bios.SerialNumber)</p>
        </div>
        <div class="sys-card">
            <h3>⚙️ CPU</h3>
            <p>$($cpu.Name)</p>
            <p>Cores: $($cpu.NumberOfCores) | Usage: $($cpu.LoadPercentage)%</p>
        </div>
        <div class="sys-card">
            <h3>🧠 Memory</h3>
            <p>Total: $totalRAM GB</p>
            <p>Used: $usedRAM GB ($ramPercent%)</p>
        </div>
        <div class="sys-card">
            <h3>🪟 Windows</h3>
            <p>$($os.Caption)</p>
            <p>Build: $($os.BuildNumber)</p>
        </div>
    </div>
    
    <p style="text-align: center; margin-top: 30px; color: #666;">
        Generated by HackRore Technician Toolkit v1.0
    </p>
</body>
</html>
"@
    
    $html | Out-File -FilePath $reportPath -Encoding UTF8
    
    Write-Host ""
    Write-Host "Report saved: $reportPath" -ForegroundColor Green
    
    if ($OpenBrowser -or -not $OpenBrowser) {
        Start-Process $reportPath
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host

