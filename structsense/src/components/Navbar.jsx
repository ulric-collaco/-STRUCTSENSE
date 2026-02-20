import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import useStore from '../store/useStore.js'

const NAV_LINKS = [
  { label: 'DASHBOARD', path: '/dashboard' },
  { label: 'ANALYTICS', path: '/analytics' },
  { label: 'HISTORY', path: '/history' },
  { label: 'SETTINGS', path: '/settings' },
  { label: 'ABOUT', path: '/about' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isRunning, toggleRunning, nodes } = useStore()
  const node = nodes[0]
  const location = useLocation()

  const riskColors = {
    Healthy: '#00FF6A',
    Moderate: '#FFD600',
    Critical: '#FF2D2D',
  }
  const riskColor = riskColors[node?.riskLevel] || '#00FF6A'
  const isLanding = location.pathname === '/'

  return (
    <header style={{
      background: '#0d0d0d',
      borderBottom: '4px solid #FFD600',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <nav style={{ maxWidth: 1600, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              background: '#FFD600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(-2deg)',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#0d0d0d', fontWeight: 900 }}>SS</span>
            </div>
            <div style={{ display: 'none' }} className="logo-text">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#FFD600', letterSpacing: '0.1em', display: 'block' }}>
                STRUCTSENSE
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#555', letterSpacing: '0.25em' }}>
                DIGITAL TWIN SHM
              </span>
            </div>
            <div className="logo-text-mobile">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#FFD600', letterSpacing: '0.1em', display: 'block' }}>
                STRUCTSENSE
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#555', letterSpacing: '0.25em' }}>
                DIGITAL TWIN SHM
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                style={({ isActive }) => ({
                  padding: '8px 14px',
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: isActive ? '#FFD600' : '#888',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid #FFD600' : '2px solid transparent',
                  background: isActive ? 'rgba(255,214,0,0.07)' : 'transparent',
                  transition: 'all 0.15s',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Status + Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Live health chip - hidden on landing */}
            {!isLanding && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: '#111',
                border: `1px solid ${riskColor}`,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: riskColor,
              }} className="status-chip">
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: riskColor,
                  display: 'inline-block',
                  animation: node?.riskLevel === 'Critical' ? 'pulse-red 1.2s infinite' : 'pulse-yellow 2s infinite',
                }} />
                {node?.riskLevel?.toUpperCase() ?? 'UNKNOWN'}
              </div>
            )}

            {/* Run/Stop */}
            {!isLanding && (
              <button
                onClick={toggleRunning}
                style={{
                  padding: '8px 16px',
                  background: isRunning ? 'transparent' : '#FFD600',
                  border: isRunning ? '2px solid #FF2D2D' : '2px solid #FFD600',
                  color: isRunning ? '#FF2D2D' : '#0d0d0d',
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {isRunning ? '⏹ STOP' : '▶ RUN'}
              </button>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="nav-mobile-toggle"
              style={{
                width: 44,
                height: 44,
                background: mobileOpen ? '#FFD600' : '#111',
                border: '2px solid #333',
                color: mobileOpen ? '#0d0d0d' : '#888',
                fontSize: 20,
                cursor: 'pointer',
                display: 'none',
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? '×' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{
            background: '#0d0d0d',
            borderTop: '2px solid #FFD600',
            paddingBottom: 8,
          }}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '14px 24px',
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: isActive ? '#FFD600' : '#888',
                  textDecoration: 'none',
                  borderLeft: isActive ? '4px solid #FFD600' : '4px solid transparent',
                  borderBottom: '1px solid #1a1a1a',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; align-items: center; justify-content: center; }
          .status-chip { display: none !important; }
        }
        @media (min-width: 640px) {
          .logo-text { display: block !important; }
          .logo-text-mobile { display: none; }
        }
      `}</style>
    </header>
  )
}
