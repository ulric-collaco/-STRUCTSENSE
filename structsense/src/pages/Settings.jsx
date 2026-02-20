import React, { useState } from 'react'
import useStore from '../store/useStore.js'

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5×', desc: 'Slow (4s interval)' },
  { value: 1, label: '1×', desc: 'Normal (2s interval)' },
  { value: 2, label: '2×', desc: 'Fast (1s interval)' },
  { value: 5, label: '5×', desc: 'Very fast (400ms)' },
  { value: 10, label: '10×', desc: 'Max speed (200ms)' },
]

function FieldRow({ label, desc, children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 24px',
      borderBottom: '1px solid #111',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-condensed)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: '#aaa',
          marginBottom: 3,
        }}>
          {label}
        </div>
        {desc && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#444', lineHeight: 1.4 }}>
            {desc}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function NumInput({ value, onChange, min, max, step = 1 }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{
        width: 120,
        padding: '8px 12px',
        background: '#0d0d0d',
        border: '2px solid #2a2a2a',
        color: '#FFD600',
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        textAlign: 'right',
        outline: 'none',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => { e.target.style.borderColor = '#FFD600' }}
      onBlur={e => { e.target.style.borderColor = '#2a2a2a' }}
    />
  )
}

export default function Settings() {
  const {
    thresholds,
    setThresholds,
    simulationSpeed,
    setSimulationSpeed,
    resetSystem,
    isRunning,
    stopSimulation,
    startSimulation,
  } = useStore()

  const [localThresholds, setLocalThresholds] = useState({ ...thresholds })
  const [saved, setSaved] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleSave = () => {
    if (
      localThresholds.warning >= localThresholds.critical ||
      localThresholds.warning <= 0 ||
      localThresholds.critical <= 0 ||
      localThresholds.minHealth < 0 ||
      localThresholds.minHealth > 70
    ) return
    setThresholds({ ...localThresholds })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 4000)
      return
    }
    resetSystem()
    setLocalThresholds({ warning: 60, critical: 80, minHealth: 40 })
    setConfirmReset(false)
  }

  const validationError =
    localThresholds.warning >= localThresholds.critical
      ? 'Warning threshold must be below critical threshold.'
      : localThresholds.warning <= 0 || localThresholds.critical <= 0
        ? 'Thresholds must be positive.'
        : localThresholds.minHealth < 0 || localThresholds.minHealth > 70
          ? 'Min health must be between 0 and 70.'
          : null

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
          SETTINGS
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {saved && (
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#00FF6A',
              padding: '6px 12px',
              border: '1px solid rgba(0,255,106,0.3)',
              background: 'rgba(0,255,106,0.06)',
            }}>
              ✓ THRESHOLDS SAVED
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!!validationError}
            style={{
              padding: '8px 20px',
              background: validationError ? 'transparent' : '#FFD600',
              border: validationError ? '2px solid #333' : '2px solid #FFD600',
              color: validationError ? '#444' : '#0d0d0d',
              fontFamily: 'var(--font-condensed)',
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: '0.15em',
              cursor: validationError ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            SAVE THRESHOLDS
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* === THRESHOLDS SECTION === */}
        <SectionHeader label="ALERT THRESHOLDS" color="#FFD600" />
        <div style={{ background: '#111', border: '2px solid #1a1a1a', marginBottom: 32 }}>
          <FieldRow
            label="WARNING THRESHOLD"
            desc="Stress level that triggers a Warning alert. Must be below critical."
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <NumInput
                value={localThresholds.warning}
                onChange={(v) => setLocalThresholds((t) => ({ ...t, warning: v }))}
                min={1}
                max={149}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#444' }}>MPa</span>
            </div>
          </FieldRow>

          <FieldRow
            label="CRITICAL THRESHOLD"
            desc="Stress level that triggers a Critical alert and RUL calculation."
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <NumInput
                value={localThresholds.critical}
                onChange={(v) => setLocalThresholds((t) => ({ ...t, critical: v }))}
                min={2}
                max={150}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#444' }}>MPa</span>
            </div>
          </FieldRow>

          <FieldRow
            label="MINIMUM HEALTH THRESHOLD"
            desc="Health index below which a Critical alert fires. Range: 0–70."
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <NumInput
                value={localThresholds.minHealth}
                onChange={(v) => setLocalThresholds((t) => ({ ...t, minHealth: v }))}
                min={0}
                max={70}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#444' }}>%</span>
            </div>
          </FieldRow>

          {validationError && (
            <div style={{
              padding: '12px 24px',
              background: 'rgba(255,45,45,0.06)',
              borderTop: '1px solid rgba(255,45,45,0.2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#FF2D2D',
            }}>
              ⚠ {validationError}
            </div>
          )}
        </div>

        {/* === SIMULATION SPEED === */}
        <SectionHeader label="SIMULATION SPEED" color="#00aaff" />
        <div style={{
          background: '#111',
          border: '2px solid #1a1a1a',
          marginBottom: 32,
          display: 'flex',
          overflow: 'hidden',
        }}>
          {SPEED_OPTIONS.map((opt, i) => {
            const isActive = simulationSpeed === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setSimulationSpeed(opt.value)}
                style={{
                  flex: 1,
                  padding: '16px 8px',
                  background: isActive ? 'rgba(0,170,255,0.1)' : 'transparent',
                  border: 'none',
                  borderLeft: i > 0 ? '1px solid #1a1a1a' : 'none',
                  borderBottom: isActive ? '3px solid #00aaff' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  color: isActive ? '#00aaff' : '#444',
                  marginBottom: 4,
                }}>
                  {opt.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: '#333',
                }}>
                  {opt.desc}
                </div>
              </button>
            )
          })}
        </div>

        {/* === SIMULATION CONTROL === */}
        <SectionHeader label="SIMULATION CONTROL" color="#888" />
        <div style={{
          background: '#111',
          border: '2px solid #1a1a1a',
          marginBottom: 32,
        }}>
          <FieldRow
            label={isRunning ? 'PAUSE SIMULATION' : 'RESUME SIMULATION'}
            desc={isRunning ? 'Stop the simulation engine. Data will be frozen.' : 'Start collecting new readings from the simulation engine.'}
          >
            <button
              onClick={isRunning ? stopSimulation : startSimulation}
              style={{
                padding: '10px 24px',
                background: isRunning ? 'transparent' : '#FFD600',
                border: isRunning ? '2px solid #FF2D2D' : '2px solid #FFD600',
                color: isRunning ? '#FF2D2D' : '#0d0d0d',
                fontFamily: 'var(--font-condensed)',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {isRunning ? '⏹ PAUSE' : '▶ RESUME'}
            </button>
          </FieldRow>
        </div>

        {/* === DANGER ZONE === */}
        <div style={{
          background: '#111',
          border: '2px solid rgba(255,45,45,0.25)',
          padding: '24px',
        }}>
          <div style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#FF2D2D',
            marginBottom: 16,
          }}>
            DANGER ZONE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 13, color: '#888', letterSpacing: '0.1em', marginBottom: 4 }}>
                RESET ENTIRE SYSTEM
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#444' }}>
                Clears all data, alerts, history, and resets thresholds to defaults. Cannot be undone.
              </div>
            </div>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 24px',
                background: confirmReset ? '#FF2D2D' : 'transparent',
                border: '2px solid #FF2D2D',
                color: confirmReset ? '#fff' : '#FF2D2D',
                fontFamily: 'var(--font-condensed)',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {confirmReset ? '⚠ CONFIRM RESET' : 'RESET SYSTEM'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

function SectionHeader({ label, color = '#FFD600' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    }}>
      <div style={{ width: 3, height: 16, background: color }} />
      <div style={{
        fontFamily: 'var(--font-condensed)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.2em',
        color: '#555',
      }}>
        {label}
      </div>
    </div>
  )
}
