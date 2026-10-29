import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AuditGatesProps {
  currentStage: 'fairness' | 'explain' | 'robustness' | 'compliance' | 'modelcard' | 'complete' | string;
  progress: number;
}

const GATES = [
  { id: 'fairness', label: '1. Fairness', color: '#06b6d4', x: -3.5 },
  { id: 'explain', label: '2. SHAP & Proxy', color: '#38bdf8', x: -2.1 },
  { id: 'robustness', label: '3. Robustness', color: '#6366f1', x: -0.7 },
  { id: 'compliance', label: '4. EU AI Act', color: '#a855f7', x: 0.7 },
  { id: 'dpdp', label: '5. DPDP 2023', color: '#ec4899', x: 2.1 },
  { id: 'modelcard', label: '6. Model Card', color: '#10b981', x: 3.5 }
];

function GatesScene({ currentStage, progress }: AuditGatesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Determine which gate index is reached
  const stageOrder = ['fairness', 'explain', 'robustness', 'compliance', 'dpdp', 'modelcard', 'complete'];
  const activeGateIdx = stageOrder.indexOf(currentStage) !== -1 ? stageOrder.indexOf(currentStage) : Math.floor(progress / 17);

  // Generate stream of points flowing through the gates
  const pointCount = 1800;
  const positions = useMemo(() => {
    const pos = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8.5; // X span across gates
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pointCount; i++) {
        // Stream points left to right
        pos[i * 3] += delta * 2.2;
        if (pos[i * 3] > 4.5) {
          pos[i * 3] = -4.5;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 6 Sequential Verification Gates */}
      {GATES.map((gate, idx) => {
        const isPassed = idx <= activeGateIdx;
        const isCurrent = idx === activeGateIdx;
        const gateColor = isPassed ? (isCurrent ? '#38bdf8' : '#10b981') : '#334155';

        return (
          <group key={gate.id} position={[gate.x, 0, 0]}>
            {/* Gate Arch Ring */}
            <mesh>
              <torusGeometry args={[0.9, 0.04, 16, 32]} />
              <meshBasicMaterial
                color={gateColor}
                transparent
                opacity={isPassed ? 0.9 : 0.3}
              />
            </mesh>

            {/* Glowing Gate Center Field */}
            {isPassed && (
              <mesh>
                <circleGeometry args={[0.85, 32]} />
                <meshBasicMaterial
                  color={isCurrent ? '#0284c7' : '#059669'}
                  transparent
                  opacity={isCurrent ? 0.25 : 0.15}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Particle Stream Flowing Through Gates */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#38bdf8"
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export const AuditGates3D: React.FC<AuditGatesProps> = ({ currentStage, progress }) => {
  return (
    <div className="w-full h-44 sm:h-52 relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950/90 shadow-xl">
      <div className="absolute top-2 left-3 z-10 font-mono text-[10px] text-cyan-400 flex items-center gap-2 tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        Sequential Gate Pipeline: {currentStage.toUpperCase()} ({progress}%)
      </div>
      <div className="absolute bottom-2 inset-x-3 z-10 flex justify-between text-[9px] font-mono text-slate-400">
        {GATES.map((g) => (
          <span key={g.id} className="text-center">{g.label}</span>
        ))}
      </div>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 48 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.6} />
        <GatesScene currentStage={currentStage} progress={progress} />
      </Canvas>
    </div>
  );
};
