import React from 'react'

const CONFIG = {
  Healthy: { color: '#00FF6A', bg: 'rgba(0,255,106,0.12)', label: 'HEALTHY', pulse: false },
  Moderate: { color: '#FFD600', bg: 'rgba(255,214,0,0.12)', label: 'MODERATE', pulse: false },
  Critical: { color: '#FF2D2D', bg: 'rgba(255,45,45,0.15)', label: 'CRITICAL', pulse: true },
}

export default function RiskBadge({ level, large }) {
  const cfg = CONFIG[level] || CONFIG['Healthy']

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-condensed)',
      fontSize: large ? 14 : 10,
      fontWeight: 900,
      letterSpacing: '0.18em',
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.color}50`,
      padding: large ? '5px 14px' : '3px 8px',
    }}>
      <span style={{
        width: large ? 8 : 6,
        height: large ? 8 : 6,
        borderRadius: '50%',
        background: cfg.color,
        display: 'inline-block',
        animation: cfg.pulse ? 'pulse-red 1.2s infinite' : 'none',
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  )
}
