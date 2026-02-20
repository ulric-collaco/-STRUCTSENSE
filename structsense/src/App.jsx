import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Analytics from './pages/Analytics.jsx'
import History from './pages/History.jsx'
import Settings from './pages/Settings.jsx'
import About from './pages/About.jsx'
import useStore from './store/useStore.js'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  // Cleanup on unmount (page unload)
  useEffect(() => {
    return () => {
      useStore.getState().stopSimulation()
    }
  }, [])

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: '#0d0d0d', minHeight: '100vh' }}>
      <ScrollToTop />
      {!isLanding && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}
