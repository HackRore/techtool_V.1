# ⬡ HackRore TechToolkit v2.9
### AI-Powered Hardware Diagnostics for Technicians
**By Ravindra | CyberTechX**

---

## What HackRore Actually Does

```
REAL ARCHITECTURE:

 ┌─────────────────────────┐
 │  HackRore_Master.ps1    │  ← Real scanner (PowerShell + WMI, 17 modules)
 │  Reads actual hardware  │
 └──────────┬──────────────┘
            │ outputs
            ▼
 ┌─────────────────────────┐
 │   Reports/              │
 │   HackRore_YYYYMMDD.json│  ← Full structured system data
 │   HackRore_YYYYMMDD.html│  ← Standalone dark-theme report (no internet)
 └──────────┬──────────────┘
            │ loaded by
            ▼
 ┌─────────────────────────┐
 │  React Dashboard        │  ← Displays + AI analysis
 │  (loads real JSON)      │
 └─────────────────────────┘
```

---

## Quick Start

### Step 1 — Run the scanner (as Administrator)
```powershell
# Right-click PowerShell → Run as Administrator
cd C:\HackRore
.\Run_HackRore.ps1
```

### Step 2 — Full scan modes
```powershell
.\HackRore_Master.ps1                  # Full scan (default)
.\HackRore_Master.ps1 -Mode refurb     # Refurbishment verification + resale certificate
.\HackRore_Master.ps1 -Mode quick      # Quick health check (skips slow modules)
.\HackRore_Master.ps1 -NoHTML          # JSON only, no HTML report
.\HackRore_Master.ps1 -Silent          # No console output
```

### Step 3 — Open the HTML report
The scanner automatically saves reports to:
```
HackRore\Reports\HackRore_20240315_143022.json
HackRore\Reports\HackRore_20240315_143022.html
```
Open the HTML file in any browser — no internet required.

---

## What Gets Scanned (17 Modules)

| # | Module | What It Reads | Source |
|---|--------|--------------|--------|
| 1 | **System Identity** | Manufacturer, model, serial, BIOS version/date, OS build, uptime, domain role, PC type, Windows activation | Win32_ComputerSystem, Win32_BIOS, SoftwareLicensingProduct |
| 2 | **CPU** | Model, cores, threads, max/current speed, L2/L3 cache, load %, temperature (3-method cascade) | Win32_Processor, MSAcpi_ThermalZone, OpenHardwareMonitor, LibreHardwareMonitor |
| 3 | **Memory** | Total GB, available, usage %, per-slot capacity, DDR type, speed, manufacturer, part number | Win32_PhysicalMemory |
| 4 | **Storage + SMART** | Model, type (NVMe/SATA/USB), size, 3-layer SMART (fail prediction + health status + raw attributes: reallocated sectors, POH, power cycles, pending sectors, uncorrectable errors, temp). Volume usage per drive letter. | Win32_DiskDrive, MSStorageDriver_FailurePredictStatus, MSStorageDriver_FailurePredictData, Get-PhysicalDisk |
| 5 | **Battery** | Name, status, charge %, wear %, voltage, estimated runtime, cycle count | Win32_Battery, powercfg /batteryreport (XML) |
| 6 | **GPU** | Name, VRAM (with WMI 32-bit cap warning >= 4095 MB), resolution, refresh rate, driver version/date, error code | Win32_VideoController |
| 7 | **Network** | Active adapters, IPv4, DNS servers, MAC addresses, link speed | Win32_NetworkAdapter, Win32_NetworkAdapterConfiguration |
| 7b | **Bluetooth** | Adapter name/status, BLE support, driver version/date/provider, paired device count (registry), connected devices | Get-PnpDevice, Win32_PnPSignedDriver, Registry |
| 8 | **Device Manager** | All PnP device errors, warnings, disabled devices. 20+ error code to fix suggestion map. Driver version/date per error. | Get-PnpDevice, Win32_PnPSignedDriver |
| 9 | **Event Viewer** | Critical/Error/Warning system events (last 7 days), EventID, source, message preview, known resolution KB links (13 mapped event types) | Get-WinEvent |
| 10 | **Startup + Processes + Updates** | HKCU/HKLM Run keys, Startup folder, Task Scheduler logon tasks. Top 10 processes by RAM and CPU time. Pending Windows Update count with KB IDs and severity. | Registry, Get-ScheduledTask, Get-Process, Microsoft.Update.Session |
| 11 | **Camera** | PnP camera class devices (built-in vs USB), driver version/date, status. Fallback to Win32_PnPEntity imaging class. | Get-PnpDevice, Win32_PnPEntity |
| 12 | **WiFi Signal** | Current SSID, signal %, channel, Tx/Rx rate, auth/cipher, BSSID. Up to 5 nearby networks. WiFi adapter driver version/date. | netsh wlan, Get-PnpDevice |
| 13 | **Display Panel** | EDID decode: panel manufacturer (18-code internal lookup), name, serial, manufacture week/year, connection type (internal/external), resolution, refresh, colour depth | WmiMonitorID (root/wmi) |
| 14 | **Input Devices** | Keyboards (built-in vs USB), mice, touchpads (Synaptics/ELAN/Alps/Precision pattern match), status, type | Get-PnpDevice |
| 15 | **Thermal Throttling** | Uses `% of Maximum Frequency` perf counter — correct real-time indicator. Win32_Processor.CurrentClockSpeed excluded (C-state false positives). All WMI thermal zones logged. | Performance Counter, MSAcpi_ThermalZoneTemperature |
| 16 | **USB Ports** | USB controllers (name, driver, status), USB 2.0 vs 3.x hub counts, connected device list, Thunderbolt/USB4 detection | Win32_USBController, Get-PnpDevice, Win32_PnPEntity |
| 17 | **Benchmarks** | 256 MB random-data sequential disk read/write (defeats SSD compression), PowerShell CPU benchmark, RAM bandwidth. Skipped in quick mode. | File I/O, System.Diagnostics.Stopwatch |

> **Note on NVMe SMART:** Raw attribute parsing (Layer 3) uses MSStorageDriver_FailurePredictData, which is SATA-specific. NVMe drives fall back to Layer 1 (fail prediction) and Layer 2 (Get-PhysicalDisk health). For full NVMe SMART attributes use CrystalDiskInfo.

---

## Scoring Engine

The score (0-100%) is calculated automatically from real scan data:

| Condition | Score Impact | Type |
|-----------|-------------|------|
| CPU temp > 90°C | -20 | Critical |
| CPU temp > 80°C | -10 | Warning |
| SMART failure predicted (any layer) | -30 | Critical |
| SMART reallocated / pending / uncorrectable sectors | -30 | Critical |
| Battery wear > 40% | -15 | Warning |
| Battery wear > 25% | -7 | Warning |
| RAM usage > 90% | -10 | Warning |
| RAM usage > 75% | -5 | Warning |
| Device Manager errors | -5 each | Warning |
| Critical Event Log events (last 7 days) | -5 each | Critical |
| Windows not activated | -20 | Critical |
| Thermal throttling detected (< 60% max freq) | -15 | Critical |
| Disk sequential read < 100 MB/s | -10 | Critical |
| Disk sequential read 100-250 MB/s | -5 | Warning |
| Camera device error | -5 each | Warning |
| WiFi signal < 40% | -5 | Warning |
| Input device error (keyboard/touchpad) | -5 each | Warning |
| USB controller error | -5 each | Warning |
| Bluetooth device error | -5 each | Warning |
| High startup count (> 20 items) | -5 | Warning |
| Many pending updates (> 10) | -5 | Warning |

**Score is clamped to 0-100.**

**Verdicts:**
- `PASS` -> Score >= 70 AND 0 critical issues
- `CONDITIONAL PASS` -> Score >= 50 AND <= 1 critical issue
- `FAIL` -> Score < 50 OR multiple critical issues

**Grades:** `GOOD` >= 85 | `FAIR` >= 65 | `POOR` >= 45 | `CRITICAL` < 45

---

## Refurbishment Mode

```powershell
.\HackRore_Master.ps1 -Mode refurb
```

Runs a full scan and appends a **resale certificate block** to the JSON:
- Technician name, date, machine model, serial
- Verdict, score, grade
- Battery wear % and cycle count
- SMART status summary per disk
- Windows activation status
- All critical issues and warnings
- Plain-language recommendation (`Ready for resale` / `Resale with disclosure` / `Not recommended`)

The HTML report supports `Ctrl+P` / `Cmd+P` for print-ready A4 output (black-on-white print stylesheet built in).

---

## For the React Dashboard

Load the real JSON into the dashboard instead of SAMPLE_DATA:

```javascript
// In your React app:
const [reportData, setReportData] = useState(null);

const loadReport = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => setReportData(JSON.parse(e.target.result));
  reader.readAsText(file);
};
```

Then replace all `SAMPLE_DATA` references with `reportData`.

---

## Requirements

- Windows 10 / 11
- PowerShell 5.1 or later (built-in on all modern Windows)
- **Administrator rights recommended** — required for full SMART data, battery cycle count, WMI thermal zones, Bluetooth registry, and Event Viewer
- Internet connection only needed for AI analysis features in the React dashboard

---

## File Structure

```
HackRore/
├── Run_HackRore.ps1                  <- Start here (handles admin elevation + execution policy)
├── HackRore_Master.ps1               <- Main scanning engine (v2.9, 17 modules)
├── HackRore_Master_v2_4_backup.ps1   <- Rollback backup
├── Reports/                          <- Auto-created on first run
│   ├── HackRore_*.json               <- Full structured data (all 17 modules)
│   └── HackRore_*.html               <- Standalone dark-theme report
└── README.md
```

---

## Troubleshooting

**"Execution policy" error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

**SMART status shows "unavailable":**
Run as Administrator. NVMe drives require CrystalDiskInfo for raw attribute data (MSStorageDriver_FailurePredictData is SATA-only).

**GPU VRAM shows 4095 MB:**
This is a WMI 32-bit field cap — any GPU with 4 GB+ VRAM hits this ceiling. The HTML report flags this automatically. Use GPU-Z or `dxdiag` for the real value.

**Battery module missing:**
Desktop systems have no battery — expected behaviour.

**CPU temperature is null:**
WMI thermal zones vary by manufacturer. Run OpenHardwareMonitor or LibreHardwareMonitor first and HackRore will pick up their WMI namespace automatically on rescan.

**Bluetooth paired devices shows 0:**
Registry read for paired devices requires Administrator. Re-run elevated.

---

## Roadmap

**In Progress / Next:**
- [ ] Web Diagnostics Platform — Vanilla JS PWA + Node.js API backend
- [ ] Browser-based keyboard key test
- [ ] Screen/display test (dead pixels, uniformity)
- [ ] Webcam/microphone live test
- [ ] CPU/RAM stress test
- [ ] Upload PS1 JSON reports to cross-platform web dashboard

**Planned:**
- [ ] React dashboard with JSON file-picker (architecture designed above)
- [ ] NVMe SMART via CrystalDiskInfo pipe integration
- [ ] HackRore Cloud — upload reports for remote technician review
- [ ] AI-powered fix automation (driver updates, startup cleanup)
- [ ] Portable USB mode (runs without install, self-contained)
- [ ] USB port speed test (actual throughput benchmark per port)
- [ ] Display dead pixel checker (browser canvas)

---

*HackRore TechToolkit — built for real technicians, not toy diagnostics.*
