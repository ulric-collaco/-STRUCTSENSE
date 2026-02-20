import React from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore.js'

const HAZARD_STRIPE = {
  background: `repeating-linear-gradient(
    -45deg,
    #FFD600,
    #FFD600 10px,
    #0d0d0d 10px,
    #0d0d0d 20px
  )`,
}

const GRID_BG = {
  backgroundImage: `linear-gradient(rgba(255,214,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,214,0,0.03) 1px, transparent 1px)`,
  backgroundSize: '60px 60px',
}

export default function Landing() {
  const navigate = useNavigate()
  const { startSimulation, isRunning } = useStore()

  const handleEnter = () => {
    if (!isRunning) startSimulation()
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', overflow: 'hidden' }}>
      {/* Top hazard stripe */}
      <div style={{ height: 6, ...HAZARD_STRIPE }} />

      {/* Grid background */}
      <div style={{ position: 'relative', minHeight: 'calc(100vh - 6px)', ...GRID_BG }}>

        {/* HERO */}
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '80px 32px', width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

              {/* Left */}
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#FFD600',
                  color: '#0d0d0d',
                  padding: '8px 16px',
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: '0.2em',
                  marginBottom: 32,
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#0d0d0d',
                    animation: 'pulse-red 1.2s infinite',
                  }} />
                  LIVE STRUCTURAL INTELLIGENCE
                </div>

                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(64px, 8vw, 108px)',
                  lineHeight: 0.92,
                  color: '#fff',
                  marginBottom: 20,
                  letterSpacing: '0.01em',
                }}>
                  STRUCT<span style={{ color: '#FFD600' }}>SENSE</span>
                </h1>

                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(20px, 3vw, 36px)',
                  color: '#444',
                  letterSpacing: '0.08em',
                  marginBottom: 32,
                }}>
                  DIGITAL TWIN SHM PROTOTYPE
                </div>

                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 16,
                  color: '#777',
                  maxWidth: 480,
                  lineHeight: 1.7,
                  borderLeft: '4px solid #FFD600',
                  paddingLeft: 20,
                  marginBottom: 48,
                }}>
                  Simulates real-time structural health data for bridges and infrastructure — stress, vibration, fatigue, and remaining useful life — visualized through a live 3D digital twin.
                </p>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleEnter}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '16px 32px',
                      background: '#FFD600',
                      color: '#0d0d0d',
                      border: 'none',
                      fontFamily: 'var(--font-condensed)',
                      fontSize: 14,
                      fontWeight: 900,
                      letterSpacing: '0.2em',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FFD600' }}
                  >
                    LAUNCH DASHBOARD →
                  </button>
                  <button
                    onClick={() => navigate('/about')}
                    style={{
                      padding: '16px 32px',
                      background: 'transparent',
                      color: '#888',
                      border: '2px solid #333',
                      fontFamily: 'var(--font-condensed)',
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#FFD600'; e.currentTarget.style.color = '#FFD600' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888' }}
                  >
                    READ DOCS
                  </button>
                </div>
              </div>

              {/* Right - stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { num: '5', label: 'SIMULATION MODES', color: '#FFD600' },
                  { num: '2s', label: 'UPDATE INTERVAL', color: '#00FF6A' },
                  { num: '200', label: 'MAX HISTORY ENTRIES', color: '#FFD600' },
                  { num: '0', label: 'DOUBLE BOOKINGS', color: '#00FF6A' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: '#111',
                    border: '2px solid #1a1a1a',
                    padding: '28px 24px',
                    cursor: 'default',
                    transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#FFD600' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 52,
                      color: s.color,
                      lineHeight: 1,
                      marginBottom: 8,
                    }}>
                      {s.num}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-condensed)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      color: '#444',
                    }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech badges */}
            <div style={{ marginTop: 80, paddingTop: 40, borderTop: '1px solid #1a1a1a' }}>
              <div style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 10,
                letterSpacing: '0.3em',
                color: '#333',
                marginBottom: 20,
              }}>
                POWERED BY
              </div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
                {['REACT', 'VITE', 'THREE.JS', 'R3F', 'ZUSTAND', 'RECHARTS'].map((tech) => (
                  <span key={tech} style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    color: '#2a2a2a',
                    letterSpacing: '0.08em',
                    cursor: 'default',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => { e.target.style.color = '#FFD600' }}
                    onMouseLeave={e => { e.target.style.color = '#2a2a2a' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section style={{
          background: '#111',
          padding: '80px 0',
          borderTop: '4px solid #FFD600',
          position: 'relative',
        }}>
          {/* Hazard accent left */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, ...HAZARD_STRIPE }} />

          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 32px' }}>
            <div style={{ marginBottom: 56 }}>
              <div style={{
                display: 'inline-block',
                background: '#FFD600',
                color: '#0d0d0d',
                padding: '4px 12px',
                fontFamily: 'var(--font-condensed)',
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: '0.2em',
                marginBottom: 20,
              }}>
                CAPABILITIES
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 4vw, 56px)',
                color: '#fff',
                lineHeight: 0.95,
              }}>
                EVERYTHING IN ONE<span style={{ color: '#FFD600' }}> SYSTEM.</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {[
                { num: '01', title: 'DIGITAL TWIN', desc: 'Live 3D bridge model with dynamic color encoding for structural health states.', badge: 'R3F' },
                { num: '02', title: 'SENSOR SIMULATION', desc: 'Realistic stress, vibration, and fatigue data generated per mode with noise.', badge: 'LIVE' },
                { num: '03', title: 'ALERT ENGINE', desc: 'Threshold-based alerts with spike detection and 30s deduplication cooldown.', badge: 'AUTO' },
                { num: '04', title: 'ANALYTICS', desc: 'Realtime multi-line charts for all 4 structural metrics with time filtering.', badge: 'CHARTS' },
                { num: '05', title: 'RUL ESTIMATION', desc: 'Remaining Useful Life estimated via linear regression on stress history.', badge: 'ML' },
                { num: '06', title: 'SESSION LOG', desc: 'Per-mode session snapshots saved to history with full detail modal.', badge: 'LOG' },
              ].map((f, i) => (
                <div key={i} style={{
                  background: '#1a1a1a',
                  border: '2px solid #222',
                  padding: '28px 24px',
                  cursor: 'default',
                  transition: 'border-color 0.2s, transform 0.2s',
                  position: 'relative',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#FFD600' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#222' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 54,
                      color: '#222',
                      lineHeight: 1,
                    }}>
                      {f.num}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-condensed)',
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: '0.15em',
                      color: '#FFD600',
                      background: 'rgba(255,214,0,0.1)',
                      padding: '2px 8px',
                    }}>
                      {f.badge}
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    color: '#fff',
                    marginBottom: 8,
                    letterSpacing: '0.05em',
                  }}>
                    {f.title}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    color: '#666',
                    lineHeight: 1.6,
                  }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section style={{
          background: '#FFD600',
          padding: '80px 32px',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            ...{
              background: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 30px,
                rgba(0,0,0,0.04) 30px,
                rgba(0,0,0,0.04) 60px
              )`
            },
          }} />
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(100px, 20vw, 300px)',
            color: 'rgba(0,0,0,0.04)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            MONITOR
          </div>
          <div style={{ position: 'relative' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 6vw, 80px)',
              color: '#0d0d0d',
              lineHeight: 0.95,
              marginBottom: 20,
            }}>
              READY TO MONITOR YOUR STRUCTURE?
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              color: 'rgba(0,0,0,0.6)',
              marginBottom: 40,
            }}>
              Start the simulation engine and watch your digital twin come alive.
            </p>
            <button
              onClick={handleEnter}
              style={{
                padding: '18px 48px',
                background: '#0d0d0d',
                color: '#FFD600',
                border: 'none',
                fontFamily: 'var(--font-condensed)',
                fontSize: 15,
                fontWeight: 900,
                letterSpacing: '0.2em',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#111' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0d0d0d' }}
            >
              OPEN DASHBOARD →
            </button>
          </div>
        </section>

        {/* Bottom hazard stripe */}
        <div style={{ height: 6, ...HAZARD_STRIPE }} />
      </div>
    </div>
  )
}
