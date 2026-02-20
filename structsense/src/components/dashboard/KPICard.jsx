import React from 'react'

const RISK_CONFIG = {
  Healthy: { color: '#00FF6A', bg: 'rgba(0,255,106,0.1)', border: 'rgba(0,255,106,0.3)' },
  Moderate: { color: '#FFD600', bg: 'rgba(255,214,0,0.1)', border: 'rgba(255,214,0,0.3)' },
  Critical: { color: '#FF2D2D', bg: 'rgba(255,45,45,0.1)', border: 'rgba(255,45,45,0.35)' },
}

export default function KPICard({ label, value, unit, subLabel, riskLevel, accentColor, large }) {
  const risk = RISK_CONFIG[riskLevel]
  const accent = accentColor || (risk?.color) || '#FFD600'
  const bgColor = risk?.bg || 'rgba(255,214,0,0.07)'
  const borderColor = risk?.border || 'rgba(255,214,0,0.2)'
  const isCritical = riskLevel === 'Critical'

  return (
    <div style={{
      background: '#111',
      border: `2px solid ${borderColor}`,
      padding: large ? '24px' : '18px 20px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.3s',
      boxShadow: isCritical ? '0 0 18px rgba(255,45,45,0.15)' : 'none',
    }}>
      {/* Top accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: accent,
        opacity: 0.8,
      }} />

      {/* Label */}
      <div style={{
        fontFamily: 'var(--font-condensed)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.2em',
        color: '#555',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        {label}
      </div>

      {/* Value */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: large ? 52 : 38,
        color: accent,
        lineHeight: 1,
        letterSpacing: '0.02em',
        display: 'flex',
        alignItems: 'baseline',
        gap: 4,
      }}>
        {value}
        {unit && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: large ? 14 : 11,
            color: '#555',
            letterSpacing: '0.1em',
          }}>
            {unit}
          </span>
        )}
      </div>

      {/* Sub label */}
      {subLabel && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: '#444',
          marginTop: 6,
          letterSpacing: '0.05em',
        }}>
          {subLabel}
        </div>
      )}

      {/* Critical pulsing bg overlay */}
      {isCritical && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,45,45,0.04)',
          animation: 'pulse-red 1.2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}
