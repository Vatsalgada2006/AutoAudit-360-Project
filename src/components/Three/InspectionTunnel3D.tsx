import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeErrorBoundary } from './ThreeErrorBoundary';
import { InspectionTunnel2D } from './InspectionTunnel2D';
import { FullAuditResult } from '../../types';
import { Scale, Search, ShieldAlert, FileText, CheckCircle2, AlertTriangle, XCircle, Stamp } from 'lucide-react';

interface InspectionTunnelProps {
  stage: number; // 0 to 5
  isAuditing: boolean;
  auditResult?: FullAuditResult | null;
  onGateClick?: (gateKey: 'fairness' | 'explain' | 'stresstest' | 'lawcheck') => void;
}

// Low-poly 3D Gate Component
function GateMesh({
  position,
  label,
  icon: Icon,
  status,
  isCurrent,
  isCompleted,
  onClick,
}: {
  position: [number, number, number];
  label: string;
  icon: React.ElementType;
  status: 'pass' | 'warn' | 'fail' | 'idle';
  isCurrent: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  const gateColor = useMemo(() => {
    if (isCurrent) return '#FF6B2C';
    if (!isCompleted) return '#9E9E9E';
    if (status === 'pass') return '#1F9D6B';
    if (status === 'warn') return '#F2B01E';
    if (status === 'fail') return '#D6334A';
    return '#8D8D93';
  }, [isCurrent, isCompleted, status]);

  return (
    <group position={position} onClick={onClick}>
      {/* Left Pillar */}
      <mesh position={[-0.8, 1.2, 0]}>
        <boxGeometry args={[0.2, 2.4, 0.2]} />
        <meshStandardMaterial color={gateColor} metalness={0.2} roughness={0.3} />
      </mesh>

      {/* Right Pillar */}
      <mesh position={[0.8, 1.2, 0]}>
        <boxGeometry args={[0.2, 2.4, 0.2]} />
        <meshStandardMaterial color={gateColor} metalness={0.2} roughness={0.3} />
      </mesh>

      {/* Top Crossbar */}
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[1.8, 0.25, 0.25]} />
        <meshStandardMaterial color={gateColor} emissive={isCurrent ? '#FF6B2C' : gateColor} emissiveIntensity={isCurrent ? 0.6 : 0.2} />
      </mesh>

      {/* Interactive Label and Status */}
      <Html position={[0, 2.8, 0]} center distanceFactor={12}>
        <div
          onClick={onClick}
          className="flex flex-col items-center cursor-pointer select-none px-2 py-1 bg-white/95 dark:bg-[#1B1B1F]/95 rounded border border-black/10 dark:border-white/10 shadow-md transition-transform hover:scale-110"
        >
          <div className="flex items-center gap-1">
            <Icon className="w-3.5 h-3.5 text-[#FF6B2C]" />
            <span className="font-display font-bold text-xs whitespace-nowrap text-[#1B1B1F] dark:text-[#F6F1E7]">
              {label}
            </span>
          </div>
          {isCompleted && (
            <div className="mt-0.5">
              {status === 'pass' && <CheckCircle2 className="w-3 h-3 text-[#1F9D6B]" />}
              {status === 'warn' && <AlertTriangle className="w-3 h-3 text-[#F2B01E]" />}
              {status === 'fail' && <XCircle className="w-3 h-3 text-[#D6334A]" />}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// Conveyor Track with Moving Rollers
function ConveyorTrack() {
  const rollerCount = 20;
  const rollers = useMemo(() => {
    return Array.from({ length: rollerCount }, (_, i) => ({
      x: -6 + i * 0.63,
    }));
  }, []);

  return (
    <group position={[0, -0.1, 0]}>
      {/* Belt Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[13, 0.2, 1.8]} />
        <meshStandardMaterial color="#2B2B32" roughness={0.8} />
      </mesh>

      {/* Rollers */}
      {rollers.map((r, i) => (
        <mesh key={i} position={[r.x, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.6, 12]} />
          <meshStandardMaterial color="#A0A0A5" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// Model Box that moves through checkpoints
function ModelInspectionBox({ stage, isAuditing, auditResult }: { stage: number; isAuditing: boolean; auditResult?: FullAuditResult | null }) {
  const boxRef = useRef<THREE.Group>(null);
  const stampRef = useRef<THREE.Group>(null);

  // Map stage to target X position
  // Start: -5.5
  // Gate 1 (Fairness): -3.6
  // Gate 2 (Explain): -1.2
  // Gate 3 (Stress): 1.2
  // Gate 4 (Law): 3.6
  // Stage 5 (Complete): 5.2
  const targetX = useMemo(() => {
    if (!isAuditing && !auditResult) return -5.5;
    if (stage === 0) return -5.0;
    if (stage === 1) return -3.6;
    if (stage === 2) return -1.2;
    if (stage === 3) return 1.2;
    if (stage === 4) return 3.6;
    return 5.2;
  }, [stage, isAuditing, auditResult]);

  useFrame((_, delta) => {
    if (boxRef.current) {
      boxRef.current.position.x = THREE.MathUtils.damp(boxRef.current.position.x, targetX, 3.5, delta);
    }
    // Stamp animation when complete
    if (stampRef.current) {
      const targetStampY = stage === 5 ? 0.6 : 2.5;
      stampRef.current.position.y = THREE.MathUtils.damp(stampRef.current.position.y, targetStampY, 5.0, delta);
    }
  });

  return (
    <group ref={boxRef} position={[-5.5, 0.4, 0]}>
      {/* Model Chassis Box */}
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.6, 0.7]} />
        <meshStandardMaterial color="#FF6B2C" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Label on Box */}
      <Text
        position={[0, 0.05, 0.36]}
        fontSize={0.12}
        color="#FFFFFF"
        font="https://fonts.gstatic.com/s/ibmplexmono/v19/-F6qfjptA6dpRPyd7SE_C9l4Ww.woff"
        anchorX="center"
        anchorY="middle"
      >
        AI MODEL
      </Text>

      {/* Landing Stamp on Box */}
      {auditResult && stage === 5 && (
        <group ref={stampRef} position={[0, 2.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
            <meshStandardMaterial color="#1F9D6B" metalness={0.5} roughness={0.3} />
          </mesh>
          <Html position={[0, 0.3, 0]} center>
            <div className="flex items-center gap-1 bg-[#1F9D6B] text-white px-2 py-0.5 rounded font-mono text-[10px] font-bold shadow-md">
              <Stamp className="w-3 h-3" />
              <span>INSPECTED</span>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

export const InspectionTunnel3D: React.FC<InspectionTunnelProps> = (props) => {
  const { stage, isAuditing, auditResult, onGateClick } = props;

  // Determine gate statuses
  const fairnessStatus: 'pass' | 'warn' | 'fail' | 'idle' = auditResult
    ? auditResult.fairness.some(f => f.status === 'fail') ? 'fail' : auditResult.fairness.some(f => f.status === 'warn') ? 'warn' : 'pass'
    : 'idle';

  const explainStatus: 'pass' | 'warn' | 'fail' | 'idle' = auditResult?.explain?.status || 'idle';
  const stressStatus: 'pass' | 'warn' | 'fail' | 'idle' = auditResult?.robustness?.status || 'idle';

  const lawStatus: 'pass' | 'warn' | 'fail' | 'idle' = auditResult
    ? (auditResult.compliance.eu_ai_act.score < 50 || auditResult.compliance.dpdp_act_2023.score < 50) ? 'fail'
      : (auditResult.compliance.eu_ai_act.score < 75 || auditResult.compliance.dpdp_act_2023.score < 75) ? 'warn' : 'pass'
    : 'idle';

  return (
    <ThreeErrorBoundary fallback={<InspectionTunnel2D {...props} />}>
      <div className="w-full bg-[#FFFFFF] dark:bg-[#1B1B1F] rounded-lg p-3 sm:p-5 border border-[#1B1B1F]/10 dark:border-[#F6F1E7]/10 shadow-sm relative overflow-hidden">
        
        {/* Header telemetry info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B2C] animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1B1B1F]/70 dark:text-[#F6F1E7]/70">
              AI Inspection Tunnel (3D Conveyor Simulation)
            </span>
          </div>
          <span className="font-mono text-xs text-[#1B1B1F]/60 dark:text-[#F6F1E7]/60">
            {isAuditing ? `Checkpoint ${stage} of 4 in progress...` : auditResult ? 'All Checkpoints Inspected' : 'Awaiting Inspection Run'}
          </span>
        </div>

        {/* 3D Canvas Viewport */}
        <div className="w-full h-56 sm:h-64 relative rounded">
          <Canvas
            camera={{ position: [0, 2.8, 6.2], fov: 42 }}
            dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)}
            frameloop={isAuditing ? 'always' : 'demand'}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
            <pointLight position={[0, 4, 2]} intensity={0.5} />

            {/* Conveyor track */}
            <ConveyorTrack />

            {/* The 4 Inspection Gates */}
            <GateMesh
              position={[-3.6, 0, 0]}
              label="1. Fairness"
              icon={Scale}
              status={fairnessStatus}
              isCurrent={isAuditing && stage === 1}
              isCompleted={isAuditing ? stage > 1 : !!auditResult}
              onClick={() => onGateClick && onGateClick('fairness')}
            />

            <GateMesh
              position={[-1.2, 0, 0]}
              label="2. Explain"
              icon={Search}
              status={explainStatus}
              isCurrent={isAuditing && stage === 2}
              isCompleted={isAuditing ? stage > 2 : !!auditResult}
              onClick={() => onGateClick && onGateClick('explain')}
            />

            <GateMesh
              position={[1.2, 0, 0]}
              label="3. Stress Test"
              icon={ShieldAlert}
              status={stressStatus}
              isCurrent={isAuditing && stage === 3}
              isCompleted={isAuditing ? stage > 3 : !!auditResult}
              onClick={() => onGateClick && onGateClick('stresstest')}
            />

            <GateMesh
              position={[3.6, 0, 0]}
              label="4. Law Check"
              icon={FileText}
              status={lawStatus}
              isCurrent={isAuditing && stage === 4}
              isCompleted={isAuditing ? stage > 4 : !!auditResult}
              onClick={() => onGateClick && onGateClick('lawcheck')}
            />

            {/* Moving model box */}
            <ModelInspectionBox stage={stage} isAuditing={isAuditing} auditResult={auditResult} />
          </Canvas>
        </div>

        <div className="mt-2 text-center text-xs font-mono text-[#1B1B1F]/50 dark:text-[#F6F1E7]/50">
          Tip: Click any gate to jump directly to that inspection station.
        </div>
      </div>
    </ThreeErrorBoundary>
  );
};
