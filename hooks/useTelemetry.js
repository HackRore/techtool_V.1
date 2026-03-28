'use client'
import { useState, useEffect } from 'react'

export function useTelemetry() {
  const [battery, setBattery] = useState(null)
  const [connection, setConnection] = useState(null)
  const [fps, setFps] = useState(60)

  useEffect(() => {
    // 1. Battery API
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
      navigator.getBattery().then(batt => {
        const update = () => setBattery({
          level: Math.round(batt.level * 100),
          charging: batt.charging
        })
        update()
        batt.addEventListener('levelchange', update)
        batt.addEventListener('chargingchange', update)
      })
    }

    // 2. Connection API
    if (typeof navigator !== 'undefined' && navigator.connection) {
      const conn = navigator.connection
      const update = () => setConnection({
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt
      })
      update()
      conn.addEventListener('change', update)
    }

    // 3. FPS counter
    let frameCount = 0
    let lastTime = performance.now()
    let frameId

    const loop = (now) => {
      frameCount++
      if (now - lastTime >= 1000) {
        setFps(Math.round(frameCount))
        frameCount = 0
        lastTime = now
      }
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [])

  return { battery, connection, fps }
}
