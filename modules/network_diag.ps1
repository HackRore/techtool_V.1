# =============================================================================
# HackRore TechToolkit - Network Diagnostics Module
# Version 1.0
# Detects network adapters, connectivity, and issues
# =============================================================================

function Get-NetworkDiagnostics {
    <#
    .SYNOPSIS
    Performs network diagnostics and returns structured JSON result
    #>
    
    $result = @{
        module = "network"
        status = "unknown"
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        data = @{}
        issues = @()
        recommendations = @()
    }
    
    try {
        $adapters = @()
        $primaryAdapter = $null
        
        # Get physical network adapters
        $nics = Get-CimInstance Win32_NetworkAdapter -ErrorAction SilentlyContinue | Where-Object { $_.PhysicalAdapter -eq $true }
        
        foreach ($nic in $nics) {
            # Get adapter configuration
            $config = Get-CimInstance Win32_NetworkAdapterConfiguration -ErrorAction SilentlyContinue | Where-Object { $_.Index -eq $nic.Index }
            
            $ipAddress = "Not configured"
            $subnetMask = "Not configured"
            $gateway = "Not configured"
            $dnsServers = @()
            $dhcpEnabled = $false
            
            if ($config) {
                if ($config.IPAddress) { $ipAddress = ($config.IPAddress | Where-Object { $_ -match "^\d+\.\d+\.\d+\.\d+$" } | Select-Object -First 1) }
                if ($config.IPSubnet) { $subnetMask = ($config.IPSubnet | Select-Object -First 1) }
                if ($config.DefaultIPGateway) { $gateway = ($config.DefaultIPGateway | Select-Object -First 1) }
                if ($config.DNSServerSearchOrder) { $dnsServers = $config.DNSServerSearchOrder }
                $dhcpEnabled = $config.DHCPEnabled
            }
            
            $speed = "Unknown"
            if ($nic.Speed) {
                $speedMbps = [math]::Round($nic.Speed / 1000000, 0)
                $speed = "${speedMbps} Mbps"
            }
            
            $adapter = @{
                name = $nic.Name
                description = $nic.Description
                macAddress = $nic.MACAddress
                speed = $speed
                status = $nic.NetConnectionStatus
                statusText = switch ($nic.NetConnectionStatus) {
                    0 { "Disconnected" }
                    1 { "Connecting" }
                    2 { "Connected" }
                    3 { "Disconnecting" }
                    4 { "Hardware not present" }
                    5 { "Hardware disabled" }
                    6 { "Hardware malfunction" }
                    default { "Unknown" }
                }
                ipAddress = $ipAddress
                subnetMask = $subnetMask
                gateway = $gateway
                dnsServers = $dnsServers
                dhcpEnabled = $dhcpEnabled
            }
            
            $adapters += $adapter
            
            # Set primary adapter (first connected one)
            if ($nic.NetConnectionStatus -eq 2 -and -not $primaryAdapter) {
                $primaryAdapter = $adapter
            }
        }
        
        # Test internet connectivity
        $internetStatus = "Unknown"
        $latency = 0
        
        try {
            $pingResult = Test-Connection -ComputerName "8.8.8.8" -Count 2 -ErrorAction SilentlyContinue
            if ($pingResult) {
                $internetStatus = "Connected"
                $latency = [math]::Round(($pingResult | Measure-Object -Property ResponseTime -Average).Average, 0)
            }
            else {
                $internetStatus = "No Internet"
            }
        }
        catch {
            $internetStatus = "No Internet"
        }
        
        # Test DNS resolution
        $dnsWorking = $false
        try {
            $dnsResult = Resolve-DnsName -Name "google.com" -ErrorAction SilentlyContinue
            if ($dnsResult) { $dnsWorking = $true }
        }
        catch {}
        
        $result.data = @{
            adapters = $adapters
            primaryAdapter = $primaryAdapter
            internetStatus = $internetStatus
            latency = $latency
            dnsWorking = $dnsWorking
        }
        
        # Analyze issues
        $hasIssues = $false
        
        # Check for disconnected adapter
        $connectedAdapter = $adapters | Where-Object { $_.status -eq 2 }
        if (-not $connectedAdapter -and $adapters.Count -gt 0) {
            $result.status = "warning"
            $hasIssues = $true
            $result.issues += @{
                severity = "warning"
                message = "No network adapter is connected"
            }
            $result.recommendations += "Check network cable or Wi-Fi connection"
        }
        
        # Check for no internet
        if ($internetStatus -eq "No Internet") {
            $result.status = "warning"
            $hasIssues = $true
            $result.issues += @{
                severity = "warning"
                message = "No internet connectivity"
            }
            $result.recommendations += "Check router/modem and internet service"
        }
        
        # Check for high latency
        if ($latency -gt 200 -and $latency -gt 0) {
            $result.issues += @{
                severity = "info"
                message = "High network latency: ${latency}ms"
            }
            $result.recommendations += "Consider checking network congestion or ISP issues"
            $hasIssues = $true
        }
        
        # Check for DNS issues
        if (-not $dnsWorking -and $internetStatus -eq "Connected") {
            $result.issues += @{
                severity = "warning"
                message = "DNS resolution not working"
            }
            $result.recommendations += "Try flushing DNS: ipconfig /flushdns"
            $hasIssues = $true
        }
        
        # Check for no adapters
        if ($adapters.Count -eq 0) {
            $result.status = "warning"
            $result.issues += @{
                severity = "warning"
                message = "No network adapters detected"
            }
            $result.recommendations += "Install network drivers"
            $hasIssues = $true
        }
        
        if (-not $hasIssues) {
            $result.status = "ok"
        }
        
    }
    catch {
        $result.status = "error"
        $result.issues += @{
            severity = "error"
            message = "Error during network diagnostics: $_"
        }
    }
    
    return $result | ConvertTo-Json -Depth 5
}

Export-ModuleMember -Function Get-NetworkDiagnostics

