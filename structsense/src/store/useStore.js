import { create } from 'zustand'
import {
  tick,
  calcRUL,
  calcHealthIndex,
  calcRiskLevel,
  SIMULATION_MODES,
  DEFAULT_THRESHOLDS,
} from '../simulation/engine.js'

// Starting node state for each mode — ensures modes are visually distinct immediately
const MODE_INIT = {
  [SIMULATION_MODES.NORMAL]:              { stress: 28.0, vibration: 1.40, fatigueIndex: 0.04 },
  [SIMULATION_MODES.GRADUAL_STRESS]:      { stress: 21.5, vibration: 1.05, fatigueIndex: 0.06 },
  [SIMULATION_MODES.STRESS_SPIKE]:        { stress: 83.0, vibration: 6.20, fatigueIndex: 0.08 }, // start mid-spike
  [SIMULATION_MODES.PROGRESSIVE_FATIGUE]:{ stress: 34.0, vibration: 2.30, fatigueIndex: 0.14 },
  [SIMULATION_MODES.FAILURE]:             { stress: 63.0, vibration: 5.10, fatigueIndex: 0.40 },
}

function makeNode(id, vals) {
  const healthIndex = parseFloat(calcHealthIndex(vals.stress, vals.vibration, vals.fatigueIndex).toFixed(2))
  return { id, ...vals, healthIndex, riskLevel: calcRiskLevel(healthIndex) }
}

const MAX_HISTORY = 200

const INITIAL_NODE = makeNode('NODE_1', MODE_INIT[SIMULATION_MODES.NORMAL])

const useStore = create((set, get) => ({
  // ----- state -----
  nodes: [INITIAL_NODE],
  alerts: [],
  thresholds: { ...DEFAULT_THRESHOLDS },
  simulationMode: SIMULATION_MODES.NORMAL,
  simulationSpeed: 1,
  historicalData: [],
  isRunning: false,
  tickCount: 0,
  sessionHistory: [],
  _intervalId: null,

  // ----- rul -----
  get rul() {
    const state = get()
    const stressHistory = state.historicalData.map((d) => d.stress)
    return calcRUL(stressHistory, state.thresholds.critical)
  },

  // ----- actions -----
  startSimulation: () => {
    const state = get()
    if (state._intervalId) return // already running

    const intervalMs = Math.round(2000 / state.simulationSpeed)

    const id = setInterval(() => {
      const s = get()
      const result = tick({
        nodes: s.nodes,
        simulationMode: s.simulationMode,
        thresholds: s.thresholds,
        alerts: s.alerts,
        tickCount: s.tickCount,
      })

      const newHistory = [...s.historicalData, result.snapshot].slice(-MAX_HISTORY)
      const alertsCapped = [...s.alerts, ...result.newAlerts].slice(-100)

      set({
        nodes: [result.updatedNode],
        alerts: alertsCapped,
        historicalData: newHistory,
        tickCount: s.tickCount + 1,
      })
    }, intervalMs)

    set({ isRunning: true, _intervalId: id })
  },

  stopSimulation: () => {
    const { _intervalId } = get()
    if (_intervalId) {
      clearInterval(_intervalId)
    }
    set({ isRunning: false, _intervalId: null })
  },

  toggleRunning: () => {
    const { isRunning, startSimulation, stopSimulation } = get()
    if (isRunning) {
      stopSimulation()
    } else {
      startSimulation()
    }
  },

  setSimulationMode: (mode) => {
    const state = get()
    const prevMode = state.simulationMode
    if (prevMode === mode) return

    // Save session snapshot before switching mode
    if (state.historicalData.length > 0) {
      const stressVals = state.historicalData.map((d) => d.stress)
      const healthVals = state.historicalData.map((d) => d.healthIndex)
      const recentAlerts = state.alerts.filter(
        (a) => a.timestamp > (state.historicalData[0]?.timestamp ?? 0)
      )

      const snapshot = {
        id: `SES-${Date.now()}`,
        mode: prevMode,
        maxStress: Math.max(...stressVals).toFixed(2),
        minHealth: Math.min(...healthVals).toFixed(2),
        alertCount: recentAlerts.length,
        duration: state.historicalData.length,
        timestamp: Date.now(),
        endedAt: new Date().toLocaleString(),
      }

      set((s) => ({
        sessionHistory: [snapshot, ...s.sessionHistory].slice(0, 50),
      }))
    }

    // Reset node to mode-appropriate initial values so difference is visible immediately
    const initVals = MODE_INIT[mode] || MODE_INIT[SIMULATION_MODES.NORMAL]
    const freshNode = makeNode('NODE_1', initVals)

    // Restart interval with new mode
    const wasRunning = state.isRunning
    if (wasRunning) clearInterval(state._intervalId)

    set({
      simulationMode: mode,
      nodes: [freshNode],
      historicalData: [],
      alerts: [],
      tickCount: 0,
      _intervalId: null,
      isRunning: false,
    })

    if (wasRunning) {
      setTimeout(() => get().startSimulation(), 50)
    }
  },

  setSimulationSpeed: (speed) => {
    const state = get()
    const wasRunning = state.isRunning
    if (wasRunning) {
      clearInterval(state._intervalId)
    }
    set({ simulationSpeed: speed, _intervalId: null, isRunning: false })
    if (wasRunning) {
      setTimeout(() => get().startSimulation(), 50)
    }
  },

  setThresholds: (thresholds) => {
    set({ thresholds })
  },

  clearAlerts: () => {
    set({ alerts: [] })
  },

  resetSystem: () => {
    const { _intervalId } = get()
    if (_intervalId) clearInterval(_intervalId)
    set({
      nodes: [INITIAL_NODE],
      alerts: [],
      thresholds: { ...DEFAULT_THRESHOLDS },
      simulationMode: SIMULATION_MODES.NORMAL,
      simulationSpeed: 1,
      historicalData: [],
      isRunning: false,
      tickCount: 0,
      sessionHistory: [],
      _intervalId: null,
    })
  },
}))

export default useStore
