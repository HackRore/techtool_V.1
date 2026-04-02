/**
 * poshMapper.js
 * Hachtool Telemetry Ingestion Engine
 */

export function mapPoshToUI(raw) {
  // 1. Version Detection & Extraction
  const meta = raw.meta || {}
  const toolVersion = meta.version || 'v1.0'
  
  // 2. Base Structure
  const report = {
    overall: raw.overall || raw.score?.value || 0,
    grade: raw.grade || raw.score?.grade || 'UNKNOWN_STATUS',
    cpu: mapModule(raw.cpu, 'PROCESSOR_SUBSYSTEM'),
    ram: mapModule(raw.ram, 'MEMORY_SUBSYSTEM'),
    storage: mapModule(raw.storage || raw.disks, 'STORAGE_SUBSYSTEM'),
    battery: mapModule(raw.battery, 'POWER_SUBSYSTEM'),
    network: mapModule(raw.network, 'NETWORK_SUBSYSTEM'),
    bios: mapModule(raw.system || raw.bios, 'FIRMWARE_SUBSYSTEM')
  }

  return report
}

function mapModule(data, fallbackLabel) {
  if (!data) return { status: 'healthy', detail: 'N/A: Standard Protocol' }
  
  // Handle nested Posh v2.4+ structures
  if (data.status && data.detail) {
    return {
      status: data.status.toLowerCase(),
      detail: data.detail
    }
  }

  // Handle raw Posh v2.3- structures (extraction logic)
  const status = data.smartOK === false ? 'action_required' : 'healthy'
  const detail = data.name || data.model || data.manufacturer || fallbackLabel
  
  return {
    status,
    detail
  }
}
