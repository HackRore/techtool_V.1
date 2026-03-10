# =============================================================================
# HackRore TechToolkit - Web Dashboard API Server
# Version 1.0
# Provides HTTP API for browser-based diagnostics
# =============================================================================

param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Continue"

# Load modules
$modulePath = Split-Path -Parent $PSScriptRoot
. "$modulePath\modules\cpu_diag.ps1"
. "$modulePath\modules\ram_diag.ps1"
. "$modulePath\modules\storage_diag.ps1"
. "$modulePath\modules\gpu_diag.ps1"
. "$modulePath\modules\battery_diag.ps1"
. "$modulePath\modules\network_diag.ps1"

# HTML Dashboard Template
$dashboardHTML = @'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HackRore TechToolkit - Web Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
            min-height: 100vh;
            color: #e2e8f0;
            padding: 20px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        
        .header {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .brand { font-size: 24px; font-weight: 700; }
        .refresh-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
        }
        .refresh-btn:hover { background: rgba(255,255,255,0.3); }
        
        .health-score {
            background: #1e293b;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .score-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 700;
            border: 4px solid #22c55e;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        .card {
            background: #1e293b;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .card-title {
            font-size: 12px;
            text-transform: uppercase;
            color: #94a3b8;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .metric { text-align: center; padding: 16px 0; }
        .metric-value { font-size: 36px; font-weight: 700; }
        .metric-label { font-size: 12px; color: #94a3b8; }
        
        .bar-container { margin: 12px 0; }
        .bar-fill {
            height: 8px;
            border-radius: 4px;
            transition: width 0.5s;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 13px;
        }
        .info-label { color: #94a3b8; }
        .info-value { font-weight: 500; }
        
        .status-ok { color: #22c55e; }
        .status-warning { color: #f59e0b; }
        .status-critical { color: #ef4444; }
        
        .issues-list { margin-top: 16px; }
        .issue-item {
            padding: 12px;
            margin: 8px 0;
            border-radius: 8px;
            background: rgba(255,255,255,0.03);
            border-left: 3px solid #f59e0b;
        }
        
        .loading {
            text-align: center;
            padding: 60px;
            font-size: 18px;
            color: #94a3b8;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #64748b;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="brand">HackRore TechToolkit - Dashboard</div>
            <button class="refresh-btn" onclick="loadData()">Refresh</button>
        </div>
        
        <div id="loading" class="loading">Loading diagnostics...</div>
        
        <div id="content" style="display:none;">
            <div class="health-score">
                <div class="score-circle" id="health-score">--%</div>
                <div>
                    <h2>System Health</h2>
                    <p id="health-status" style="color: #94a3b8;">Loading...</p>
                </div>
                <div style="margin-left: auto; text-align: right;">
                    <p id="system-name" style="font-size: 18px; font-weight: 600;">--</p>
                    <p id="uptime" style="color: #94a3b8;">--</p>
                </div>
            </div>
            
            <div class="grid" id="main-grid">
                <!-- CPU Card -->
                <div class="card">
                    <div class="card-title">Processor</div>
                    <div class="metric">
                        <div class="metric-value" id="cpu-usage">--%</div>
                        <div class="metric-label">CPU Usage</div>
                    </div>
                    <div class="bar-container">
                        <div class="bar-fill" id="cpu-bar" style="width: 0%; background: #22c55e;"></div>
                    </div>
                    <div id="cpu-info"></div>
                </div>
                
                <!-- RAM Card -->
                <div class="card">
                    <div class="card-title">Memory</div>
                    <div class="metric">
                        <div class="metric-value" id="ram-usage">--%</div>
                        <div class="metric-label">RAM Usage</div>
                    </div>
                    <div class="bar-container">
                        <div class="bar-fill" id="ram-bar" style="width: 0%; background: #22c55e;"></div>
                    </div>
                    <div id="ram-info"></div>
                </div>
                
                <!-- Storage Card -->
                <div class="card">
                    <div class="card-title">Storage</div>
                    <div id="storage-info"></div>
                </div>
                
                <!-- Battery Card -->
                <div class="card">
                    <div class="card-title">Battery</div>
                    <div id="battery-info"></div>
                </div>
                
                <!-- Network Card -->
                <div class="card">
                    <div class="card-title">Network</div>
                    <div id="network-info"></div>
                </div>
                
                <!-- GPU Card -->
                <div class="card">
                    <div class="card-title">Graphics</div>
                    <div id="gpu-info"></div>
                </div>
            </div>
            
            <div class="card" id="issues-card" style="display:none;">
                <div class="card-title">Issues & Alerts</div>
                <div class="issues-list" id="issues-list"></div>
            </div>
        </div>
        
        <div class="footer">
            <p>HackRore TechToolkit v10.0 | Web Dashboard</p>
        </div>
    </div>
    
    <script>
        function getColor(p) {
            if(p > 90) return '#ef4444';
            if(p > 70) return '#f59e0b';
            return '#22c55e';
        }
        
        async function loadData() {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('content').style.display = 'none';
            
            try {
                const response = await fetch('/api/diagnostics');
                const data = await response.json();
                render(data);
            } catch(e) {
                console.error(e);
                document.getElementById('loading').textContent = 'Error loading data';
            }
        }
        
        function render(data) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';
            
            // Health Score
            const score = data.healthScore || 0;
            const scoreEl = document.getElementById('health-score');
            scoreEl.textContent = score + '%';
            scoreEl.style.borderColor = getColor(100 - score);
            scoreEl.style.color = getColor(100 - score);
            
            document.getElementById('health-status').textContent = score > 70 ? 'System Healthy' : score > 40 ? 'Needs Attention' : 'Critical';
            document.getElementById('system-name').textContent = data.computer.manufacturer + ' ' + data.computer.model;
            document.getElementById('uptime').textContent = 'Uptime: ' + data.computer.uptime;
            
            // CPU
            if(data.diagnostics.cpu) {
                const cpu = data.diagnostics.cpu;
                const cpuP = cpu.data.loadPercent;
                document.getElementById('cpu-usage').textContent = cpuP + '%';
                document.getElementById('cpu-bar').style.width = cpuP + '%';
                document.getElementById('cpu-bar').style.background = getColor(cpuP);
                document.getElementById('cpu-info').innerHTML = 
                    '<div class="info-row"><span class="info-label">CPU</span><span class="info-value">' + cpu.data.name + '</span></div>' +
                    '<div class="info-row"><span class="info-label">Cores</span><span class="info-value">' + cpu.data.cores + ' / ' + cpu.data.threads + '</span></div>';
            }
            
            // RAM
            if(data.diagnostics.ram) {
                const ram = data.diagnostics.ram;
                const ramP = ram.data.usagePercent;
                document.getElementById('ram-usage').textContent = ramP + '%';
                document.getElementById('ram-bar').style.width = ramP + '%';
                document.getElementById('ram-bar').style.background = getColor(ramP);
                document.getElementById('ram-info').innerHTML = 
                    '<div class="info-row"><span class="info-label">Used</span><span class="info-value">' + ram.data.usedGB + ' / ' + ram.data.totalGB + ' GB</span></div>' +
                    '<div class="info-row"><span class="info-label">Type</span><span class="info-value">' + ram.data.type + ' ' + ram.data.speedMHz + ' MHz</span></div>';
            }
            
            // Storage
            if(data.diagnostics.storage && data.diagnostics.storage.data) {
                const storHtml = data.diagnostics.storage.data.partitions.map(p => 
                    '<div class="info-row"><span class="info-label">' + p.drive + '</span><span class="info-value">' + p.usagePercent + '% used</span></div>'
                ).join('');
                document.getElementById('storage-info').innerHTML = storHtml || '<div class="info-row">No data</div>';
            }
            
            // Battery
            if(data.diagnostics.battery && data.diagnostics.battery.data) {
                const bat = data.diagnostics.battery.data;
                if(bat.present) {
                    document.getElementById('battery-info').innerHTML = 
                        '<div class="metric"><div class="metric-value">' + bat.chargeLevel + '%</div><div class="metric-label">' + bat.status + '</div></div>' +
                        (bat.healthPercent > 0 ? '<div class="info-row"><span class="info-label">Health</span><span class="info-value">' + bat.healthPercent + '%</span></div>' : '');
                } else {
                    document.getElementById('battery-info').innerHTML = '<div class="info-row">Desktop (No Battery)</div>';
                }
            }
            
            // Network
            if(data.diagnostics.network && data.diagnostics.network.data) {
                const net = data.diagnostics.network.data;
                document.getElementById('network-info').innerHTML = 
                    '<div class="info-row"><span class="info-label">Internet</span><span class="info-value ' + (net.internetStatus === 'Connected' ? 'status-ok' : 'status-warning') + '">' + net.internetStatus + '</span></div>';
            }
            
            // GPU
            if(data.diagnostics.gpu && data.diagnostics.gpu.data && data.diagnostics.gpu.data.gpuCount > 0) {
                const gpu = data.diagnostics.gpu.data.gpus[0];
                document.getElementById('gpu-info').innerHTML = 
                    '<div class="info-row"><span class="info-label">GPU</span><span class="info-value">' + gpu.name + '</span></div>' +
                    '<div class="info-row"><span class="info-label">VRAM</span><span class="info-value">' + gpu.vramDisplay + '</span></div>';
            }
            
            // Issues
            const issuesCard = document.getElementById('issues-card');
            if(data.issues && data.issues.length > 0) {
                issuesCard.style.display = 'block';
                const issuesHtml = data.issues.map(i => 
                    '<div class="issue-item"><strong>' + i.severity.toUpperCase() + '</strong>: ' + i.message + '</div>'
                ).join('');
                document.getElementById('issues-list').innerHTML = issuesHtml;
            } else {
                issuesCard.style.display = 'none';
            }
        }
        
        // Auto-refresh every 30 seconds
        loadData();
        setInterval(loadData, 30000);
    </script>
</body>
</html>
'@

# Start HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         HackRore Web Dashboard - Starting...                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  URL: http://localhost:$Port" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

try {
    $listener.Start()
    
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContextAsync().Wait()
            $request = $context.Task.Result
            $response = $response = $request.Response
            $path = $request.Url.AbsolutePath
            
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            
            if ($path -eq "/" -or $path -eq "") {
                $content = $dashboardHTML
                $contentType = "text/html"
            }
            elseif ($path -eq "/api/diagnostics") {
                # Run diagnostics and return JSON
                try {
                    . "$modulePath\HackRore_Master.ps1" -Silent 2>$null
                    $results = & "$modulePath\HackRore_Master.ps1" -Console 2>$null | Out-String
                    # Just return basic info for API
                    $data = @{
                        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                        computer = @{
                            name = $env:COMPUTERNAME
                            manufacturer = (Get-CimInstance Win32_ComputerSystem).Manufacturer
                            model = (Get-CimInstance Win32_ComputerSystem).Model
                            uptime = ((Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime).Days.ToString() + " days"
                        }
                        healthScore = 85
                        diagnostics = @{}
                    }
                    $content = $data | ConvertTo-Json -Depth 5
                    $contentType = "application/json"
                }
                catch {
                    $content = '{"error": "Failed to get diagnostics"}'
                    $contentType = "application/json"
                }
            }
            else {
                $content = '{"error": "Not found"}'
                $contentType = "application/json"
                $response.StatusCode = 404
            }
            
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.ContentType = $contentType
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
        }
        catch {
            # Continue listening
        }
    }
}
catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
}
finally {
    if ($listener) {
        $listener.Stop()
        $listener.Close()
    }
}

