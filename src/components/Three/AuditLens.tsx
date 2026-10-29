import React, { useRef, Suspense } from 'react';
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

// 3D Optical Elements for The Trust Observatory — Signal Edition
function OpticalLensMesh({ stage, isAuditing }: { stage: number; isAuditing: boolean }) {
  const outerBezelRef = useRef<THREE.Mesh>(null);
  const midFilterRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const rotSpeed = isAuditing ? 1.0 : 0.15;
    if (outerBezelRef.current) {
      outerBezelRef.current.rotation.z += delta * rotSpeed;
    }
    if (midFilterRef.current) {
      midFilterRef.current.rotation.z -= delta * (rotSpeed * 0.65);
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.z += delta * (rotSpeed * 0.35);
    }
  });

  // Dynamic Signal Edition colors based on inspection stages
  const coreColor = stage >= 1 ? '#D5F36A' : '#FF705D';
  const midColor = stage >= 2 ? '#D5F36A' : '#C5B6C9';
  const outerColor = stage >= 4 ? '#D5F36A' : '#332A37';

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Deep Aubergine Bezel */}
      <mesh ref={outerBezelRef}>
        <torusGeometry args={[2.2, 0.08, 16, 64]} />
        <meshStandardMaterial
          color="#332A37"
          metalness={0.9}
          roughness={0.2}
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

      {/* Middle Neutral Separator Ring */}
      <mesh>
        <torusGeometry args={[1.5, 0.05, 16, 48]} />
        <meshStandardMaterial color="#DED3D8" metalness={0.7} roughness={0.3} />
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

      {/* Inner Precision Aperture Ring */}
      <mesh>
        <torusGeometry args={[0.85, 0.04, 16, 36]} />
        <meshStandardMaterial color="#332A37" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Inner Core: Fairness Demographic Parity Focal Lens */}
      <mesh ref={innerCoreRef} position={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} />
        <meshPhysicalMaterial
          color={coreColor}
          transmission={0.9}
          opacity={0.82}
          transparent
          roughness={0.1}
          ior={1.55}
        />
      </mesh>

      {/* Optical Reticle Center Pin */}
      <mesh position={[0, 0, 0.22]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#201823" metalness={0.95} roughness={0.1} />
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
      <div className="w-full observatory-card p-6 border border-[#DED3D8] dark:border-[#332A37] bg-[#FFFFFF] dark:bg-[#201823] overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* 3D Canvas Viewport */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 shrink-0">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
            >
              <ambientLight intensity={0.85} />
              <directionalLight position={[3, 5, 4]} intensity={1.4} color="#FAF2E8" />
              <pointLight position={[-3, -3, 2]} intensity={0.7} color="#D5F36A" />
              <pointLight position={[3, -2, 2]} intensity={0.5} color="#FF705D" />
              <Suspense fallback={null}>
                <OpticalLensMesh stage={stage} isAuditing={isAuditing} />
              </Suspense>
            </Canvas>

            {/* Central Optical Label Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full border border-[#DED3D8] dark:border-[#332A37] flex flex-col items-center justify-center bg-[#FAF2E8]/80 dark:bg-[#201823]/80 backdrop-blur-xs text-center font-mono">
                <span className="text-[9px] uppercase tracking-wider text-[#FF705D] font-bold">Lens</span>
                <span className="text-[11px] font-bold text-[#201823] dark:text-[#FAF2E8]">
                  {stage === 5 ? 'DONE' : isAuditing ? `STEP ${stage}/4` : 'READY'}
                </span>
              </div>
            </div>
          </div>

          {/* Precision Controls & Explanatory Context */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#D5F36A]" />
                <span className="font-mono text-xs font-bold text-[#FF705D] uppercase tracking-widest">
                  The Audit Lens &bull; Precision Optical Inspection
                </span>
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-[#201823] dark:text-[#FAF2E8] mt-1">
                Multi-Stage Scientific Verification
              </h3>
              <p className="text-xs sm:text-sm text-[#201823]/70 dark:text-[#FAF2E8]/70 max-w-xl">
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
                        ? 'border-[#D5F36A] bg-[#D5F36A]/15 shadow-xs'
                        : isDone
                        ? 'border-[#D5F36A]/50 bg-[#D5F36A]/10'
                        : 'border-[#DED3D8] dark:border-[#332A37] hover:border-[#FF705D]/50'
                    }`}
                  >
                    <div className={`p-2 rounded mt-0.5 shrink-0 ${
                      isDone ? 'bg-[#D5F36A]/20 text-[#2D5A1E] dark:text-[#D5F36A]' : 'bg-[#332A37] text-[#C5B6C9]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-bold text-[#201823] dark:text-[#FAF2E8] truncate">
                          {st.label}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A1E] dark:text-[#D5F36A] shrink-0" />
                        ) : isCurrent ? (
                          <Clock className="w-3.5 h-3.5 text-[#FF705D] animate-spin shrink-0" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-[#201823]/60 dark:text-[#FAF2E8]/60 mt-0.5 truncate">
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
