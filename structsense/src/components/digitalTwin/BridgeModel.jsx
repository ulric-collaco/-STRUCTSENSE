import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const HEALTH_COLORS = {
  Healthy: '#00FF6A',
  Moderate: '#FFD600',
  Critical: '#FF2D2D',
}

// Deck segment that oscillates vertically
function DeckSegment({ posX, posY, width, vibAmp, phase, color, isCritical }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = posY + Math.sin(clock.elapsedTime * 8 + phase) * vibAmp
    if (isCritical) {
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 11 + phase) * 0.006
    } else {
      ref.current.rotation.z = 0
    }
  })
  return (
    <mesh ref={ref} position={[posX, posY, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, 0.22, 1.1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isCritical ? 0.4 : 0.14}
        roughness={0.5}
        metalness={0.8}
      />
    </mesh>
  )
}

// Single pylon — two legs + crossbeams, rooted at deckY, rising upward
// Legs spread in Z direction (across-bridge) to straddle the deck width
function Pylon({ x, deckY, height, color, vibAmp, phase, isCritical }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    // top of pylon sways; pivot is at base (deckY)
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 4.5 + phase) * vibAmp * 0.25
  })

  const LEG_W = 0.17
  const LEG_SPACING = 0.85   // spread in Z to straddle the 1.1-wide deck
  const mat = (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={isCritical ? 0.28 : 0.1}
      roughness={0.45}
      metalness={0.85}
    />
  )

  return (
    // group pivots at deck surface so rotation feels like sway from base
    <group ref={ref} position={[x, deckY, 0]}>
      {/* Front leg (z+) */}
      <mesh position={[0, height / 2, LEG_SPACING / 2]} castShadow>
        <boxGeometry args={[LEG_W, height, LEG_W]} />
        {mat}
      </mesh>
      {/* Back leg (z-) */}
      <mesh position={[0, height / 2, -LEG_SPACING / 2]} castShadow>
        <boxGeometry args={[LEG_W, height, LEG_W]} />
        {mat}
      </mesh>
      {/* Upper crossbeam — near top, spans Z between legs */}
      <mesh position={[0, height - 0.22, 0]}>
        <boxGeometry args={[LEG_W * 1.3, LEG_W * 0.9, LEG_SPACING + LEG_W]} />
        {mat}
      </mesh>
      {/* Lower crossbeam — near deck level, spans Z between legs */}
      <mesh position={[0, height * 0.28, 0]}>
        <boxGeometry args={[LEG_W, LEG_W * 0.7, LEG_SPACING + LEG_W]} />
        {mat}
      </mesh>
    </group>
  )
}

// Stay cable between two world-space points using geometry + rotation math
function StayCable({ x1, y1, x2, y2, z, color }) {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) - Math.PI / 2 // cylinder axis is Y, rotate to align

  return (
    <mesh
      position={[(x1 + x2) / 2, (y1 + y2) / 2, z]}
      rotation={[0, 0, angle]}
    >
      <cylinderGeometry args={[0.016, 0.016, length, 4]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.07}
        roughness={0.3}
        metalness={1}
      />
    </mesh>
  )
}

export default function BridgeModel({ riskLevel, vibration }) {
  const color = HEALTH_COLORS[riskLevel] || '#00FF6A'
  const isCritical = riskLevel === 'Critical'
  const amp = Math.min((vibration || 1) * 0.011, 0.07)

  const DECK_Y = 0
  const PYLON_H = 3.4
  // Pylon base sits on deck surface
  const PYLON_TOP_Y = DECK_Y + PYLON_H
  const PX = [-2.4, 2.4] // pylon X positions

  // Stay cable anchor points along the deck
  const L_ANCHORS = [-6.2, -5.0, -3.8, -2.9]
  const R_ANCHORS = [6.2, 5.0, 3.8, 2.9]

  return (
    <group>

      {/* ── DECK — three spans, precisely meeting at pylon X positions (±2.4) and ends (±7.0) ── */}
      {/* Left span: -7.0 → -2.4, center=-4.7, width=4.6 */}
      <DeckSegment posX={-4.7} posY={DECK_Y} width={4.6} vibAmp={amp * 0.55} phase={0}   color={color} isCritical={isCritical} />
      {/* Center span: -2.4 → 2.4, center=0, width=4.8 */}
      <DeckSegment posX={0}    posY={DECK_Y} width={4.8} vibAmp={amp * 1.15} phase={0.85} color={color} isCritical={isCritical} />
      {/* Right span: 2.4 → 7.0, center=4.7, width=4.6 */}
      <DeckSegment posX={4.7}  posY={DECK_Y} width={4.6} vibAmp={amp * 0.55} phase={1.7}  color={color} isCritical={isCritical} />

      {/* ── PYLONS — rooted at deck, rising upward ── */}
      <Pylon x={PX[0]} deckY={DECK_Y} height={PYLON_H} color={color} vibAmp={amp} phase={0.3}  isCritical={isCritical} />
      <Pylon x={PX[1]} deckY={DECK_Y} height={PYLON_H} color={color} vibAmp={amp} phase={1.15} isCritical={isCritical} />

      {/* ── STAY CABLES — front face aligned with front pylon leg (z = +0.425) ── */}
      {L_ANCHORS.map((ax, i) => (
        <StayCable key={`lf${i}`} x1={PX[0]} y1={PYLON_TOP_Y} x2={ax} y2={DECK_Y + 0.11} z={0.425} color={color} />
      ))}
      {R_ANCHORS.map((ax, i) => (
        <StayCable key={`rf${i}`} x1={PX[1]} y1={PYLON_TOP_Y} x2={ax} y2={DECK_Y + 0.11} z={0.425} color={color} />
      ))}

      {/* ── STAY CABLES — back face aligned with back pylon leg (z = -0.425) ── */}
      {L_ANCHORS.map((ax, i) => (
        <StayCable key={`lb${i}`} x1={PX[0]} y1={PYLON_TOP_Y} x2={ax} y2={DECK_Y + 0.11} z={-0.425} color={color} />
      ))}
      {R_ANCHORS.map((ax, i) => (
        <StayCable key={`rb${i}`} x1={PX[1]} y1={PYLON_TOP_Y} x2={ax} y2={DECK_Y + 0.11} z={-0.425} color={color} />
      ))}

      {/* ── ABUTMENT PIERS (below deck at ends) ── */}
      {[-7.0, 7.0].map((px, i) => (
        <mesh key={`ab${i}`} position={[px, DECK_Y - 0.9, 0]}>
          <boxGeometry args={[0.55, 1.6, 1.0]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.9} metalness={0.1} />
        </mesh>
      ))}
      {/* Footing pads */}
      {[-7.0, 7.0].map((px, i) => (
        <mesh key={`fp${i}`} position={[px, DECK_Y - 1.78, 0]}>
          <boxGeometry args={[1.1, 0.2, 1.5]} />
          <meshStandardMaterial color="#151515" roughness={1} metalness={0} />
        </mesh>
      ))}

      {/* ── GROUND ── */}
      <mesh position={[0, DECK_Y - 1.9, 0]} receiveShadow>
        <boxGeometry args={[22, 0.06, 4.5]} />
        <meshStandardMaterial color="#0f0f0f" roughness={1} metalness={0} />
      </mesh>

    </group>
  )
}
