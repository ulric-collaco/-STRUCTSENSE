import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

const COLORS = {
  Healthy: '#00FF6A',
  Moderate: '#FFD600',
  Critical: '#FF2D2D',
}

export default function NodeMarker({ node, position = [0, 0.35, 0.6] }) {
  const meshRef = useRef()
  const ringRef = useRef()
  const { riskLevel, stress, healthIndex } = node
  const color = COLORS[riskLevel] || '#00FF6A'

  useFrame((state) => {
    if (!meshRef.current || !ringRef.current) return
    const t = state.clock.elapsedTime

    // pulse scale
    const scale = 1 + Math.sin(t * (riskLevel === 'Critical' ? 4 : 2)) * 0.18
    meshRef.current.scale.setScalar(scale)

    // ring expand and fade
    const ringScale = 1 + ((t * (riskLevel === 'Critical' ? 1.5 : 0.8)) % 1.2)
    ringRef.current.scale.setScalar(ringScale)
    ringRef.current.material.opacity = Math.max(0, 1 - (ringScale - 1) / 1.2)
  })

  return (
    <group position={position}>
      {/* Pulse ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.12, 0.012, 8, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Core dot */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>

      {/* HTML label */}
      <Html
        position={[0, 0.28, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px',
            fontWeight: 700,
            color: color,
            background: 'rgba(13,13,13,0.88)',
            border: `1px solid ${color}`,
            padding: '3px 6px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.08em',
            lineHeight: 1.4,
          }}
        >
          <div style={{ color: '#888', fontSize: '8px', letterSpacing: '0.15em' }}>NODE_1</div>
          <div>{stress.toFixed(1)} MPa</div>
          <div style={{ color }}>{healthIndex.toFixed(0)}% HLT</div>
        </div>
      </Html>
    </group>
  )
}
