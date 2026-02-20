import React, { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import useStore from '../store/useStore.js'

const FILTER_OPTIONS = [
  { label: 'LAST 20', value: 20 },
  { label: 'LAST 50', value: 50 },
  { label: 'LAST 100', value: 100 },
]

const CHART_CONFIG = [
  {
    key: 'stress',
    label: 'STRESS',
    unit: 'MPa',
    color: '#FF8C00',
    domainMax: 120,
  },
  {
    key: 'vibration',
    label: 'VIBRATION',
    unit: 'mm/s',
    color: '#00aaff',
    domainMax: 15,
  },
  {
    key: 'healthIndex',
    label: 'HEALTH INDEX',
    unit: '%',
    color: '#00FF6A',
    domainMax: 100,
  },
  {
    key: 'fatigueIndex',
    label: 'FATIGUE INDEX',
    unit: 'ratio',
    color: '#FF2D2D',
    domainMax: 1,
    tickFormatter: (v) => v.toFixed(2),
  },
]

function CustomTooltip({ active, payload, label, unit, color }) {
  if (!active || !payload || !payload.length) return null
  const val = payload[0]?.value
  return (
    <div style={{
      background: '#0d0d0d',
      border: `1px solid ${color}`,
      padding: '8px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
    }}>
      <div style={{ color: '#555', marginBottom: 4, fontSize: 9 }}>{label}</div>
      <div style={{ color }}>{typeof val === 'number' ? val.toFixed(3) : val} {unit}</div>
    </div>
  )
}

function MiniChart({ config, data, thresholds }) {
  const latest = data[data.length - 1]?.[config.key]
  const min = data.length ? Math.min(...data.map((d) => d[config.key])) : 0
  const max = data.length ? Math.max(...data.map((d) => d[config.key])) : 0

  return (
    <div style={{
      background: '#111',
      border: '2px solid #1a1a1a',
      padding: '20px',
    }}>
      {/* Chart header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#555',
            marginBottom: 4,
          }}>
            {config.label}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            color: config.color,
            lineHeight: 1,
            letterSpacing: '0.02em',
          }}>
            {latest !== undefined ? (
              config.key === 'fatigueIndex'
                ? `${(latest * 100).toFixed(1)}`
                : typeof latest === 'number' ? latest.toFixed(2) : '--'
            ) : '--'}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#444', marginLeft: 4 }}>
              {config.key === 'fatigueIndex' ? '%' : config.unit}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#333', marginBottom: 3 }}>
            MAX {max.toFixed(2)}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#333' }}>
            MIN {min.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: '#333' }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, config.domainMax]}
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: '#333' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={config.tickFormatter}
          />
          <Tooltip
            content={<CustomTooltip unit={config.unit} color={config.color} />}
            isAnimationActive={false}
          />

          {/* Threshold lines for stress */}
          {config.key === 'stress' && (
            <>
              <ReferenceLine
                y={thresholds.warning}
                stroke="#FFD600"
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{ value: 'WARN', position: 'insideTopRight', fill: '#FFD600', fontSize: 8, fontFamily: 'var(--font-mono)' }}
              />
              <ReferenceLine
                y={thresholds.critical}
                stroke="#FF2D2D"
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{ value: 'CRIT', position: 'insideTopRight', fill: '#FF2D2D', fontSize: 8, fontFamily: 'var(--font-mono)' }}
              />
            </>
          )}

          {/* Min health threshold */}
          {config.key === 'healthIndex' && (
            <ReferenceLine
              y={thresholds.minHealth}
              stroke="#FF2D2D"
              strokeDasharray="4 3"
              strokeWidth={1}
              label={{ value: 'MIN', position: 'insideTopRight', fill: '#FF2D2D', fontSize: 8, fontFamily: 'var(--font-mono)' }}
            />
          )}

          <Line
            type="monotone"
            dataKey={config.key}
            stroke={config.color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 3, fill: config.color, stroke: '#0d0d0d', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Analytics() {
  const { historicalData, thresholds, isRunning, nodes } = useStore()
  const [filterCount, setFilterCount] = useState(50)
  const node = nodes[0]

  const filteredData = historicalData.slice(-filterCount)

  const avgHealth = filteredData.length
    ? (filteredData.reduce((s, d) => s + d.healthIndex, 0) / filteredData.length).toFixed(1)
    : '--'
  const peakStress = filteredData.length
    ? Math.max(...filteredData.map((d) => d.stress)).toFixed(1)
    : '--'
  const alertCount = useStore.getState().alerts.length

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
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          color: '#fff',
          letterSpacing: '0.05em',
        }}>
          ANALYTICS
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterCount(f.value)}
              style={{
                padding: '6px 16px',
                background: filterCount === f.value ? '#FFD600' : 'transparent',
                border: filterCount === f.value ? '2px solid #FFD600' : '2px solid #1a1a1a',
                color: filterCount === f.value ? '#0d0d0d' : '#555',
                fontFamily: 'var(--font-condensed)',
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (filterCount !== f.value) {
                  e.currentTarget.style.borderColor = '#333'
                  e.currentTarget.style.color = '#888'
                }
              }}
              onMouseLeave={e => {
                if (filterCount !== f.value) {
                  e.currentTarget.style.borderColor = '#1a1a1a'
                  e.currentTarget.style.color = '#555'
                }
              }}
            >
              {f.label}
            </button>
          ))}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: '#333',
            padding: '6px 10px',
            border: '1px solid #111',
          }}>
            {filteredData.length} SAMPLES
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 1600, margin: '0 auto' }}>
        {/* Summary strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 28,
        }}>
          {[
            { label: 'CURRENT HEALTH', value: `${node.healthIndex.toFixed(1)}%`, color: node.riskLevel === 'Critical' ? '#FF2D2D' : node.riskLevel === 'Moderate' ? '#FFD600' : '#00FF6A' },
            { label: 'AVG HEALTH (WINDOW)', value: `${avgHealth}%`, color: '#888' },
            { label: 'PEAK STRESS (WINDOW)', value: `${peakStress} MPa`, color: '#FF8C00' },
            { label: 'TOTAL ALERTS', value: alertCount, color: alertCount > 0 ? '#FF2D2D' : '#444' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#111',
              border: '1px solid #1a1a1a',
              padding: '14px 18px',
              borderLeft: `3px solid ${s.color}`,
            }}>
              <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 9, letterSpacing: '0.18em', color: '#444', marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Charts grid — 2×2 */}
        {filteredData.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 400,
            border: '2px dashed #1a1a1a',
            color: '#333',
            gap: 12,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>NO DATA YET</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#2a2a2a' }}>
              Start the simulation to collect readings.
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }}>
            {CHART_CONFIG.map((cfg) => (
              <MiniChart
                key={cfg.key}
                config={cfg}
                data={filteredData}
                thresholds={thresholds}
              />
            ))}
          </div>
        )}

        {/* Running indicator */}
        {!isRunning && historicalData.length > 0 && (
          <div style={{
            marginTop: 20,
            padding: '10px 16px',
            background: 'rgba(255,214,0,0.06)',
            border: '1px solid rgba(255,214,0,0.2)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#FFD600',
            letterSpacing: '0.1em',
            textAlign: 'center',
          }}>
            ⏸ SIMULATION PAUSED — DATA FROZEN
          </div>
        )}
      </div>
    </div>
  )
}
