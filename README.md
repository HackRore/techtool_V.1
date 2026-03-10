# HackRore TechToolkit v10.0 - Master Edition

Enterprise-grade hardware diagnostics and system health platform for Windows technicians.

## Overview

HackRore TechToolkit is a comprehensive PowerShell-based diagnostic platform designed for computer technicians of all skill levels - from beginners to advanced professionals. It provides complete system analysis, automated repairs, beautiful HTML reports, and a web-based dashboard.

## Features

### Hardware Diagnostics
- **CPU** - Model, cores, threads, speed, usage, generation detection
- **RAM** - Total, used, free, type, speed, slot configuration
- **Storage** - Physical drives, partitions, SMART status, usage percentage
- **GPU** - Graphics cards, VRAM, driver version
- **Battery** - Health percentage, charge level, cycle count (laptops)
- **Network** - Adapters, IP addresses, internet connectivity

### System Health
- **Health Score** - Weighted percentage (0-100%)
- **Issues Detection** - Critical, Warning, Info severity levels
- **Recommendations** - Actionable fix suggestions

### Automation Tools
- **Disk Cleanup** - Clear temp files, update cache, recycle bin
- **Network Reset** - Flush DNS, reset TCP/IP, repair adapters
- **Windows Repair** - SFC / DISM scans, system file repair

### Output Options
- **Console** - Detailed text output with color coding
- **HTML Report** - Beautiful branded visual report
- **Web Dashboard** - Real-time browser-based diagnostics

## Quick Start

### Run Diagnostics (Console)
```powershell
.\HackRore_Master.ps1 console
```

### Generate HTML Report
```powershell
.\HackRore_Master.ps1 report
```

### Start Web Dashboard
```powershell
.\HackRore_Master.ps1 web
```

### Interactive Menu
```powershell
.\HackRore_Master.ps1
```

## Directory Structure

```
HackRore/
├── HackRore_Master.ps1      # Main entry point
├── modules/                 # Diagnostic modules
│   ├── cpu_diag.ps1        # CPU diagnostics
│   ├── ram_diag.ps1        # RAM diagnostics
│   ├── storage_diag.ps1    # Storage diagnostics
│   ├── gpu_diag.ps1        # GPU diagnostics
│   ├── battery_diag.ps1     # Battery health
│   ├── battery_report.ps1   # Battery wear report
│   ├── network_diag.ps1    # Network diagnostics
│   ├── thermal_diag.ps1    # Temperature monitoring
│   ├── driver_diag.ps1     # Driver & device health
│   ├── usb_diag.ps1        # USB port diagnostics
│   └── startup_diag.ps1    # Boot & startup analysis
├── automation/              # Repair scripts
│   ├── disk_cleanup.ps1
│   ├── network_reset.ps1
│   └── windows_repair.ps1
├── reports/                 # Report generators
│   └── html_report.ps1
├── web/                    # Web dashboard
│   └── diagnostics_api.ps1
└── logs/                   # Log files
    └── hackrore.log
```

## Professional Diagnostics Included

This toolkit includes all professional-grade diagnostics:

1. **CPU Diagnostics** - Model, cores, threads, speed, usage, generation
2. **RAM Diagnostics** - Total, used, free, type, speed, slots
3. **Storage Diagnostics** - SMART health, partitions, usage
4. **GPU Diagnostics** - Graphics cards, VRAM, drivers
5. **Battery Health** - Charge level, health %, cycle count
6. **Battery Wear Report** - Detailed wear analysis using powercfg
7. **Network Diagnostics** - Adapters, IP, connectivity, latency
8. **Thermal Diagnostics** - CPU/GPU temperature monitoring
9. **Driver & Device Health** - PnP devices, missing drivers
10. **USB Diagnostics** - Ports, controllers, connected devices
11. **Startup Analysis** - Boot time, startup programs, scheduled tasks

## Requirements

- Windows 10/11 or Windows Server 2016+
- PowerShell 5.1 or later
- PowerShell 7+ recommended for best experience
- Administrator recommended for full hardware access

## Usage Examples

### Basic System Scan
```powershell
.\HackRore_Master.ps1
# Select option 1 from menu
```

### Generate Report to Custom Location
```powershell
.\HackRore_Master.ps1 report -OutputPath "C:\Reports"
```

### Quick Disk Cleanup
```powershell
.\HackRore_Master.ps1
# Select D from menu, or run:
& ".\automation\disk_cleanup.ps1"
```

### Full Network Reset
```powershell
.\HackRore_Master.ps1
# Select N from menu, or run:
& ".\automation\network_reset.ps1" -Full
```

## Command Line Options

| Option | Description |
|--------|-------------|
| `console` | Run diagnostics, output to console |
| `report` | Generate HTML report |
| `web` | Start web dashboard |
| `fix` | Open quick fixes menu |

## Health Score System

The system calculates a weighted health score based on all components:

| Component | Weight |
|-----------|--------|
| CPU | 20% |
| RAM | 20% |
| Storage | 20% |
| Battery | 15% |
| GPU | 10% |
| Network | 15% |

**Score Interpretation:**
- 80-100%: Healthy
- 60-79%: Fair - Some attention needed
- 40-59%: Warning - Action recommended
- 0-39%: Critical - Immediate attention required

## Version History

- **v10.0** - Master Edition with modular architecture
- **v9.0** - Ultimate Edition with kernel-level diagnostics
- **v8.3** - Enhanced Edition with Bluetooth detection

## Requirements Met

This toolkit follows best practices for technician tools:

1. **Modular Design** - Each diagnostic component is separate
2. **JSON Output** - Structured data for integration
3. **Health Scoring** - At-a-glance system status
4. **Actionable Recommendations** - Clear fix suggestions
5. **Multiple Output Formats** - Console, HTML, Web
6. **Automation Ready** - Can run non-interactively
7. **Error Handling** - Graceful degradation
8. **Logging** - Track all operations

## Author

**Developer:** Ravindra Ahire  
**Brand:** HackRore Diagnostics & Optimizer  
**Version:** 10.0 Master Edition

## License

This tool is provided as-is for diagnostic purposes.

---

*For best results, run as Administrator.*

