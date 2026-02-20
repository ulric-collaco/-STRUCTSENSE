import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import BridgeModel from './BridgeModel.jsx'
import NodeMarker from './NodeMarker.jsx'
import useStore from '../../store/useStore.js'

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[8, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-6, 4, 2]} intensity={0.5} color="#FFD600" />
      <pointLight position={[6, 4, 2]} intensity={0.3} color="#00aaff" />
    </>
  )
}

function SceneFloor() {
  return (
    <Grid
      args={[20, 20]}
      position={[0, -1.46, 0]}
      cellSize={1}
      cellThickness={0.4}
      cellColor="#1a1a1a"
      sectionSize={4}
      sectionThickness={0.8}
      sectionColor="#FFD600"
      fadeDistance={18}
      fadeStrength={1}
      infiniteGrid={false}
    />
  )
}

export default function Scene() {
  const node = useStore((s) => s.nodes[0])

  return (
    <div style={{ width: '100%', height: '100%', background: '#0d0d0d' }}>
      <Canvas
        shadows
        camera={{ position: [0, 2.5, 11], fov: 48 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0d0d0d' }}
      >
        <color attach="background" args={['#0d0d0d']} />
        <fog attach="fog" args={['#0d0d0d', 14, 28]} />

        <Suspense fallback={null}>
          <Lights />
          <SceneFloor />

          <BridgeModel riskLevel={node.riskLevel} vibration={node.vibration} />
          {/* Sensor node on the deck surface at mid-span center (deck top = y 0.11, marker at 0.22) */}
          <NodeMarker node={node} position={[0, 0.22, 0]} />

          <OrbitControls
            enablePan={false}
            minDistance={5}
            maxDistance={16}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.1}
            autoRotate={false}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
