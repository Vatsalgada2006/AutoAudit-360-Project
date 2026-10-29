import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface RadarPrismProps {
  dimensionScores: Record<string, number | null>;
  onSelectTab?: (tabKey: string) => void;
}

const AXES = [
  { key: 'Fairness', tab: 'fairness', angle: 0 },
  { key: 'Explainability', tab: 'explain', angle: Math.PI / 3 },
  { key: 'Robustness', tab: 'robustness', angle: (2 * Math.PI) / 3 },
  { key: 'EU AI Act Readiness', tab: 'compliance', angle: Math.PI },
  { key: 'DPDP Act 2023 Readiness', tab: 'compliance', angle: (4 * Math.PI) / 3 },
  { key: 'Governance Disclosure', tab: 'compliance', angle: (5 * Math.PI) / 3 }
];

function PrismScene({ dimensionScores, onSelectTab }: RadarPrismProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null);

  // Compute vertices for the 3D polygon based on score (normalized 0 to 1, radius = 2.4)
  const [polygonGeometry, prismMeshGeometry] = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radiusMax = 2.2;

    AXES.forEach((axis) => {
      const rawVal = dimensionScores[axis.key];
      const val = (rawVal === null || rawVal === undefined) ? 0.3 : Math.max(0.1, rawVal / 100);
      const r = val * radiusMax;
      const x = r * Math.cos(axis.angle);
      const y = r * Math.sin(axis.angle);
      points.push(new THREE.Vector3(x, y, 0));
    });

    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].y);
    }
    shape.closePath();

    // Extrude geometry to form a 3D prism
    const extrudeSettings = { depth: 0.35, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const prismGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Center depth
    prismGeo.center();

    // Line loop geometry for glowing border
    const lineGeo = new THREE.BufferGeometry().setFromPoints([...points, points[0]]);

    return [lineGeo, prismGeo];
  }, [dimensionScores]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle tilt and slow continuous rotation
      groupRef.current.rotation.y += delta * 0.25;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.15 + 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background Reference Hexagonal Web */}
      {[0.25, 0.5, 0.75, 1.0].map((ring) => {
        const ringPts: THREE.Vector3[] = [];
        const r = ring * 2.2;
        for (let i = 0; i <= 6; i++) {
          const a = (i % 6) * (Math.PI / 3);
          ringPts.push(new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), 0));
        }
        const webGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
        return (
          <line key={ring} geometry={webGeo}>
            <lineBasicMaterial color="#334155" transparent opacity={0.35} />
          </line>
        );
      })}

      {/* Axis Rays */}
      {AXES.map((axis) => {
        const r = 2.4;
        const x = r * Math.cos(axis.angle);
        const y = r * Math.sin(axis.angle);
        const rayGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x, y, 0)
        ]);
        const isHovered = hoveredAxis === axis.key;

        return (
          <group key={axis.key}>
            <line geometry={rayGeo}>
              <lineBasicMaterial color={isHovered ? '#38bdf8' : '#475569'} />
            </line>

            {/* Interactive Arm Sphere */}
            <mesh
              position={[x * 0.85, y * 0.85, 0]}
              onPointerOver={(e) => { e.stopPropagation(); setHoveredAxis(axis.key); }}
              onPointerOut={() => setHoveredAxis(null)}
              onClick={() => onSelectTab && onSelectTab(axis.tab)}
            >
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color={isHovered ? '#38bdf8' : '#0284c7'} />
            </mesh>

            {/* Drei HTML Label */}
            <Html position={[x * 1.15, y * 1.15, 0]} center distanceFactor={8}>
              <button
                onClick={() => onSelectTab && onSelectTab(axis.tab)}
                onMouseEnter={() => setHoveredAxis(axis.key)}
                onMouseLeave={() => setHoveredAxis(null)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-all border ${
                  isHovered
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold scale-110 shadow-lg shadow-cyan-500/50'
                    : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:border-cyan-500/60'
                }`}
              >
                {axis.key}
                <span className="ml-1 text-cyan-400 font-bold">
                  {dimensionScores[axis.key] !== null && dimensionScores[axis.key] !== undefined
                    ? `${dimensionScores[axis.key]}`
                    : 'N/A'}
                </span>
              </button>
            </Html>
          </group>
        );
      })}

      {/* 3D Extruded Prism Mesh */}
      <mesh geometry={prismMeshGeometry}>
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={0.4}
          roughness={0.2}
          metalness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing Perimeter Outline */}
      <line geometry={polygonGeometry}>
        <lineBasicMaterial color="#38bdf8" linewidth={2} />
      </line>
    </group>
  );
}

export const RadarPrism3D: React.FC<RadarPrismProps> = ({ dimensionScores, onSelectTab }) => {
  return (
    <div className="w-full h-72 sm:h-80 relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950/90 shadow-2xl">
      <div className="absolute top-2 left-3 z-10 font-mono text-[10px] text-cyan-400 flex items-center gap-2 tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        3D Hexagonal Radar Prism &bull; Interactive Spatial Projection
      </div>
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 46 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <PrismScene dimensionScores={dimensionScores} onSelectTab={onSelectTab} />
      </Canvas>
    </div>
  );
};
