'use client'
import { useState, useEffect, useRef } from 'react'

export default function GpuStressTest({ onComplete }) {
  const [running, setRunning] = useState(false)
  const [fps, setFps] = useState(0)
  const [duration, setDuration] = useState(0)
  const canvasRef = useRef(null)
  const requestRef = useRef(null)

  const startTest = () => {
    setRunning(true)
    setDuration(0)
  }

  const stopTest = () => {
    setRunning(false)
    cancelAnimationFrame(requestRef.current)
    onComplete?.({ maxDuration: duration, avgFps: fps })
  }

  useEffect(() => {
    if (!running) return

    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl')
    if (!gl) return

    // Simple vertex shader
    const vsSource = `
      attribute vec4 aVertexPosition;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      }
    `
    // Fragment shader for high stress (complex math)
    const fsSource = `
      precision highp float;
      uniform float uTime;
      void main() {
        float r = sin(uTime + gl_FragCoord.x * 0.01);
        float g = cos(uTime + gl_FragCoord.y * 0.01);
        float b = sin(uTime * 0.5);
        for(int i=0; i<100; i++) {
          r = sin(r * 1.5 + uTime);
          g = cos(g * 1.2 + uTime);
        }
        gl_FragColor = vec4(abs(r), abs(g), abs(b), 1.0);
      }
    `

    const compileShader = (source, type) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const program = gl.createProgram()
    gl.attachShader(program, compileShader(vsSource, gl.VERTEX_SHADER))
    gl.attachShader(program, compileShader(fsSource, gl.FRAGMENT_SHADER))
    gl.linkProgram(program)
    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = [
      -1.0,  1.0,  1.0,  1.0, -1.0, -1.0,  1.0, -1.0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    const pos = gl.getAttribLocation(program, 'aVertexPosition')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'uTime')
    const uProj = gl.getUniformLocation(program, 'uProjectionMatrix')
    const uMV   = gl.getUniformLocation(program, 'uModelViewMatrix')

    // Identity matrices
    const identity = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1])
    gl.uniformMatrix4fv(uProj, false, identity)
    gl.uniformMatrix4fv(uMV,  false, identity)

    let lastTime = 0
    let frameCount = 0
    let fpsTimer = 0

    const render = (time) => {
      time *= 0.001 // convert to seconds
      const deltaTime = time - lastTime
      lastTime = time

      // Calculate FPS
      frameCount++
      fpsTimer += deltaTime
      if (fpsTimer >= 1) {
        setFps(Math.round(frameCount / fpsTimer))
        frameCount = 0
        fpsTimer = 0
        setDuration(d => d + 1)
      }

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uTime, time)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      requestRef.current = requestAnimationFrame(render)
    }
    requestRef.current = requestAnimationFrame(render)

    return () => cancelAnimationFrame(requestRef.current)
  }, [running])

  return (
    <div>
      <h2 style={{marginBottom:'16px'}}>GPU Thermal Stress</h2>
      
      {!running ? (
        <div className="card" style={{padding:'40px', textAlign:'center', border:'1px dashed var(--accent)'}}>
          <div style={{fontSize:'13px', color:'var(--text-secondary)', marginBottom:'24px', lineHeight:1.6}}>
            This test uses **WebGL Parallel Math** to stress the GPU cores. <br/>
            Monitor your fans and system temperatures. Stop immediately if you see artifacts or freezing.
          </div>
          <button className="btn-primary" onClick={startTest} style={{width:'200px'}}>Start Stress Test</button>
        </div>
      ) : (
        <div className="animate-in">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
            <div style={{display:'flex', gap:'20px'}}>
              <div className="card" style={{padding:'10px 20px', minWidth:'120px'}}>
                <div style={{fontSize:'10px', color:'var(--text-muted)'}}>STRESS FPS</div>
                <div style={{fontSize:'20px', fontWeight:700, color:'var(--accent)'}}>{fps}</div>
              </div>
              <div className="card" style={{padding:'10px 20px', minWidth:'120px'}}>
                <div style={{fontSize:'10px', color:'var(--text-muted)'}}>DURATION</div>
                <div style={{fontSize:'20px', fontWeight:700}}>{duration}s</div>
              </div>
            </div>
            <button className="btn-outline" onClick={stopTest} style={{borderColor:'var(--red)', color:'var(--red)'}}>Stop Test</button>
          </div>

          <div style={{position:'relative', width:'100%', height:'400px', borderRadius:'12px', overflow:'hidden', border:'1px solid var(--border)'}}>
            <canvas ref={canvasRef} width="800" height="400" style={{width:'100%', height:'100%', display:'block'}} />
            <div style={{position:'absolute', top:20, left:20, background:'rgba(0,0,0,0.6)', padding:'8px 12px', borderRadius:'6px', pointerEvents:'none'}}>
               <div style={{fontSize:'9px', fontWeight:900, color:'var(--red)', letterSpacing:2}}>STRESS_LOAD: 100%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
