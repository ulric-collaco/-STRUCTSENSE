import { create } from 'zustand'
import {
  tick,
  calcRUL,
  SIMULATION_MODES,
  DEFAULT_THRESHOLDS,
} from '../simulation/engine.js'

const MAX_HISTORY = 200

const INITIAL_NODE = {
  id: 'NODE_1',
  stress: 28.5,
  vibration: 1.4,
  fatigueIndex: 0.05,
  healthIndex: 82.5,
  riskLevel: 'Healthy',
}

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

    // Restart interval with same speed but new mode
    const wasRunning = state.isRunning
    if (wasRunning) {
      clearInterval(state._intervalId)
    }

    set({ simulationMode: mode, _intervalId: null, isRunning: false, tickCount: 0 })

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
