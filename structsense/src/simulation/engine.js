
// ─────────────────────────────────────────────────────────────────
// REAL SENSOR INTEGRATION GUIDE
// To connect live hardware, replace the simulation generators below
// with a data-fetching layer.  Everything else (health formula,
// RUL regression, alert engine, Zustand store) stays unchanged.
//
// Recommended approaches:
//   REST polling  → replace tick() body with a fetch() to your API
//   WebSocket     → push new readings directly into useStore via
//                   set({ nodes: [incomingNode] }) from a ws.onmessage handler
//   MQTT (bridge) → use a MQTT-over-WebSocket client (e.g. mqtt.js)
// ─────────────────────────────────────────────────────────────────

export const SIMULATION_MODES = {
  NORMAL: 'NORMAL',
  GRADUAL_STRESS: 'GRADUAL_STRESS',
  STRESS_SPIKE: 'STRESS_SPIKE',
  PROGRESSIVE_FATIGUE: 'PROGRESSIVE_FATIGUE',
  FAILURE: 'FAILURE',
}

// Default thresholds
export const DEFAULT_THRESHOLDS = {
  warning: 60,
  critical: 80,
  minHealth: 40,
}

// ---------- maths helpers ----------
const clamp = (v, min, max) => Math.min(Math.max(v, min), max)
const rand = (min, max) => Math.random() * (max - min) + min
const jitter = (base, range) => base + rand(-range, range)

// Multi-octave oscillation — more organic than single sin
const multiOctave = (t, f1, f2, f3, a1, a2, a3) =>
  Math.sin(t * f1) * a1 + Math.sin(t * f2) * a2 + Math.sin(t * f3) * a3

// Brownian step: mean-revert toward target with noise
const brownian = (prev, target, revert, noise) =>
  prev + (target - prev) * revert + (Math.random() - 0.5) * noise * 2

// Right-skewed spike: occasional outlier reading (sensor transient)
const transient = (prob, magnitude) => Math.random() < prob ? rand(magnitude * 0.6, magnitude) : 0

// ---------- health & risk ----------
// Health formula operates on raw sensor values — works identically on
// simulated or real data.  Tune the weights (0.5 / 40 / 5) to match
// your material spec and sensor calibration.
export function calcHealthIndex(stress, vibration, fatigueIndex) {
  const h = 100 - (stress * 0.5) - (fatigueIndex * 40) - (vibration * 5)
  return clamp(h, 0, 100)
}

export function calcRiskLevel(healthIndex) {
  if (healthIndex > 70) return 'Healthy'
  if (healthIndex >= 40) return 'Moderate'
  return 'Critical'
}

// ---------- RUL ----------
export function calcRUL(stressHistory, criticalThreshold) {
  if (stressHistory.length < 6) return { text: 'Collecting data...', value: null }

  const recent = stressHistory.slice(-14)   // ~28s of data at 1× speed
  const n = recent.length
  const current = recent[recent.length - 1]

  // Already exceeded
  if (current >= criticalThreshold) return { text: 'THRESHOLD EXCEEDED', value: 0 }

  // Linear regression for slope (MPa / tick)
  const sumX  = (n * (n - 1)) / 2
  const sumY  = recent.reduce((a, v) => a + v, 0)
  const sumXY = recent.reduce((a, v, i) => a + i * v, 0)
  const sumX2 = recent.reduce((a, _, i) => a + i * i, 0)
  const denom = n * sumX2 - sumX * sumX
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0

  // Smoothed (EMA) slope — less jitter on oscillating modes
  const half = Math.floor(n / 2)
  const avgFirst = recent.slice(0, half).reduce((a, v) => a + v, 0) / half
  const avgLast  = recent.slice(half).reduce((a, v) => a + v, 0) / (n - half)
  const emaSlope = (avgLast - avgFirst) / half

  const effectiveSlope = (slope + emaSlope) / 2

  if (effectiveSlope < 0.12) return { text: 'Stable', value: null }

  const ticksRemaining = (criticalThreshold - current) / effectiveSlope
  if (ticksRemaining <= 0) return { text: 'THRESHOLD EXCEEDED', value: 0 }

  const seconds = Math.round(ticksRemaining * 2)   // 2 s per tick at 1×
  if (seconds < 15)  return { text: `< 15s — IMMINENT`, value: seconds }
  if (seconds < 60)  return { text: `~${seconds}s remaining`, value: seconds }
  const mins = Math.ceil(seconds / 60)
  return { text: `~${mins}m remaining`, value: seconds }
}

// ---------- mode-specific generators ----------
// ┌─────────────────────────────────────────────────────────────────┐
// │  SENSOR DATA ENTRY POINT — OPTION A (polling / WebSocket)       │
// │                                                                 │
// │  If you have a real sensor feed, DELETE all five generator      │
// │  functions below and replace the tick() function body with:     │
// │                                                                 │
// │    const raw = await fetchSensorReading(nodeId)                 │
// │    // raw = { stress: number, vibration: number,               │
// │    //         fatigueIndex: number }   ← units: MPa, mm/s, 0-1 │
// │    return { stress: raw.stress,                                 │
// │             vibration: raw.vibration,                           │
// │             fatigueIndex: raw.fatigueIndex }                    │
// │                                                                 │
// │  The health formula, RUL, and alert engine beneath will work    │
// │  on the real values with zero changes.                          │
// └─────────────────────────────────────────────────────────────────┘
// All generators work incrementally from prev state — no tick-based ramps.
// Each mode has a distinct initial node (set on mode switch in the store).

function normalMode(prev, tick) {
  // Realistic baseline: multi-octave traffic/structural loads + sensor noise
  const structural = multiOctave(tick, 0.06, 0.14, 0.33, 5.5, 2.8, 1.4)
  const traffic     = multiOctave(tick, 0.9,  1.8,  3.3,  4.2, 1.6, 0.7)
  const sensorNoise = (Math.random() - 0.5) * 2.8 + (Math.random() - 0.5) * 1.1
  const spike       = transient(0.03, 6)   // rare micro-spike

  const stress = clamp(27 + structural + traffic + sensorNoise + spike, 8, 50)

  // Vibration correlated with stress, brownian walk
  const vibTarget = 0.85 + Math.abs(structural) * 0.07 + rand(0, 0.25)
  const vibration = clamp(brownian(prev.vibration, vibTarget, 0.28, 0.18), 0.3, 3.0)

  const fatigueIndex = clamp(prev.fatigueIndex + rand(0.0003, 0.0007), 0, 1)
  return { stress, vibration, fatigueIndex }
}

function gradualStressMode(prev, tick) {
  // Steady deterministic ramp: +0.5–1.3 MPa/tick — immediately visible upward trend
  const rampRate = 0.5 + Math.random() * 0.8
  const oscillation = Math.sin(tick * 0.18) * 2.5   // minor oscillation on the ramp
  const noise = (Math.random() - 0.38) * 2.2         // slight upward bias
  const newStress = clamp(prev.stress + rampRate + oscillation * 0.4 + noise, 18, 98)

  // Vibration scales with stress magnitude (structural micro-cracking)
  const vibScale = Math.max(0, (newStress - 28) / 65)
  const vibration = clamp(brownian(prev.vibration, 0.9 + vibScale * 6, 0.22, 0.3), 0.5, 8.5)

  const fatigueIncrease = 0.0018 + Math.max(0, newStress - 45) * 0.00025
  const fatigueIndex = clamp(prev.fatigueIndex + fatigueIncrease, 0, 1)
  return { stress: newStress, vibration, fatigueIndex }
}

function stressSpikeMode(prev, tick) {
  // 12-tick impact cycle: dramatic spikes followed by rapid decay to quiet baseline.
  // Immediately distinguishable — cycle starts at tick 0 → first reading is a spike.
  const cycle = tick % 12
  let stress, vibration

  if (cycle < 2) {
    // Impact event (truck/seismic mini-pulse)
    stress    = clamp(80 + rand(0, 16) + transient(0.4, 8), 72, 100)
    vibration = clamp(5.8 + rand(0, 3.5), 4.5, 12)
  } else if (cycle < 4) {
    // Aftershock: quick structural rebound
    stress    = clamp(46 + rand(-8, 14), 30, 66)
    vibration = clamp(2.8 + rand(-0.5, 1.5), 1.8, 5.5)
  } else {
    // Quiet inter-event baseline with residual vibration decay
    const decay = Math.max(0, 1.0 - (cycle - 4) * 0.2)
    stress    = clamp(21 + Math.sin(tick * 0.38) * 6 + rand(-2, 2.5), 10, 40)
    vibration = clamp(0.65 + decay * 1.2 + rand(-0.1, 0.15), 0.4, 3.2)
  }

  const fatigueIndex = clamp(prev.fatigueIndex + rand(0.006, 0.013), 0, 1)
  return { stress, vibration, fatigueIndex }
}

function progressiveFatigueMode(prev, tick) {
  // Stress stays moderate but FATIGUE explodes — health crashes fast via the formula.
  // Vibration rises as fatigue simulates micro-crack resonance.
  const structural = multiOctave(tick, 0.09, 0.22, 0.61, 4, 2, 1)
  const stress = clamp(33 + structural + rand(-2.5, 2.5), 20, 56)

  // Fatigue-driven resonance: vibration grows strongly with accumulated damage
  const resonance  = prev.fatigueIndex * 6.2
  const vibration  = clamp(brownian(prev.vibration, 1.4 + resonance, 0.2, 0.25), 0.9, 8.0)

  // Very fast fatigue — this is the defining characteristic
  const rampFatigue = clamp(prev.fatigueIndex + rand(0.018, 0.030), 0, 1)
  return { stress, vibration, fatigueIndex: rampFatigue }
}

function failureMode(prev, tick) {
  // Starts at critical levels (initial node sets stress=62), escalates chaotically.
  // Right-skewed noise: mostly goes up, occasional partial recovery to look realistic.
  const surge   = rand(1.0, 3.5)
  const chaos   = (Math.random() * Math.random() - 0.15) * 14   // right-skewed
  const newStress = clamp(prev.stress + surge + chaos, 50, 100)

  // Erratic vibration: structural failure causes unpredictable resonance jumps
  const vibJump = rand(-1.8, 3.2) + (newStress / 100) * 2.5
  const vibration = clamp(prev.vibration + vibJump * 0.45, 3.0, 12)

  const fatigueIndex = clamp(prev.fatigueIndex + rand(0.024, 0.042), 0, 1)
  return { stress: newStress, vibration, fatigueIndex }
}

const modeGenerators = {
  [SIMULATION_MODES.NORMAL]: normalMode,
  [SIMULATION_MODES.GRADUAL_STRESS]: gradualStressMode,
  [SIMULATION_MODES.STRESS_SPIKE]: stressSpikeMode,
  [SIMULATION_MODES.PROGRESSIVE_FATIGUE]: progressiveFatigueMode,
  [SIMULATION_MODES.FAILURE]: failureMode,
}

// ---------- alert engine ----------
const ALERT_COOLDOWN_MS = 30_000

export function generateAlerts(node, prev, thresholds, existingAlerts) {
  const now = Date.now()
  const alerts = []

  const recentIds = new Set(
    existingAlerts
      .filter((a) => now - a.timestamp < ALERT_COOLDOWN_MS)
      .map((a) => a.type + a.nodeId + a.triggerKey)
  )

  const push = (type, triggerKey, message, recommendation) => {
    const dedupeKey = type + node.id + triggerKey
    if (!recentIds.has(dedupeKey)) {
      alerts.push({
        id: `ALT-${now}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        timestamp: now,
        nodeId: node.id,
        type,
        triggerKey,
        message,
        recommendation,
      })
      recentIds.add(dedupeKey)
    }
  }

  // 1. Stress warning
  if (node.stress > thresholds.warning && node.stress <= thresholds.critical) {
    push('Warning', 'stress_warn',
      `NODE ${node.id}: Stress at ${node.stress.toFixed(1)} MPa (warning threshold ${thresholds.warning})`,
      'Reduce load on affected span. Increase inspection frequency.')
  }

  // 2. Stress critical
  if (node.stress > thresholds.critical) {
    push('Critical', 'stress_crit',
      `CRITICAL — NODE ${node.id}: Stress at ${node.stress.toFixed(1)} MPa exceeds critical threshold`,
      'Immediate load reduction required. Consider structural shutdown protocol.')
  }

  // 3. Health critical
  if (node.healthIndex < thresholds.minHealth) {
    push('Critical', 'health_crit',
      `CRITICAL — NODE ${node.id}: Health index degraded to ${node.healthIndex.toFixed(1)}%`,
      'Schedule priority inspection. Cross-check sensor calibration.')
  }

  // 4. Vibration spike >50% vs previous
  if (prev && prev.vibration > 0) {
    const vibDelta = (node.vibration - prev.vibration) / prev.vibration
    if (vibDelta > 0.5) {
      push('Warning', 'vib_spike',
        `NODE ${node.id}: Vibration spike detected — ${prev.vibration.toFixed(2)} → ${node.vibration.toFixed(2)} mm/s (${(vibDelta * 100).toFixed(0)}% increase)`,
        'Check for resonance conditions. Inspect anchor points and damper integrity.')
    }
  }

  return alerts
}

// ---------- main tick ----------
// ┌─────────────────────────────────────────────────────────────────┐
// │  SENSOR DATA ENTRY POINT — OPTION B (direct replacement)        │
// │                                                                 │
// │  Replace the single line:                                       │
// │    const { stress, vibration, fatigueIndex } =                  │
// │        generator(prevNode, t)                                   │
// │  with:                                                          │
// │    const { stress, vibration, fatigueIndex } =                  │
// │        await fetchSensorReading(prevNode.id)                    │
// │                                                                 │
// │  Where fetchSensorReading returns the three raw sensor values.  │
// │  The rest of tick() — health calc, risk level, alert engine,    │
// │  snapshot — is sensor-agnostic and needs no changes.            │
// └─────────────────────────────────────────────────────────────────┘
export function tick(state) {
  const { nodes, simulationMode, thresholds, alerts, tickCount } = state
  const t = tickCount

  const generator = modeGenerators[simulationMode] || modeGenerators[SIMULATION_MODES.NORMAL]
  const prevNode = nodes[0]

  // ← REPLACE THIS LINE with your real sensor fetch in production
  const { stress, vibration, fatigueIndex } = generator(prevNode, t)
  const healthIndex = calcHealthIndex(stress, vibration, fatigueIndex)
  const riskLevel = calcRiskLevel(healthIndex)

  const updatedNode = {
    ...prevNode,
    stress: parseFloat(stress.toFixed(2)),
    vibration: parseFloat(vibration.toFixed(3)),
    fatigueIndex: parseFloat(fatigueIndex.toFixed(4)),
    healthIndex: parseFloat(healthIndex.toFixed(2)),
    riskLevel,
  }

  const newAlerts = generateAlerts(updatedNode, prevNode, thresholds, alerts)

  const snapshot = {
    time: new Date().toLocaleTimeString(),
    timestamp: Date.now(),
    stress: updatedNode.stress,
    vibration: updatedNode.vibration,
    fatigueIndex: updatedNode.fatigueIndex,
    healthIndex: updatedNode.healthIndex,
    riskLevel,
    mode: simulationMode,
  }

  return {
    updatedNode,
    newAlerts,
    snapshot,
  }
}
