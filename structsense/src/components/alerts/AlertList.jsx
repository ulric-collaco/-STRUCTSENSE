import React from 'react'
import useStore from '../../store/useStore.js'

export default function AlertList({ maxHeight }) {
  const { alerts, clearAlerts } = useStore()

  const sortedAlerts = [...alerts].reverse().slice(0, 30)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#0d0d0d',
        borderBottom: '2px solid #1a1a1a',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#888',
          }}>
            ALERT LOG
          </div>
          {alerts.length > 0 && (
            <span style={{
              background: sortedAlerts.some(a => a.type === 'Critical') ? '#FF2D2D' : '#FFD600',
              color: '#0d0d0d',
              fontFamily: 'var(--font-condensed)',
              fontSize: 10,
              fontWeight: 900,
              padding: '2px 7px',
              letterSpacing: '0.05em',
            }}>
              {alerts.length}
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <button
            onClick={clearAlerts}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: '#555',
              background: 'transparent',
              border: '1px solid #2a2a2a',
              padding: '3px 8px',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.color = '#FFD600'; e.target.style.borderColor = '#FFD600' }}
            onMouseLeave={e => { e.target.style.color = '#555'; e.target.style.borderColor = '#2a2a2a' }}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* List */}
      <div style={{
        overflowY: 'auto',
        flex: 1,
        maxHeight: maxHeight || '100%',
      }}>
        {sortedAlerts.length === 0 ? (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#333',
            letterSpacing: '0.1em',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8, color: '#00FF6A', opacity: 0.4 }}>✓</div>
            NO ACTIVE ALERTS
          </div>
        ) : (
          sortedAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))
        )}
      </div>
    </div>
  )
}

function AlertItem({ alert }) {
  const isCritical = alert.type === 'Critical'
  const color = isCritical ? '#FF2D2D' : '#FFD600'
  const bg = isCritical ? 'rgba(255,45,45,0.05)' : 'rgba(255,214,0,0.04)'
  const time = new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div style={{
      borderBottom: '1px solid #111',
      borderLeft: `3px solid ${color}`,
      padding: '10px 14px',
      background: bg,
      transition: 'background 0.15s',
    }}>
      {/* Type + time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{
          fontFamily: 'var(--font-condensed)',
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: '0.18em',
          color,
          background: isCritical ? 'rgba(255,45,45,0.15)' : 'rgba(255,214,0,0.12)',
          padding: '1px 6px',
        }}>
          {alert.type.toUpperCase()}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: '#444',
        }}>
          {time}
        </span>
      </div>

      {/* Message */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: '#888',
        lineHeight: 1.5,
        marginBottom: 4,
      }}>
        {alert.message}
      </div>

      {/* Recommendation */}
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 9,
        color: '#555',
        lineHeight: 1.4,
        borderLeft: `1px solid ${color}30`,
        paddingLeft: 6,
      }}>
        → {alert.recommendation}
      </div>
    </div>
  )
}
