#!/bin/bash
# =============================================================================
# HackRore Technician Toolkit - Linux Module
# Version 1.0 - Cross-Platform Diagnostics for Linux Systems
# =============================================================================

echo "============================================="
echo "   HackRore Linux Diagnostics"
echo "============================================="
echo ""

# System Info
echo "=== System Information ==="
hostnamectl
echo ""

# CPU Info
echo "=== CPU Information ==="
lscpu | grep -E "Model name|CPU\(s\)|Thread|Core|Socket"
echo ""

# Memory
echo "=== Memory Usage ==="
free -h
echo ""

# Disk Usage
echo "=== Disk Usage ==="
df -h | grep -E "^/dev"
echo ""

# Battery (if available)
echo "=== Battery Status ==="
if [ -f /sys/class/power_supply/BAT0/capacity ]; then
    cat /sys/class/power_supply/BAT0/capacity
    cat /sys/class/power_supply/BAT0/status
else
    echo "No battery detected (desktop system)"
fi
echo ""

# Services Status
echo "=== Critical Services ==="
systemctl --failed --no-pager 2>/dev/null || echo "systemd not available"
echo ""

# Network
echo "=== Network Interfaces ==="
ip addr show | grep -E "^[0-9]+:|inet "
echo ""

# Top Processes
echo "=== Top 5 CPU Processes ==="
ps aux --sort=-%cpu | head -6
echo ""

echo "=== Top 5 Memory Processes ==="
ps aux --sort=-%mem | head -6
echo ""

echo "============================================="
echo "   Diagnostics Complete"
echo "============================================="

