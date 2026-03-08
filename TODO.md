# HackRore TechToolkit - Project TODO

## Completed Tasks

- [x] Delete unnecessary HTML preview files
- [x] Delete unknown/empty file (HackRore_D)
- [x] Delete duplicate PowerShell scripts (keep v8.3)
- [x] Fix TODO.md
- [x] Consolidate batch files into minimal set
- [x] Create README.md for main project
- [x] Add Bluetooth detection
- [x] Add colorful headline banner in HTML report
- [x] Add OS version to headline
- [x] Add Battery health to headline (for laptops)

---

## Project Structure (Clean)

```
HackRore_TechToolkit/
├── HackRore_Diagnostics.ps1      # Main diagnostics script (v8.3)
├── HackRore_Diagnostics_Web.ps1  # Web-based diagnostics
├── README.md                      # Main documentation
├── launch.vbs                     # Launcher script
├── run_diag.bat                   # Run diagnostics
├── TODO.md                        # This file
└── HackRore_Toolkit/
    ├── README.md
    ├── quick_fixes.ps1            # Quick fixes module
    ├── linux_diag.sh              # Linux diagnostics
    ├── run_toolkit.bat
    ├── run_quick.bat
    ├── run_fixes.bat
    └── run_web.bat
```

## Version Info

- Current Version: 8.3 (Enhanced Edition)
- Last Updated: 2024
- Features: Bluetooth detection, Colorful headline banner, OS version, Battery health
