'use client'
import { useState, useRef, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { resolveSymptom } from '../../lib/engine/symptomEngine'
import { getStep, getStepContext, nextStep } from '../../lib/engine/diagnosticEngine'
import { Sparkles, Send, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, Zap, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm your AI Technician Copilot. Describe the hardware symptom you're experiencing, and I'll guide you through a diagnostic path." }
  ])
  const [input, setInput] = useState('')
  const [activeDiagnostic, setActiveDiagnostic] = useState(null)
  const [currentStepId, setCurrentStepId] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const addMessage = (role, text, data = {}) => {
    setMessages(prev => [...prev, { role, text, ...data }])
  }

  const handleSearch = (e, manualInput) => {
    if (e) e.preventDefault()
    const userInput = manualInput || input.trim()
    if (!userInput) return

    addMessage('user', userInput)
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const match = resolveSymptom(userInput)
      if (match && match.id !== 'unknown') {
        setActiveDiagnostic(match)
        setCurrentStepId(match.steps[0].id)
        const firstStep = match.steps[0]
        const context = getStepContext(firstStep)
        
        addMessage('ai', `Analysis Complete. I've matched this to: **${match.title}**`, {
          isDiagnostic: true,
          confidence: match.confidence,
          step: firstStep,
          context
        })
      } else {
        addMessage('ai', "I couldn't pinpoint a specific diagnostic path. However, you might find these FixLab categories helpful:", {
          isFallback: true
        })
      }
      setIsTyping(false)
    }, 800)
  }

  const exportSession = () => {
    const text = messages.map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join('\n\n')
    const blob = new Blob([`Elite Technician OS - Diagnostic Report\nGenerated: ${new Date().toLocaleString()}\n\n${text}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diagnostic-report-${Date.now()}.txt`
    a.click()
  }

  const handleOptionSelect = (optionLabel) => {
    const nextStepId = nextStep(activeDiagnostic, currentStepId, optionLabel)
    addMessage('user', optionLabel)
    setIsTyping(true)

    setTimeout(() => {
      if (nextStepId) {
        setCurrentStepId(nextStepId)
        const step = getStep(activeDiagnostic, nextStepId)
        const context = getStepContext(step)
        
        addMessage('ai', step.question || step.message, {
          isDiagnostic: true,
          step,
          context
        })
      }
      setIsTyping(false)
    }, 600)
  }

  const resetDiagnostic = () => {
    setMessages([{ role: 'ai', text: "Assistant reset. How can I help you today?" }])
    setActiveDiagnostic(null)
    setCurrentStepId(null)
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div className="breadcrumb">Intelligence / Copilot</div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sparkles size={32} className="text-blue-600" />
            AI Technician Assistant
          </h1>
        </div>

        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', background: 'var(--surface)' }}>
          {/* Chat Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>System Online</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={exportSession} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, borderColor: 'var(--blue-600)', color: 'var(--blue-600)' }}>
                <Download size={12} /> Export Report
              </button>
              <button onClick={resetDiagnostic} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={12} /> Reset
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          {messages.length === 1 && (
            <div style={{ padding: '32px 24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: 1 }}>Quick Diagnostic Shortcuts</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {[
                  { label: 'No Display', icon: '🖥️', query: 'no display' },
                  { label: 'Beep Codes', icon: '🔊', query: 'beeping' },
                  { label: 'Slow System', icon: '🐢', query: 'slow' }
                ].map(item => (
                  <button 
                    key={item.label}
                    onClick={() => handleSearch(null, item.query)}
                    className="card-flat hover-grow"
                    style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', background: 'var(--bg)', border: '1px solid var(--border)' }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Diagnostic Tree</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ 
                  position: 'relative',
                  background: msg.role === 'user' ? 'var(--blue-600)' : 'var(--surface-2)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-1)',
                  padding: '12px 18px',
                  borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: msg.role === 'user' ? '0 4px 15px rgba(14, 165, 233, 0.2)' : 'none'
                }}>
                  {msg.text}
                  
                  {msg.role === 'ai' && msg.confidence > 0 && (
                    <div style={{ 
                      position: 'absolute', top: -10, right: 10, 
                      background: 'var(--bg)', padding: '2px 8px', borderRadius: 10, 
                      fontSize: 9, fontWeight: 700, color: 'var(--green)', 
                      border: '1px solid var(--green)', display: 'flex', alignItems: 'center', gap: 4 
                    }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--green)' }} />
                      {msg.confidence}% MATCH
                    </div>
                  )}
                  
                  {msg.isFallback && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Hardware Diagnostics', href: '/category/hardware' },
                        { label: 'Software Fixes', href: '/category/software' },
                        { label: 'System Optimization', href: '/category/optimization' }
                      ].map(cat => (
                        <Link key={cat.label} href={cat.href} style={{ 
                          padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, 
                          textDecoration: 'none', color: 'var(--blue-600)', fontWeight: 600, 
                          fontSize: 12, border: '1px solid var(--border)' 
                        }}>
                          {cat.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                  {msg.isDiagnostic && msg.step && (
                    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      {/* Step Logic */}
                      {msg.step.options && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                          {msg.step.options.map(opt => (
                            <button 
                              key={opt.label} 
                              onClick={() => handleOptionSelect(opt.label)}
                              className="btn-secondary"
                              style={{ padding: '8px 16px', fontSize: 12, borderRadius: 20 }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Contextual Suggestions */}
                      {(msg.context?.tool || msg.context?.guide) && (
                        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-4)', letterSpacing: 1 }}>Recommended Resources</div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            {msg.context.tool && (
                              <Link href={`/tools/${msg.context.tool.slug}`} className="test-card" style={{ padding: '10px 14px', flex: 1, textDecoration: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Zap size={14} className="text-blue-500" />
                                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>Use {msg.context.tool.name}</span>
                                </div>
                              </Link>
                            )}
                            {msg.context.guide && (
                              <Link href={`/guides/${msg.context.guide.slug}`} className="test-card" style={{ padding: '10px 14px', flex: 1, textDecoration: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <BookOpen size={14} className="text-green-500" />
                                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>Read Guide</span>
                                </div>
                              </Link>
                            )}
                          </div>
                        </div>
                      )}

                      {msg.step.isFinal && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: msg.step.id === 'resolved' ? 'var(--green)' : 'var(--red)' }}>
                          {msg.step.id === 'resolved' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Outcome Logged.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--surface-2)', padding: '12px 18px', borderRadius: '18px 18px 18px 2px', fontSize: 14 }}>
                <span className="animate-pulse">Copilot is thinking...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSearch} style={{ padding: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, background: 'var(--bg)' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your PC problem (e.g. 'No display after cleaning' or '3 beeps on startup')..." 
              style={{ 
                flex: 1, 
                background: 'var(--surface-2)', 
                border: '1px solid var(--border)', 
                borderRadius: 12, 
                padding: '12px 20px', 
                color: 'var(--text-1)',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px' }}>
              <Send size={18} /> Send
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
