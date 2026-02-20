// StructSense Simulation Engine
// Pure client-side simulation — no hardware, no API

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

// ---------- health & risk ----------
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
  if (stressHistory.length < 4) return { text: 'Collecting data...', value: null }

  const recent = stressHistory.slice(-6)
  const n = recent.length
  const sumX = (n * (n - 1)) / 2
  const sumY = recent.reduce((a, v) => a + v, 0)
  const sumXY = recent.reduce((a, v, i) => a + i * v, 0)
  const sumX2 = recent.reduce((a, _, i) => a + i * i, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

  if (slope <= 0.2) {
    return { text: 'Stable Condition', value: null }
  }

  const current = recent[recent.length - 1]
  const rul = (criticalThreshold - current) / slope
  if (rul <= 0) return { text: 'THRESHOLD EXCEEDED', value: 0 }
  const updates = Math.round(rul)
  const seconds = updates * 2
  if (seconds < 60) return { text: `~${seconds}s remaining`, value: seconds }
  const mins = Math.round(seconds / 60)
  return { text: `~${mins}m remaining`, value: seconds }
}

// ---------- mode-specific generators ----------
// Each returns { stress, vibration, fatigueIndex } delta / absolute

function normalMode(prev, tick) {
  const baseStress = 28
  const oscillation = Math.sin(tick * 0.3) * 8 + Math.sin(tick * 0.7) * 4
  const stress = clamp(jitter(baseStress + oscillation, 2), 10, 50)
  const vibration = clamp(jitter(1.5 + Math.sin(tick * 0.5) * 0.5, 0.2), 0.5, 3)
  const fatigueIndex = clamp(prev.fatigueIndex + rand(0.001, 0.003), 0, 1)
  return { stress, vibration, fatigueIndex }
}

function gradualStressMode(prev, tick) {
  const rampStress = clamp(20 + tick * 0.8, 20, 95)
  const stress = clamp(jitter(rampStress, 3), 15, 95)
  const vibration = clamp(1 + (rampStress / 95) * 5 + rand(-0.3, 0.3), 0.5, 7)
  const fatigueIncrease = 0.003 + (rampStress / 95) * 0.008
  const fatigueIndex = clamp(prev.fatigueIndex + fatigueIncrease, 0, 1)
  return { stress, vibration, fatigueIndex }
}

function stressSpikeMode(prev, tick) {
  const cycle = tick % 20
  let baseStress
  if (cycle < 3) {
    baseStress = 85 + rand(0, 10)
  } else if (cycle < 6) {
    baseStress = 40 + rand(-5, 5)
  } else {
    baseStress = 25 + Math.sin(tick * 0.4) * 10
  }
  const stress = clamp(jitter(baseStress, 4), 10, 100)
  const vibration = clamp(0.8 + (stress / 100) * 6 + rand(-0.5, 0.5), 0.5, 8)
  const fatigueIndex = clamp(prev.fatigueIndex + rand(0.004, 0.009), 0, 1)
  return { stress, vibration, fatigueIndex }
}

function progressiveFatigueMode(prev, tick) {
  const stress = clamp(jitter(35, 8), 20, 60)
  const vibration = clamp(jitter(2.5, 0.5), 1, 4)
  const rampFatigue = clamp(prev.fatigueIndex + rand(0.008, 0.015), 0, 1)
  return { stress, vibration, fatigueIndex: rampFatigue }
}

function failureMode(prev, tick) {
  const rampFactor = clamp(tick * 0.05, 0, 1)
  const stress = clamp(50 + rampFactor * 48 + rand(-3, 3), 40, 100)
  const vibration = clamp(3 + rampFactor * 9 + rand(-0.5, 0.5), 2, 12)
  const fatigueIndex = clamp(0.4 + rampFactor * 0.6 + rand(0, 0.01), 0, 1)
  return { stress, vibration, fatigueIndex }
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
export function tick(state) {
  const { nodes, simulationMode, thresholds, alerts, tickCount } = state
  const t = tickCount

  const generator = modeGenerators[simulationMode] || modeGenerators[SIMULATION_MODES.NORMAL]
  const prevNode = nodes[0]

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
