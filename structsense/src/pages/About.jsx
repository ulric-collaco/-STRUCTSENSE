import React from 'react'

const STACK = [
  { name: 'React 18', role: 'UI Framework', color: '#61DAFB' },
  { name: 'Vite 5', role: 'Build Tool', color: '#FFD600' },
  { name: 'React Three Fiber', role: '3D Rendering', color: '#00FF6A' },
  { name: '@react-three/drei', role: '3D Helpers', color: '#00FF6A' },
  { name: 'Three.js', role: 'WebGL Engine', color: '#00aaff' },
  { name: 'Zustand', role: 'State Management', color: '#FFD600' },
  { name: 'Recharts', role: 'Data Visualization', color: '#FF6B35' },
  { name: 'React Router v6', role: 'Client Routing', color: '#CA4245' },
]

const MODES_INFO = [
  { mode: 'NORMAL', desc: 'Sinusoidal oscillation around baseline stress (~28 MPa). Healthy state maintained.', risk: 'Healthy' },
  { mode: 'GRADUAL_STRESS', desc: 'Stress climbs linearly from 20→95 MPa over time. Tests progressive degradation.', risk: 'Moderate' },
  { mode: 'STRESS_SPIKE', desc: 'Sudden spikes to 85+ MPa every 20 ticks, simulating impact loads.', risk: 'Moderate' },
  { mode: 'PROGRESSIVE_FATIGUE', desc: 'Fatigue index ramps aggressively at 0.8–1.5% per tick, primary driver.', risk: 'Moderate' },
  { mode: 'FAILURE', desc: 'All metrics escalate toward failure thresholds simultaneously.', risk: 'Critical' },
]

const RISK_COLOR = { Healthy: '#00FF6A', Moderate: '#FFD600', Critical: '#FF2D2D' }

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <div style={{
            display: 'inline-block',
            background: '#FFD600',
            color: '#0d0d0d',
            padding: '4px 12px',
            fontFamily: 'var(--font-condensed)',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.2em',
            marginBottom: 16,
          }}>
            SYSTEM DOCUMENTATION
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 5vw, 72px)',
            color: '#fff',
            lineHeight: 0.95,
            marginBottom: 16,
          }}>
            ABOUT <span style={{ color: '#FFD600' }}>STRUCTSENSE</span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            color: '#666',
            maxWidth: 600,
            lineHeight: 1.7,
          }}>
            A production-grade Digital Twin Structural Health Monitoring prototype built entirely client-side. No backend. No hardware. Pure simulation.
          </p>
        </div>

        {/* Architecture overview */}
        <div style={{
          background: '#111',
          border: '2px solid #1a1a1a',
          padding: '32px',
          marginBottom: 48,
          borderLeft: '4px solid #FFD600',
        }}>
          <div style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#FFD600',
            marginBottom: 16,
          }}>
            SYSTEM ARCHITECTURE
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#888',
            lineHeight: 2,
          }}>
            <div><span style={{ color: '#FFD600' }}>simulation/engine.js</span> → tick() generates sensor data per mode</div>
            <div><span style={{ color: '#FFD600' }}>store/useStore.js</span>    → Zustand holds state, drives setInterval lifecycle</div>
            <div><span style={{ color: '#FFD600' }}>components/digitalTwin</span> → R3F Canvas renders live 3D bridge model</div>
            <div><span style={{ color: '#FFD600' }}>pages/Analytics.jsx</span>   → Recharts consumes historicalData[]</div>
            <div><span style={{ color: '#FFD600' }}>pages/History.jsx</span>     → Session snapshots saved on mode change</div>
          </div>
        </div>

        {/* Health formula */}
        <div style={{
          background: '#111',
          border: '2px solid #1a1a1a',
          padding: '32px',
          marginBottom: 48,
        }}>
          <div style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#888',
            marginBottom: 20,
          }}>
            HEALTH INDEX FORMULA
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            color: '#00FF6A',
            background: '#0d0d0d',
            border: '1px solid #1a1a1a',
            padding: '20px 24px',
            lineHeight: 2,
          }}>
            <div style={{ color: '#555' }}>// Structural Health Index (0–100)</div>
            <div><span style={{ color: '#FFD600' }}>healthIndex</span> = 100 <span style={{ color: '#FF2D2D' }}>−</span> (stress × <span style={{ color: '#FFD600' }}>0.5</span>) <span style={{ color: '#FF2D2D' }}>−</span> (fatigueIndex × <span style={{ color: '#FFD600' }}>40</span>) <span style={{ color: '#FF2D2D' }}>−</span> (vibration × <span style={{ color: '#FFD600' }}>5</span>)</div>
            <div style={{ color: '#555' }}>// Clamped to [0, 100]</div>
            <div style={{ marginTop: 8 }}>
              <div>health &gt; 70 → <span style={{ color: '#00FF6A' }}>Healthy ✓</span></div>
              <div>health 40–70 → <span style={{ color: '#FFD600' }}>Moderate ⚠</span></div>
              <div>health &lt; 40 → <span style={{ color: '#FF2D2D' }}>Critical ✕</span></div>
            </div>
          </div>
        </div>

        {/* Simulation modes */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#888',
            marginBottom: 24,
          }}>
            SIMULATION MODES
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {MODES_INFO.map((m) => (
              <div key={m.mode} style={{
                background: '#111',
                border: '2px solid #1a1a1a',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                borderLeft: `4px solid ${RISK_COLOR[m.risk]}`,
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  color: RISK_COLOR[m.risk],
                  letterSpacing: '0.1em',
                  minWidth: 180,
                }}>
                  {m.mode}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: '#666',
                  lineHeight: 1.5,
                  flex: 1,
                }}>
                  {m.desc}
                </div>
                <span style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  color: RISK_COLOR[m.risk],
                  background: `${RISK_COLOR[m.risk]}15`,
                  padding: '3px 8px',
                  whiteSpace: 'nowrap',
                }}>
                  {m.risk.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#888',
            marginBottom: 24,
          }}>
            TECH STACK
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {STACK.map((t) => (
              <div key={t.name} style={{
                background: '#111',
                border: `1px solid #1a1a1a`,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderLeft: `3px solid ${t.color}`,
              }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-condensed)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: t.color,
                    letterSpacing: '0.08em',
                  }}>
                    {t.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: '#444',
                    marginTop: 2,
                  }}>
                    {t.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RUL info */}
        <div style={{
          background: '#111',
          border: '2px solid #1a1a1a',
          padding: '32px',
          borderLeft: '4px solid #00FF6A',
        }}>
          <div style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#00FF6A',
            marginBottom: 16,
          }}>
            REMAINING USEFUL LIFE (RUL)
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#666',
            lineHeight: 1.9,
          }}>
            <p>RUL is computed via linear regression on the last 6 stress readings.</p>
            <p style={{ marginTop: 8 }}>
              If slope &gt; 0.2 MPa/tick: <span style={{ color: '#FFD600' }}>RUL = (criticalThreshold − currentStress) / slope</span>
            </p>
            <p>If slope ≤ 0.2: <span style={{ color: '#00FF6A' }}>"Stable Condition"</span></p>
            <p>If currentStress &gt; criticalThreshold: <span style={{ color: '#FF2D2D' }}>"THRESHOLD EXCEEDED"</span></p>
          </div>
        </div>

      </div>
    </div>
  )
}
