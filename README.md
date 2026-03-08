# HackRore TechToolkit

A professional enterprise-grade hardware diagnostics and system optimization toolkit for Windows PCs and laptops.

## Features

- **System Diagnostics** - Comprehensive hardware analysis
- **HTML Report Generation** - Beautiful diagnostic reports
- **Web Dashboard** - Browser-based diagnostics interface
- **Quick Fixes** - Common system issues remediation
- **Linux Support** - Cross-platform diagnostics script
- **Severity Analysis** - Priority-based issue identification

## Files

| File | Description |
|------|-------------|
| `HackRore_Diagnostics.ps1` | Main diagnostics script (v8.0 Technician Edition) |
| `HackRore_Diagnostics_Web.ps1` | Web-based dashboard |
| `HackRore_Toolkit/` | Additional toolkit modules |

## Quick Start

### Run Diagnostics
```powershell
.\HackRore_Diagnostics.ps1
```

### Run with HTML Report
```powershell
.\HackRore_Diagnostics.ps1 -ExportReport -OpenReport
```

### Run Web Dashboard
```powershell
.\HackRore_Diagnostics_Web.ps1
# Open http://localhost:8080
```

### Run from Double-Click
Just double-click `HackRore_Diagnostics.ps1` - it will auto-generate and open an HTML report.

## Requirements

- Windows 10/11
- PowerShell 5.1+
- Administrator recommended (for full diagnostics)

## Usage Options

| Parameter | Description |
|-----------|-------------|
| `-ExportReport` | Generate HTML report |
| `-OpenReport` | Auto-open report in browser |
| `-QuickScan` | Fast diagnostic scan |
| `-FullScan` | Complete system scan |
| `-Silent` | Run without console output |
| `-CompareScans` | Compare with previous baseline |

## Project Structure

```
HackRore_TechToolkit/
├── HackRore_Diagnostics.ps1       # Main script (v8.0)
├── HackRore_Diagnostics_Web.ps1  # Web dashboard
├── README.md                       # This file
├── run_diag.bat                    # Quick launcher
├── launch.vbs                      # VB launcher
└── HackRore_Toolkit/
    ├── README.md
    ├── quick_fixes.ps1            # Quick fixes
    ├── linux_diag.sh              # Linux diagnostics
    ├── run_toolkit.bat
    ├── run_quick.bat
    ├── run_fixes.bat
    └── run_web.bat
```

## Version

**Current Version: 8.0 (Technician Edition)**

## License

MIT License - Created by Ravindra Ahire

## Author

**HackRore** - Enterprise Hardware Diagnostics & Optimizer

