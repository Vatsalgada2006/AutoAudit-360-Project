import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ThreeErrorBoundary } from './ThreeErrorBoundary';
import { AuditLens2D } from './AuditLens2D';
import { Scale, Search, ShieldAlert, BookOpen, CheckCircle2, Clock } from 'lucide-react';

interface AuditLensProps {
  stage: number; // 0 to 5
  isAuditing: boolean;
  onLayerClick?: (stageKey: 'fairness' | 'explain' | 'stresstest' | 'lawcheck') => void;
}

// 3D Optical Elements
function OpticalLensMesh({ stage, isAuditing }: { stage: number; isAuditing: boolean }) {
  const outerBrassRingRef = useRef<THREE.Mesh>(null);
  const midFilterRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const rotSpeed = isAuditing ? 1.2 : 0.2;
    if (outerBrassRingRef.current) {
      outerBrassRingRef.current.rotation.z += delta * rotSpeed;
    }
    if (midFilterRef.current) {
      midFilterRef.current.rotation.z -= delta * (rotSpeed * 0.7);
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.z += delta * (rotSpeed * 0.4);
    }
  });

  // Dynamic brass & glass colors based on stages
  const coreColor = stage >= 1 ? '#496F5A' : '#C9A66B';
  const midColor = stage >= 2 ? '#496F5A' : '#C9A66B';
  const outerColor = stage >= 4 ? '#496F5A' : '#C9A66B';

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Brass Bezel */}
      <mesh ref={outerBrassRingRef}>
        <torusGeometry args={[2.2, 0.08, 16, 64]} />
        <meshStandardMaterial
          color="#C9A66B"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Outer Layer: Regulatory & Statutory Glass Disc */}
      <mesh position={[0, 0, 0.05]}>
        <cylinderGeometry args={[2.1, 2.1, 0.04, 48]} />
        <meshPhysicalMaterial
          color={outerColor}
          transmission={0.88}
          opacity={0.65}
          transparent
          roughness={0.15}
          ior={1.45}
        />
      </mesh>

      {/* Middle Brass Separator Ring */}
      <mesh>
        <torusGeometry args={[1.5, 0.05, 16, 48]} />
        <meshStandardMaterial color="#C9A66B" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Middle Filter: Attribution & Stress Test Lens */}
      <mesh ref={midFilterRef} position={[0, 0, 0.12]}>
        <cylinderGeometry args={[1.45, 1.45, 0.04, 36]} />
        <meshPhysicalMaterial
          color={midColor}
          transmission={0.82}
          opacity={0.7}
          transparent
          roughness={0.2}
          ior={1.5}
        />
      </mesh>

      {/* Inner Brass Core Aperture Ring */}
      <mesh>
        <torusGeometry args={[0.85, 0.04, 16, 36]} />
        <meshStandardMaterial color="#C9A66B" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Inner Core: Fairness Demographic Parity Focal Lens */}
      <mesh ref={innerCoreRef} position={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} />
        <meshPhysicalMaterial
          color={coreColor}
          transmission={0.9}
          opacity={0.8}
          transparent
          roughness={0.1}
          ior={1.55}
        />
      </mesh>

      {/* Optical Reticle Center Pin */}
      <mesh position={[0, 0, 0.22]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#171A18" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

export const AuditLens: React.FC<AuditLensProps> = ({ stage, isAuditing, onLayerClick }) => {
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stages = [
    { key: 'fairness', label: '1. Fairness Core', icon: Scale, desc: 'Equal Treatment & 4/5ths Rule' },
    { key: 'explain', label: '2. Attribution Lens', icon: Search, desc: 'Global SHAP & Proxy Screening' },
    { key: 'stresstest', label: '3. Stress Filter', icon: ShieldAlert, desc: 'Label Corruption & Bounded Perturbation' },
    { key: 'lawcheck', label: '4. Regulatory Aperture', icon: BookOpen, desc: 'EU AI Act & India DPDP Act 2023' },
  ] as const;

  if (prefersReducedMotion) {
    return <AuditLens2D stage={stage} isAuditing={isAuditing} onLayerClick={onLayerClick} />;
  }

  return (
    <ThreeErrorBoundary fallback={<AuditLens2D stage={stage} isAuditing={isAuditing} onLayerClick={onLayerClick} />}>
      <div className="w-full observatory-card p-6 border border-[#C9A66B]/30 bg-[#F2EEE5]/70 dark:bg-[#171A18]/90 overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* 3D Canvas Viewport */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 shrink-0">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
            >
              <ambientLight intensity={0.9} />
              <directionalLight position={[3, 5, 4]} intensity={1.5} color="#F2EEE5" />
              <pointLight position={[-3, -3, 2]} intensity={0.8} color="#C9A66B" />
              <Suspense fallback={null}>
                <OpticalLensMesh stage={stage} isAuditing={isAuditing} />
              </Suspense>
            </Canvas>

            {/* Central Optical Label Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full border border-[#C9A66B]/40 flex flex-col items-center justify-center bg-[#F2EEE5]/60 dark:bg-[#171A18]/60 backdrop-blur-xs text-center font-mono">
                <span className="text-[9px] uppercase tracking-wider text-[#C9A66B] font-bold">Lens</span>
                <span className="text-[11px] font-bold text-[#171A18] dark:text-[#F2EEE5]">
                  {stage === 5 ? 'DONE' : isAuditing ? `STEP ${stage}/4` : 'READY'}
                </span>
              </div>
            </div>
          </div>

          {/* Precision Controls & Explanatory Context */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#C9A66B]" />
                <span className="font-mono text-xs font-bold text-[#C9A66B] uppercase tracking-widest">
                  The Audit Lens &bull; Precision Optical Inspection
                </span>
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-[#171A18] dark:text-[#F2EEE5] mt-1">
                Multi-Stage Scientific Verification
              </h3>
              <p className="text-xs sm:text-sm text-[#171A18]/70 dark:text-[#F2EEE5]/70 max-w-xl">
                The optical lens apparatus inspects model predictions through four progressive filters: demographic parity, feature attribution, adversarial perturbation stability, and statutory regulatory checklists.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {stages.map((st, idx) => {
                const stageNum = idx + 1;
                const isCurrent = isAuditing && stage === stageNum;
                const isDone = stage >= stageNum;
                const Icon = st.icon;

                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => onLayerClick?.(st.key)}
                    className={`p-3 rounded border text-left transition-all flex items-start gap-3 ${
                      isCurrent
                        ? 'border-[#C9A66B] bg-[#C9A66B]/15 shadow-xs'
                        : isDone
                        ? 'border-[#496F5A] bg-[#496F5A]/5'
                        : 'border-[#171A18]/10 dark:border-[#F2EEE5]/10 hover:border-[#C9A66B]/50'
                    }`}
                  >
                    <div className={`p-2 rounded mt-0.5 shrink-0 ${
                      isDone ? 'bg-[#496F5A]/20 text-[#496F5A]' : 'bg-[#C9A66B]/20 text-[#C9A66B]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-bold text-[#171A18] dark:text-[#F2EEE5] truncate">
                          {st.label}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#496F5A] shrink-0" />
                        ) : isCurrent ? (
                          <Clock className="w-3.5 h-3.5 text-[#C9A66B] animate-spin shrink-0" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-[#171A18]/60 dark:text-[#F2EEE5]/60 mt-0.5 truncate">
                        {st.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </ThreeErrorBoundary>
  );
};
