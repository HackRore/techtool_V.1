# ⬡ HackRore TechToolkit v2.4
### AI-Powered Hardware Diagnostics for Technicians
**By Ravindra | CyberTechX**

---

## What HackRore Actually Does

```
REAL ARCHITECTURE:

 ┌─────────────────────────┐
 │  HackRore_Master.ps1    │  ← Real scanner (PowerShell + WMI)
 │  Reads actual hardware  │
 └──────────┬──────────────┘
            │ outputs
            ▼
 ┌─────────────────────────┐
 │   Reports/             │
 │   HackRore_YYYYMMDD.json│  ← Real system data
 │   HackRore_YYYYMMDD.html│  ← Standalone report
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
.\HackRore_Master.ps1 -Mode refurb     # Refurbishment verification
.\HackRore_Master.ps1 -Mode quick      # Quick health check only
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

## What Gets Scanned

| Module | What It Reads | WMI / Source |
|--------|--------------|--------------|
| **System Identity** | Manufacturer, model, serial, BIOS, OS | Win32_ComputerSystem, Win32_BIOS |
| **Activation** | Windows license status | SoftwareLicensingProduct |
| **CPU** | Model, cores, speed, load, temperature | Win32_Processor, MSAcpi_ThermalZone |
| **RAM** | Total, per-slot, type, speed, usage | Win32_PhysicalMemory |
| **Storage** | Model, type (NVMe/SATA), size, SMART | Win32_DiskDrive, MSStorageDriver_FailurePredictStatus |
| **Battery** | Wear%, charge cycles, status, wear | Win32_Battery, powercfg /batteryreport |
| **GPU** | Name, VRAM, driver version/date | Win32_VideoController |
| **Network** | Adapters, IP, Bluetooth status | Win32_NetworkAdapter, Get-PnpDevice |
| **Device Manager** | Errors, warnings, disabled devices | Get-PnpDevice |
| **Event Viewer** | Critical/Error/Warning events (7 days) | Get-WinEvent |
| **Startup Programs** | All startup entries + count | Registry HKCU/HKLM Run keys |
| **Windows Updates** | Pending update count | Microsoft.Update.Session COM |

---

## Scoring Engine

The score (0–100%) is calculated automatically:

| Issue | Score Impact |
|-------|-------------|
| CPU temp > 90°C | -20 |
| CPU temp > 80°C | -10 |
| SMART failure predicted | -30 |
| Battery wear > 40% | -15 |
| Battery wear > 25% | -7 |
| Device Manager errors | -5 each |
| Critical Event Log events | -5 each |
| Windows not activated | -20 |
| High startup count (>20) | -5 |
| Many pending updates (>10) | -5 |

**Verdicts:**
- `PASS` → Score ≥ 70, no critical issues
- `CONDITIONAL PASS` → Score ≥ 50, ≤ 1 critical issue
- `FAIL` → Score < 50 or multiple critical issues

---

## For the React Dashboard

Load the real JSON into the dashboard instead of SAMPLE_DATA:

```javascript
// In your React app:
const [reportData, setReportData] = useState(null);

// Load real JSON from file picker or API
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
- PowerShell 5.1 or later (built-in)
- **Administrator rights recommended** for full SMART + thermal data
- Internet connection only needed for AI analysis features

---

## File Structure

```
HackRore/
├── Run_HackRore.ps1        ← Start here (handles admin elevation)
├── HackRore_Master.ps1     ← Main scanning engine
├── Reports/                ← Auto-created, scan reports saved here
│   ├── HackRore_*.json
│   └── HackRore_*.html
└── README.md
```

---

## Troubleshooting

**"Execution policy" error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

**SMART status shows "unavailable":**
Run as Administrator. Some NVMe drives also require vendor-specific drivers.

**Battery module missing:**
Desktop systems have no battery — this is expected.

**CPU temperature is null:**
WMI thermal zones vary by manufacturer. For guaranteed temps, pipe `HWiNFO64 /sensors` output into HackRore.

---

## Roadmap

- [ ] Module 11: Camera / Microphone test (browser-based)
- [ ] Module 12: USB port speed test
- [ ] Module 13: Display dead pixel checker
- [ ] Module 14: Keyboard key test
- [ ] AI-powered fix automation (driver updates, startup cleanup)
- [ ] Portable USB mode (runs without install)
- [ ] React dashboard loads JSON via file picker
- [ ] HackRore Cloud: upload reports for remote technician review

---

*HackRore TechToolkit — built for real technicians, not toy diagnostics.*
