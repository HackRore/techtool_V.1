'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Zap, Activity, Shield, ChevronRight } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import tools from '../../data/tools.json'

export default function ToolsPage() {
  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="breadcrumb">System / TestLab</div>
        <h1 style={{ letterSpacing: '-0.03em' }}>
          Hardware <span className="text-blue-600">Testbench</span>
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 15, marginTop: 4 }}>
          Browser-based diagnostic tools for rapid hardware verification.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {categories.map(cat => (
          <div key={cat}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-4)', margin: 0 }}>
                {cat}
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {tools.filter(t => t.category === cat).map(tool => (
                <Link key={tool.id} href={`/tools/${tool.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card hover-grow" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ fontSize: 32 }}>{tool.icon}</span>
                      <span className="badge badge-ready">{tool.difficulty}</span>
                    </div>
                    <h3 style={{ marginBottom: 8 }}>{tool.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>{tool.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {tool.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="tag" style={{ fontSize: 10 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 64, background: 'var(--surface-2)', border: '1px solid var(--border-md)' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Shield className="text-blue-600" size={32} />
          <div>
            <h4 style={{ color: 'var(--text-1)', marginBottom: 4 }}>Full System Scan Required?</h4>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
              For deeper OS-level diagnostics and hardware telemetry, use the <Link href="/diagnostics" style={{ color: 'var(--blue-600)', fontWeight: 600 }}>ScanLab Engine</Link>.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
