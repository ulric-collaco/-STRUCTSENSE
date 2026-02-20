import React, { useEffect } from 'react'
import Scene from '../components/digitalTwin/Scene.jsx'
import KPICard from '../components/dashboard/KPICard.jsx'
import RiskBadge from '../components/dashboard/RiskBadge.jsx'
import AlertList from '../components/alerts/AlertList.jsx'
import useStore from '../store/useStore.js'
import { calcRUL, SIMULATION_MODES } from '../simulation/engine.js'

const MODE_OPTIONS = [
  { value: SIMULATION_MODES.NORMAL, label: 'NORMAL', desc: 'Baseline oscillation' },
  { value: SIMULATION_MODES.GRADUAL_STRESS, label: 'GRADUAL STRESS', desc: 'Slow stress ramp' },
  { value: SIMULATION_MODES.STRESS_SPIKE, label: 'STRESS SPIKE', desc: 'Impact load spikes' },
  { value: SIMULATION_MODES.PROGRESSIVE_FATIGUE, label: 'PROG. FATIGUE', desc: 'Fatigue accumulation' },
  { value: SIMULATION_MODES.FAILURE, label: 'FAILURE', desc: 'Critical escalation' },
]

const MODE_COLORS = {
  NORMAL: '#00FF6A',
  GRADUAL_STRESS: '#FFD600',
  STRESS_SPIKE: '#FF8C00',
  PROGRESSIVE_FATIGUE: '#FF8C00',
  FAILURE: '#FF2D2D',
}

export default function Dashboard() {
  const {
    nodes,
    alerts,
    isRunning,
    simulationMode,
    historicalData,
    thresholds,
    startSimulation,
    stopSimulation,
    toggleRunning,
    setSimulationMode,
  } = useStore()

  const node = nodes[0]
  const stressHistory = historicalData.map((d) => d.stress)
  const rul = calcRUL(stressHistory, thresholds.critical)

  // Auto-start on first visit
  useEffect(() => {
    if (!isRunning) startSimulation()
    return () => {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeAlerts = alerts.filter((a) => a.type === 'Critical').length
  const modeColor = MODE_COLORS[simulationMode] || '#FFD600'

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            color: '#fff',
            letterSpacing: '0.05em',
          }}>
            DASHBOARD
          </div>
          <RiskBadge level={node.riskLevel} large />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Active alerts badge */}
          {activeAlerts > 0 && (
            <div style={{
              background: 'rgba(255,45,45,0.12)',
              border: '1px solid rgba(255,45,45,0.4)',
              color: '#FF2D2D',
              fontFamily: 'var(--font-condensed)',
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '0.15em',
              padding: '6px 12px',
              animation: 'pulse-red 1.2s infinite',
            }}>
              ⚠ {activeAlerts} CRITICAL ALERT{activeAlerts > 1 ? 'S' : ''}
            </div>
          )}

          {/* Tick counter */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#444',
            padding: '6px 10px',
            border: '1px solid #1a1a1a',
          }}>
            {historicalData.length} / 200 SAMPLES
          </div>

          {/* Run / Stop */}
          <button
            onClick={toggleRunning}
            style={{
              padding: '8px 20px',
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
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 300px',
        gridTemplateRows: 'auto 1fr auto',
        gap: 0,
        height: 'calc(100vh - 130px)',
        minHeight: 600,
      }}>

        {/* === LEFT PANEL — KPIs === */}
        <div style={{
          borderRight: '2px solid #111',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          background: '#0d0d0d',
        }}>
          {/* Health Index — hero card */}
          <div style={{ padding: '20px 20px 12px' }}>
            <div style={{
              background: '#111',
              border: `2px solid ${node.riskLevel === 'Critical' ? '#FF2D2D' : node.riskLevel === 'Moderate' ? '#FFD600' : '#00FF6A'}30`,
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.25em',
                color: '#555',
                marginBottom: 4,
              }}>
                STRUCTURAL HEALTH INDEX
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 80,
                color: node.riskLevel === 'Critical' ? '#FF2D2D' : node.riskLevel === 'Moderate' ? '#FFD600' : '#00FF6A',
                lineHeight: 1,
                letterSpacing: '0.01em',
              }}>
                {node.healthIndex.toFixed(1)}
                <span style={{ fontSize: 20, color: '#444', marginLeft: 4 }}>%</span>
              </div>
              {/* Horizontal progress bar */}
              <div style={{ height: 4, background: '#1a1a1a', marginTop: 16, position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: `${node.healthIndex}%`,
                  background: node.riskLevel === 'Critical' ? '#FF2D2D' : node.riskLevel === 'Moderate' ? '#FFD600' : '#00FF6A',
                  transition: 'width 0.4s ease, background 0.4s',
                }} />
              </div>
              {node.riskLevel === 'Critical' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255,45,45,0.03)',
                  animation: 'pulse-red 1.2s infinite',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          </div>

          {/* Sensor KPI cards */}
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <KPICard
              label="STRESS"
              value={node.stress.toFixed(1)}
              unit="MPa"
              subLabel={`WARN: ${thresholds.warning} / CRIT: ${thresholds.critical}`}
              accentColor={node.stress > thresholds.critical ? '#FF2D2D' : node.stress > thresholds.warning ? '#FFD600' : '#00FF6A'}
            />
            <KPICard
              label="VIBRATION"
              value={node.vibration.toFixed(2)}
              unit="mm/s"
              accentColor="#00aaff"
            />
            <KPICard
              label="FATIGUE INDEX"
              value={(node.fatigueIndex * 100).toFixed(1)}
              unit="%"
              subLabel="Accumulated material fatigue"
              accentColor={node.fatigueIndex > 0.7 ? '#FF2D2D' : node.fatigueIndex > 0.4 ? '#FFD600' : '#888'}
            />
          </div>

          {/* RUL */}
          <div style={{ padding: '10px 20px 20px' }}>
            <div style={{
              background: '#111',
              border: '1px solid #1a1a1a',
              padding: '16px',
              borderTop: '3px solid #00FF6A',
            }}>
              <div style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: '#555',
                marginBottom: 8,
              }}>
                REMAINING USEFUL LIFE
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: rul.value === 0 ? '#FF2D2D' : '#00FF6A',
                lineHeight: 1.4,
              }}>
                {rul.text}
              </div>
            </div>
          </div>
        </div>

        {/* === CENTER — 3D Twin === */}
        <div style={{ position: 'relative', background: '#0d0d0d' }}>
          {/* Mode tab */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(13,13,13,0.9)',
            border: `1px solid ${modeColor}40`,
            padding: '6px 12px',
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isRunning ? modeColor : '#333',
              display: 'inline-block',
              animation: isRunning ? 'pulse-yellow 1.5s infinite' : 'none',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: modeColor,
              letterSpacing: '0.1em',
            }}>
              {simulationMode.replace(/_/g, ' ')}
            </span>
          </div>

          {/* 3D Canvas */}
          <div style={{ width: '100%', height: '100%' }}>
            <Scene />
          </div>

          {/* Orbit hint */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: '#2a2a2a',
            letterSpacing: '0.1em',
          }}>
            DRAG TO ORBIT · SCROLL TO ZOOM
          </div>
        </div>

        {/* === RIGHT PANEL — Alerts + Mode === */}
        <div style={{
          borderLeft: '2px solid #111',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d0d0d',
        }}>
          {/* Mode selector */}
          <div style={{
            padding: '16px',
            borderBottom: '2px solid #111',
            flexShrink: 0,
          }}>
            <div style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#555',
              marginBottom: 12,
            }}>
              SIMULATION MODE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {MODE_OPTIONS.map((m) => {
                const isActive = simulationMode === m.value
                const mc = MODE_COLORS[m.value]
                return (
                  <button
                    key={m.value}
                    onClick={() => setSimulationMode(m.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: isActive ? `${mc}15` : '#111',
                      border: isActive ? `2px solid ${mc}` : '2px solid #1a1a1a',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = `${mc}60`
                        e.currentTarget.style.background = `${mc}08`
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = '#1a1a1a'
                        e.currentTarget.style.background = '#111'
                      }
                    }}
                  >
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-condensed)',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: isActive ? mc : '#888',
                      }}>
                        {m.label}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        color: '#444',
                        marginTop: 2,
                      }}>
                        {m.desc}
                      </div>
                    </div>
                    {isActive && (
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: mc,
                        flexShrink: 0,
                        animation: 'pulse-yellow 1.5s infinite',
                      }} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Alert list */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <AlertList />
          </div>
        </div>
      </div>

      {/* Responsive style overrides */}
      <style>{`
        @media (max-width: 1100px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
