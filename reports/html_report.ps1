# =============================================================================
# HackRore TechToolkit - HTML Report Generator
# Version 1.0
# Generates beautiful branded HTML diagnostic reports
# =============================================================================

param(
    [Parameter(Mandatory=$true)]
    [hashtable]$Results,
    [string]$OutputPath = "$env:USERPROFILE\Desktop\HackRore_Report.html"
)

function Get-ColorForStatus {
    param([string]$Status)
    switch ($Status) {
        "ok" { return "#22c55e" }
        "warning" { return "#f59e0b" }
        "critical" { return "#ef4444" }
        "error" { return "#ef4444" }
        default { return "#6b7280" }
    }
}

function Get-HealthScoreColor {
    param([int]$Score)
    if ($Score -gt 80) { return "#22c55e" }
    elseif ($Score -gt 60) { return "#f59e0b" }
    else { return "#ef4444" }
}

function Get-HealthBadge {
    param([int]$Score)
    if ($Score -gt 80) { return "Healthy" }
    elseif ($Score -gt 60) { return "Fair" }
    else { return "Needs Attention" }
}

# Extract data
$comp = $Results.computer
$diag = $Results.diagnostics
$timestamp = $Results.timestamp

# Build CPU section
$cpu = $diag.cpu
$cpuHtml = ""
if ($cpu -and $cpu.data) {
    $cpuData = $cpu.data
    $cpuColor = Get-ColorForStatus $cpu.status
    $cpuHtml = @"
    <div class="card">
        <div class="card-header">
            <span class="card-title">Processor (CPU)</span>
            <span class="status-badge" style="background: $cpuColor">$($cpu.status.ToUpper())</span>
        </div>
        <div class="metric-large">
            <div class="metric-value">$($cpuData.loadPercent)%</div>
            <div class="metric-label">CPU Usage</div>
        </div>
        <div class="bar-container">
            <div class="bar-fill" style="width: $($cpuData.loadPercent)%; background: $cpuColor"></div>
        </div>
        <div class="detail-grid">
            <div class="detail-item">
                <div class="detail-label">Processor</div>
                <div class="detail-value">$($cpuData.name)</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Cores / Threads</div>
                <div class="detail-value">$($cpuData.cores) / $($cpuData.threads)</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Speed</div>
                <div class="detail-value">$($cpuData.speedGHz) GHz</div>
            </div>
        </div>
    </div>
"@
}

# Build RAM section
$ram = $diag.ram
$ramHtml = ""
if ($ram -and $ram.data) {
    $ramData = $ram.data
    $ramColor = Get-ColorForStatus $ram.status
    $ramHtml = @"
    <div class="card">
        <div class="card-header">
            <span class="card-title">Memory (RAM)</span>
            <span class="status-badge" style="background: $ramColor">$($ram.status.ToUpper())</span>
        </div>
        <div class="metric-large">
            <div class="metric-value">$($ramData.usagePercent)%</div>
            <div class="metric-label">Memory Used</div>
        </div>
        <div class="bar-container">
            <div class="bar-fill" style="width: $($ramData.usagePercent)%; background: $ramColor"></div>
        </div>
        <div class="detail-grid">
            <div class="detail-item">
                <div class="detail-label">Used / Total</div>
                <div class="detail-value">$($ramData.usedGB) GB / $($ramData.totalGB) GB</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Type / Speed</div>
                <div class="detail-value">$($ramData.type) $($ramData.speedMHz) MHz</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Slots Used</div>
                <div class="detail-value">$($ramData.slotsUsed) of 4</div>
            </div>
        </div>
    </div>
"@
}

# Build Storage section
$storage = $diag.storage
$storageHtml = ""
if ($storage -and $storage.data) {
    $storageData = $storage.data
    $storageColor = Get-ColorForStatus $storage.status
    
    $partitionsHtml = ""
    foreach ($part in $storageData.partitions) {
        $partColor = Get-ColorForStatus $storage.status
        if ($part.usagePercent -gt 90) { $partColor = "#ef4444" }
        elseif ($part.usagePercent -gt 80) { $partColor = "#f59e0b" }
        
        $partitionsHtml += @"
        <div class="disk-item">
            <div class="disk-header">
                <span>$($part.drive) $($part.volumeName)</span>
                <span style="color: $partColor">$($part.usagePercent)%</span>
            </div>
            <div class="bar-container small">
                <div class="bar-fill" style="width: $($part.usagePercent)%; background: $partColor"></div>
            </div>
            <div class="disk-details">
                <span>Used: $($part.usedGB) GB</span>
                <span>Free: $($part.freeGB) GB</span>
            </div>
        </div>
"@
    }
    
    $drivesHtml = ""
    foreach ($drive in $storageData.physicalDrives) {
        $drivesHtml += @"
        <div class="detail-item">
            <div class="detail-label">$($drive.model)</div>
            <div class="detail-value">$($drive.sizeGB) GB $($drive.formFactor)</div>
        </div>
"@
    }
    
    $storageHtml = @"
    <div class="card">
        <div class="card-header">
            <span class="card-title">Storage</span>
            <span class="status-badge" style="background: $storageColor">$($storage.status.ToUpper())</span>
        </div>
        $drivesHtml
        <div class="section-divider"></div>
        <div class="card-title">Disk Usage</div>
        $partitionsHtml
    </div>
"@
}

# Build Battery section
$battery = $diag.battery
$batteryHtml = ""
if ($battery -and $battery.data -and $battery.data.present) {
    $batData = $battery.data
    $batColor = Get-ColorForStatus $battery.status
    $batteryHtml = @"
    <div class="card">
        <div class="card-header">
            <span class="card-title">Battery</span>
            <span class="status-badge" style="background: $batColor">$($battery.status.ToUpper())</span>
        </div>
        <div class="metric-large">
            <div class="metric-value">$($batData.chargeLevel)%</div>
            <div class="metric-label">Charge Level</div>
        </div>
        <div class="bar-container">
            <div class="bar-fill" style="width: $($batData.chargeLevel)%; background: $batColor"></div>
        </div>
        <div class="detail-grid">
            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">$($batData.status)</div>
            </div>
"@
    if ($batData.healthPercent -gt 0) {
        $batteryHtml += @"
            <div class="detail-item">
                <div class="detail-label">Health</div>
                <div class="detail-value">$($batData.healthPercent)%</div>
            </div>
"@
    }
    if ($batData.cycleCount -gt 0) {
        $batteryHtml += @"
            <div class="detail-item">
                <div class="detail-label">Cycle Count</div>
                <div class="detail-value">$($batData.cycleCount)</div>
            </div>
"@
    }
    $batteryHtml += @"
        </div>
    </div>
"@
}

# Build GPU section
$gpu = $diag.gpu
$gpuHtml = ""
if ($gpu -and $gpu.data -and $gpu.data.gpuCount -gt 0) {
    $gpuData = $gpu.data
    $gpuColor = Get-ColorForStatus $gpu.status
    
    $gpusList = ""
    foreach ($g in $gpuData.gpus) {
        $gpusList += @"
        <div class="detail-item">
            <div class="detail-label">$($g.name)</div>
            <div class="detail-value">$($g.vramDisplay) | Driver: $($g.driverVersion)</div>
        </div>
"@
    }
    
    $gpuHtml = @"
    <div class="card">
        <div class="card-header">
            <span class="card-title">Graphics</span>
            <span class="status-badge" style="background: $gpuColor">$($gpu.status.ToUpper())</span>
        </div>
        $gpusList
    </div>
"@
}

# Build Network section
$network = $diag.network
$netHtml = ""
if ($network -and $network.data) {
    $netData = $network.data
    $netColor = Get-ColorForStatus $network.status
    
    $adaptersHtml = ""
    foreach ($adapter in $netData.adapters) {
        $adaptersHtml += @"
        <div class="detail-item">
            <div class="detail-label">$($adapter.name)</div>
            <div class="detail-value">$($adapter.macAddress) | $($adapter.speed)</div>
        </div>
"@
    }
    
    $netHtml = @"
    <div class="card">
        <div class="card-header">
            <span class="card-title">Network</span>
            <span class="status-badge" style="background: $netColor">$($network.status.ToUpper())</span>
        </div>
        $adaptersHtml
        <div class="detail-item">
            <div class="detail-label">Internet</div>
            <div class="detail-value">$($netData.internetStatus)</div>
        </div>
    </div>
"@
}

# Build Issues section
$issuesHtml = ""
if ($Results.issues -and $Results.issues.Count -gt 0) {
    $issuesList = ""
    foreach ($issue in $Results.issues) {
        $issueColor = switch ($issue.severity) { "critical" { "#ef4444" } "warning" { "#f59e0b" } default { "#3b82f6" } }
        $issuesList += @"
        <div class="issue-item $($issue.severity)">
            <span class="issue-badge" style="background: $issueColor">$($issue.severity.ToUpper())</span>
            <span class="issue-message">$($issue.message)</span>
        </div>
"@
    }
    
    $issuesHtml = @"
    <div class="card full-width">
        <div class="card-title">Issues & Alerts ($($Results.issues.Count))</div>
        $issuesList
    </div>
"@
}

# Build Recommendations section
$recsHtml = ""
if ($Results.recommendations -and $Results.recommendations.Count -gt 0) {
    $recsList = ""
    $recCount = 1
    foreach ($rec in $Results.recommendations | Select-Object -First 5) {
        $recsList += @"
        <div class="rec-item">
            <span class="rec-number">$recCount</span>
            <span class="rec-text">$rec</span>
        </div>
"@
        $recCount++
    }
    
    $recsHtml = @"
    <div class="card full-width">
        <div class="card-title">Recommendations</div>
        $recsList
    </div>
"@
}

# Generate the complete HTML
$healthColor = Get-HealthScoreColor -Score $Results.healthScore
$healthBadge = Get-HealthBadge -Score $Results.healthScore

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HackRore Diagnostics Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
            background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
            min-height: 100vh;
            padding: 20px;
            color: #e2e8f0;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        
        /* Header Banner */
        .header-banner {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .brand { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; }
        .title { font-size: 32px; font-weight: 700; margin: 8px 0; }
        .headline { font-size: 18px; opacity: 0.9; }
        .headline-row { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 8px; }
        .serial { font-family: monospace; background: rgba(0,0,0,0.2); padding: 4px 12px; border-radius: 4px; font-size: 13px; }
        
        /* Health Score */
        .health-section {
            background: #1e293b;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
        }
        .health-score {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .score-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: 700;
            border: 4px solid $healthColor;
            color: $healthColor;
        }
        .score-info h2 { font-size: 24px; margin-bottom: 4px; }
        .score-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            background: $healthColor;
            color: white;
            font-size: 12px;
            font-weight: 600;
        }
        .system-meta {
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
        }
        .meta-item { text-align: center; }
        .meta-value { font-size: 18px; font-weight: 600; }
        .meta-label { font-size: 12px; opacity: 0.6; }
        
        /* Cards Grid */
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }
        .card {
            background: #1e293b;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .card.full-width { grid-column: 1 / -1; }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        .card-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            margin-bottom: 12px;
        }
        .card-header .card-title { margin-bottom: 0; }
        .status-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            color: white;
        }
        
        /* Metrics */
        .metric-large {
            text-align: center;
            padding: 16px 0;
        }
        .metric-value { font-size: 48px; font-weight: 700; }
        .metric-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
        
        /* Bar */
        .bar-container { margin: 12px 0; }
        .bar-container.small { margin: 8px 0; }
        .bar-fill {
            height: 12px;
            border-radius: 6px;
            transition: width 0.5s ease;
        }
        .bar-container.small .bar-fill { height: 6px; }
        
        /* Details */
        .detail-grid { display: grid; gap: 12px; margin-top: 16px; }
        .detail-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .detail-label { color: #94a3b8; font-size: 13px; }
        .detail-value { font-weight: 500; font-size: 13px; text-align: right; max-width: 60%; word-break: break-word; }
        
        /* Disk */
        .disk-item { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .disk-item:last-child { border-bottom: none; }
        .disk-header { display: flex; justify-content: space-between; font-weight: 500; margin-bottom: 8px; }
        .disk-details { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }
        
        /* Issues */
        .issue-item { 
            display: flex; 
            align-items: center; 
            gap: 12px; 
            padding: 12px; 
            margin: 8px 0; 
            border-radius: 8px;
            background: rgba(255,255,255,0.03);
        }
        .issue-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: white; }
        .issue-message { flex: 1; }
        
        /* Recommendations */
        .rec-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .rec-number { 
            width: 24px; height: 24px; 
            background: #06b6d4; 
            border-radius: 50%; 
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 600; flex-shrink: 0;
        }
        .rec-text { line-height: 1.5; }
        
        /* Footer */
        .footer {
            text-align: center;
            padding: 30px;
            color: #64748b;
            font-size: 13px;
        }
        .section-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 16px 0; }
        
        @media print {
            body { background: white; color: black; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; }
            .header-banner { background: #0f172a; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header-banner">
            <div class="brand">HackRore TechToolkit</div>
            <h1 class="title">Diagnostic Report</h1>
            <div class="headline">$($comp.manufacturer) $($comp.model)</div>
            <div class="headline-row">
                <span class="serial">S/N: $($comp.serial)</span>
                <span>$($comp.formFactor)</span>
                <span>$($comp.os)</span>
            </div>
        </div>
        
        <!-- Health Score -->
        <div class="health-section">
            <div class="health-score">
                <div class="score-circle">$($Results.healthScore)%</div>
                <div class="score-info">
                    <h2>System Health</h2>
                    <span class="score-badge">$healthBadge</span>
                </div>
            </div>
            <div class="system-meta">
                <div class="meta-item">
                    <div class="meta-value">$($comp.uptime -replace '\..*', ' days')</div>
                    <div class="meta-label">Uptime</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">$($Results.issues.Count)</div>
                    <div class="meta-label">Issues</div>
                </div>
                <div class="meta-item">
                    <div class="meta-value">$($Results.recommendations.Count)</div>
                    <div class="meta-label">Recommendations</div>
                </div>
            </div>
        </div>
        
        <!-- Diagnostics Grid -->
        <div class="grid">
            $cpuHtml
            $ramHtml
            $storageHtml
            $batteryHtml
            $gpuHtml
            $netHtml
        </div>
        
        <!-- Issues & Recommendations -->
        $issuesHtml
        $recsHtml
        
        <!-- Footer -->
        <div class="footer">
            <p>HackRore TechToolkit v$($Results.version) | Generated: $timestamp</p>
            <p>For technical support, visit: hackrore.com</p>
        </div>
    </div>
</body>
</html>
"@

# Save the report
$html | Out-File -FilePath $OutputPath -Encoding UTF8

Write-Host "Report saved to: $OutputPath" -ForegroundColor Green
return $OutputPath

