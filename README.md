# HackRore TechToolkit v8.3

Enterprise-grade hardware diagnostics for Windows systems.

## Features

- **System Diagnostics** - Full hardware analysis (CPU, RAM, Storage, GPU, Network)
- **Bluetooth Detection** - Shows Bluetooth status (Detected/Not Found)
- **Battery Health** - For laptops, shows battery health percentage
- **HTML Report Generation** - Beautiful branded reports with colorful headline banner
- **Quick Fixes** - Common troubleshooting tasks
- **Web Dashboard** - Browser-based diagnostics access
- **Linux Support** - Basic Linux diagnostics script

## Quick Start

### Run Diagnostics (Console)
```powershell
.\HackRore_Diagnostics.ps1
```

### Generate HTML Report
```powershell
.\HackRore_Diagnostics.ps1 -ExportReport -OpenReport
```

### Run via Batch
```cmd
run_diag.bat
```

### Web Dashboard
```powershell
.\HackRore_Diagnostics_Web.ps1
```
Then open http://localhost:8080

### Quick Fixes Menu
```powershell
.\HackRore_Toolkit\quick_fixes.ps1
```

## Parameters

| Parameter | Description |
|-----------|-------------|
| `-ExportReport` | Generate HTML report |
| `-OpenReport` | Auto-open report in browser |
| `-NoOpen` | Don't auto-open report |
| `-Silent` | Run without console output |
| `-QuickScan` | Fast diagnostic scan |
| `-FullScan` | Complete system scan |

## Report Output - NEW v8.3!

The HTML report now includes a **colorful headline banner** at the very top:

```
┌─────────────────────────────────────────────────────────────┐
│  Acer Swift SF314-55G | i5-8265U (8th Gen) | 8GB DDR4...  │
│  Windows 11 | Battery: 56% health                         │
│  S/N: UNHBJ0012345678                                     │
└─────────────────────────────────────────────────────────────┘
```

**Headline shows:**
- Device Model (e.g., "Acer Swift 3")
- CPU Generation (e.g., "i5-8265U (8th Gen)")
- RAM Size & Type (e.g., "8GB DDR4")
- Storage Size & Type (e.g., "512GB NVMe")
- OS Version (e.g., "Windows 11")
- Battery Health (for laptops)
- Serial Number

## Detected Devices

| Device | Status Shown |
|--------|--------------|
| System | Manufacturer, Model, Serial |
| CPU | Name, Cores, Speed, Generation |
| RAM | Total, Used, Type, Speed, Slots |
| Storage | Model, Size, Type (SSD/HDD/NVMe) |
| Battery | Charge Level, Health % |
| Bluetooth | Detected/Not Found |
| GPU | Name, VRAM |
| Network | Adapter Name, IP Address |

## Version History

- **v8.3** - Colorful headline banner + Bluetooth detection + OS version in headline
- **v8.2** - Enhanced HTML report with headline summary
- **v8.1** - Fixed script syntax, improved stability
- **v8.0** - Technician Edition with full diagnostics

## Files

```
HackRore_TechToolkit/
├── HackRore_Diagnostics.ps1      # Main diagnostics (v8.3)
├── HackRore_Diagnostics_Web.ps1 # Web dashboard
├── run_diag.bat                  # Quick launcher
├── launch.vbs                   # VBS launcher
├── README.md                    # This file
├── TODO.md                      # Project tasks
└── HackRore_Toolkit/
    ├── quick_fixes.ps1          # Quick fixes menu
    ├── linux_diag.sh            # Linux diagnostics
    └── run_*.bat              # Various launchers
```

## Requirements

- Windows 10/11
- PowerShell 5.1 or later
- Administrator recommended for full hardware access

## Author

**Developer:** Ravindra Ahire  
**Brand:** HackRore Diagnostics & Optimizer

---

*For troubleshooting, run as Administrator.*
