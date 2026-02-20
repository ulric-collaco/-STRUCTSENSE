import React, { useState } from 'react'
import useStore from '../store/useStore.js'

const MODE_COLOR = {
  NORMAL: '#00FF6A',
  GRADUAL_STRESS: '#FFD600',
  STRESS_SPIKE: '#FF8C00',
  PROGRESSIVE_FATIGUE: '#FF8C00',
  FAILURE: '#FF2D2D',
}

function SessionModal({ session, onClose }) {
  if (!session) return null
  const mc = MODE_COLOR[session.mode] || '#FFD600'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#111',
          border: `2px solid ${mc}`,
          maxWidth: 520,
          width: '100%',
          padding: 0,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{
          background: `${mc}12`,
          borderBottom: `2px solid ${mc}30`,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              color: mc,
              letterSpacing: '0.05em',
            }}>
              SESSION REPORT
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#444',
              marginTop: 2,
            }}>
              {session.id}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              background: '#1a1a1a',
              border: '1px solid #333',
              color: '#888',
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#555' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#333' }}
          >
            ×
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '24px' }}>
          {/* Mode banner */}
          <div style={{
            background: `${mc}10`,
            border: `1px solid ${mc}30`,
            borderLeft: `4px solid ${mc}`,
            padding: '12px 16px',
            marginBottom: 24,
          }}>
            <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 10, color: '#555', letterSpacing: '0.15em', marginBottom: 4 }}>
              SIMULATION MODE
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: mc, letterSpacing: '0.08em' }}>
              {session.mode.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'MAX STRESS', value: `${session.maxStress} MPa`, color: '#FF8C00' },
              { label: 'MIN HEALTH', value: `${session.minHealth}%`, color: '#FF2D2D' },
              { label: 'ALERTS FIRED', value: session.alertCount, color: session.alertCount > 0 ? '#FF2D2D' : '#00FF6A' },
              { label: 'DATA POINTS', value: session.duration, color: '#888' },
            ].map((m, i) => (
              <div key={i} style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                padding: '14px 16px',
              }}>
                <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 9, color: '#444', letterSpacing: '0.18em', marginBottom: 6 }}>
                  {m.label}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: m.color, lineHeight: 1 }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Timestamp */}
          <div style={{
            borderTop: '1px solid #1a1a1a',
            paddingTop: 16,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#444',
          }}>
            <span style={{ color: '#333' }}>ENDED AT: </span>
            {session.endedAt}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function History() {
  const { sessionHistory } = useStore()
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      {/* Page header */}
      <div style={{
        background: '#0d0d0d',
        borderBottom: '2px solid #111',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#fff', letterSpacing: '0.05em' }}>
          SESSION HISTORY
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#444', padding: '6px 10px', border: '1px solid #111' }}>
          {sessionHistory.length} SESSIONS LOGGED
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Info banner */}
        <div style={{
          background: 'rgba(255,214,0,0.05)',
          border: '1px solid rgba(255,214,0,0.15)',
          borderLeft: '4px solid #FFD600',
          padding: '12px 16px',
          marginBottom: 28,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#666',
        }}>
          Sessions are automatically saved when you switch simulation modes. Click any row to view details.
        </div>

        {sessionHistory.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 320,
            border: '2px dashed #1a1a1a',
            gap: 12,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#222' }}>NO SESSIONS YET</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#2a2a2a' }}>
              Switch simulation modes to create session records.
            </div>
          </div>
        ) : (
          <div style={{
            background: '#111',
            border: '2px solid #1a1a1a',
            overflow: 'hidden',
          }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>SESSION ID</th>
                  <th>MODE</th>
                  <th>MAX STRESS</th>
                  <th>MIN HEALTH</th>
                  <th>ALERTS</th>
                  <th>SAMPLES</th>
                  <th>ENDED AT</th>
                </tr>
              </thead>
              <tbody>
                {sessionHistory.map((session) => {
                  const mc = MODE_COLOR[session.mode] || '#FFD600'
                  return (
                    <tr key={session.id} onClick={() => setSelected(session)}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FFD600' }}>
                        {session.id}
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-condensed)',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          color: mc,
                          background: `${mc}15`,
                          padding: '2px 8px',
                        }}>
                          {session.mode.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ color: '#FF8C00' }}>{session.maxStress} MPa</td>
                      <td style={{ color: parseFloat(session.minHealth) < 40 ? '#FF2D2D' : '#888' }}>
                        {session.minHealth}%
                      </td>
                      <td style={{ color: session.alertCount > 0 ? '#FF2D2D' : '#444' }}>
                        {session.alertCount > 0 ? `⚠ ${session.alertCount}` : session.alertCount}
                      </td>
                      <td>{session.duration}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#444' }}>
                        {session.endedAt}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SessionModal session={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
