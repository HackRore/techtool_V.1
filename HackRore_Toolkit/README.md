# 🔧 HackRore Technician Toolkit v1.0

A comprehensive diagnostic and automation toolkit for Hardware and Software Technicians.

## 🚀 Quick Start

| Option | Action | Description |
|--------|--------|-------------|
| **Full Diagnostics** | `run_toolkit.bat` | Complete system diagnostic with HTML report |
| **Web Dashboard** | `run_web.bat` | Browser-based diagnostics (port 8080) |
| **Quick Scan** | `run_quick.bat` | Fast system overview |
| **Severity Report** | `run_severity.bat` | Classified findings (Info/Warning/Critical) |
| **Quick Fixes** | `run_fixes.bat` | Automation scripts for common tasks |

## 📦 What's Included

### 🖥️ Hardware Diagnostics
- CPU Analysis (usage, cores, generation, tier)
- Memory (RAM type, speed, slots)
- Storage (SSD/HDD/NVMe detection, SMART health)
- Battery Health (charge, wear, cycle count)
- GPU Information (VRAM, drivers)

### 💻 Software Diagnostics  
- Installed Programs Inventory
- Windows Activation Status
- Services Status
- Event Log Errors (7-day history)

### 🌐 Network Tools
- Network Adapters & IPs
- MAC Addresses
- DHCP Status

### ⚡ Quick Fixes (Automation)
- Clear Temp Files
- Reset Network Stack
- Restart Windows Services
- Check Disk Health

### 📊 Reports
- Professional HTML Reports
- Severity Classification (Info/Warning/Critical)
- Auto-open in browser

### 🐧 Cross-Platform
- Linux Diagnostics Script (Bash)

## 🎯 Severity Levels

| Level | Color | Meaning |
|-------|-------|---------|
| **INFO** | 🟢 Green | Normal operation |
| **WARNING** | 🟡 Yellow | Needs attention |
| **CRITICAL** | 🔴 Red | Urgent action required |

## 📂 Project Structure

```
HackRore_Toolkit/
├── run_toolkit.bat           # Main launcher - Full diagnostics
├── run_web.bat               # Web dashboard
├── run_quick.bat             # Quick scan
├── run_severity.bat          # Severity-classified report
├── run_fixes.bat             # Quick fixes menu
├── HackRore_Severity_Diag.ps1 # Severity diagnostic script
├── quick_fixes.ps1           # Automation scripts
├── linux_diag.sh             # Linux module
└── README.md                 # This file
```

## 🚦 How to Use

1. **Double-click any `.bat` file** to run
2. **Reports are saved to Desktop** automatically
3. **HTML reports open in browser**

## 💻 Command Line Options

Many scripts support parameters:
```powershell
.\HackRore_Severity_Diag.ps1 -OutputPath "C:\Reports" -OpenBrowser
```

## 🐧 Linux Support

Run the Linux diagnostic script:
```bash
chmod +x linux_diag.sh
./linux_diag.sh
```

## 👨‍💻 Developer

**Ravindra Ahire** - Hardware & Software Technician

---

*Built for technicians, by technicians* 🔧


