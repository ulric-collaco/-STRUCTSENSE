import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const HEALTH_COLORS = {
  Healthy: '#00FF6A',
  Moderate: '#FFD600',
  Critical: '#FF2D2D',
}

// Individual bridge segment with vibration
function BridgeSegment({ position, size, riskLevel, vibrationAmplitude, phaseOffset = 0 }) {
  const meshRef = useRef()
  const color = HEALTH_COLORS[riskLevel] || '#00FF6A'
  const isCritical = riskLevel === 'Critical'

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const amp = Math.min(vibrationAmplitude * 0.04, 0.15)
    meshRef.current.position.y = position[1] + Math.sin(t * 8 + phaseOffset) * amp
    // subtle rotation shiver on critical
    if (isCritical) {
      meshRef.current.rotation.z = Math.sin(t * 12 + phaseOffset) * 0.008
    } else {
      meshRef.current.rotation.z = 0
    }
  })

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isCritical ? 0.4 : 0.15}
        roughness={0.6}
        metalness={0.8}
      />
    </mesh>
  )
}

// Vertical tower/pylon
function TowerSegment({ position, height, riskLevel, vibrationAmplitude, phaseOffset }) {
  const meshRef = useRef()
  const color = HEALTH_COLORS[riskLevel] || '#00FF6A'

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const amp = Math.min(vibrationAmplitude * 0.02, 0.06)
    meshRef.current.rotation.z = Math.sin(t * 6 + phaseOffset) * amp
  })

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[0.18, height, 0.18]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.1}
        roughness={0.5}
        metalness={0.9}
      />
    </mesh>
  )
}

export default function BridgeModel({ riskLevel, vibration }) {
  const vib = vibration || 1

  return (
    <group>
      {/* === DECK / MAIN SPAN === */}
      {/* Left approach */}
      <BridgeSegment
        position={[-4.5, 0, 0]}
        size={[2.8, 0.22, 0.9]}
        riskLevel={riskLevel}
        vibrationAmplitude={vib}
        phaseOffset={0}
      />
      {/* Center span */}
      <BridgeSegment
        position={[0, 0, 0]}
        size={[3.6, 0.22, 0.9]}
        riskLevel={riskLevel}
        vibrationAmplitude={vib * 1.4}
        phaseOffset={0.8}
      />
      {/* Right approach */}
      <BridgeSegment
        position={[4.5, 0, 0]}
        size={[2.8, 0.22, 0.9]}
        riskLevel={riskLevel}
        vibrationAmplitude={vib}
        phaseOffset={1.6}
      />

      {/* === PYLONS / TOWERS === */}
      <TowerSegment
        position={[-1.85, 1.1, 0]}
        height={2.0}
        riskLevel={riskLevel}
        vibrationAmplitude={vib}
        phaseOffset={0.2}
      />
      <TowerSegment
        position={[1.85, 1.1, 0]}
        height={2.0}
        riskLevel={riskLevel}
        vibrationAmplitude={vib}
        phaseOffset={1.1}
      />

      {/* === CROSS BEAM at top of pylons === */}
      <BridgeSegment
        position={[0, 2.1, 0]}
        size={[4.2, 0.14, 0.14]}
        riskLevel={riskLevel}
        vibrationAmplitude={vib * 0.5}
        phaseOffset={0.5}
      />

      {/* === SUPPORT PIERS === */}
      {[-5.8, 5.8].map((x, i) => (
        <mesh key={i} position={[x, -0.75, 0]}>
          <boxGeometry args={[0.4, 1.3, 0.4]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.2} />
        </mesh>
      ))}
      {[-1.85, 1.85].map((x, i) => (
        <mesh key={`p${i}`} position={[x, -0.72, 0]}>
          <boxGeometry args={[0.35, 1.25, 0.35]} />
          <meshStandardMaterial color="#222" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}

      {/* === GROUND PLANE === */}
      <mesh position={[0, -1.4, 0]} receiveShadow>
        <boxGeometry args={[18, 0.08, 3]} />
        <meshStandardMaterial color="#141414" roughness={1} metalness={0} />
      </mesh>

      {/* === SUSPENSION CABLES === */}
      {[-2.8, -1.4, 0, 1.4, 2.8].map((x, i) => (
        <mesh key={`c${i}`} position={[x, 1.05, 0]} rotation={[0, 0, Math.atan2(1.05, x - (x > 0 ? 1.85 : -1.85))]}>
          <cylinderGeometry args={[0.015, 0.015, Math.sqrt(Math.pow(x - (x > 0 ? 1.85 : -1.85), 2) + 1.05 * 1.05), 4]} />
          <meshStandardMaterial
            color={HEALTH_COLORS[riskLevel]}
            emissive={HEALTH_COLORS[riskLevel]}
            emissiveIntensity={0.05}
            roughness={0.4}
            metalness={1}
          />
        </mesh>
      ))}
    </group>
  )
}
