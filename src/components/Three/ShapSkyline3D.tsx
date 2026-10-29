import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { TopFeature } from '../../types';

interface ShapSkylineProps {
  features: TopFeature[];
}

function SkylineScene({ features }: ShapSkylineProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Take top 8 features
  const displayFeatures = features.slice(0, 8);
  const maxVal = Math.max(...displayFeatures.map(f => f.importance || 0.01), 0.1);
  const barWidth = 0.45;
  const spacing = 0.65;
  const startX = -((displayFeatures.length - 1) * spacing) / 2;

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Subtle floating rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.8, 0]}>
      {/* Grid Floor */}
      <gridHelper args={[8, 8, '#0284c7', '#1e293b']} position={[0, 0, 0]} />

      {displayFeatures.map((feat, idx) => {
        const height = Math.max(0.2, (feat.importance / maxVal) * 2.8);
        const x = startX + idx * spacing;
        const isHovered = hoveredIdx === idx;

        // Color coding: sensitive (red), proxy (amber), standard (cyan)
        let color = '#06b6d4';
        if (feat.is_sensitive) color = '#ef4444';
        else if (feat.is_proxy) color = '#f59e0b';

        return (
          <group key={feat.feature} position={[x, height / 2, 0]}>
            {/* 3D Bar */}
            <mesh
              onPointerOver={(e) => { e.stopPropagation(); setHoveredIdx(idx); }}
              onPointerOut={() => setHoveredIdx(null)}
            >
              <boxGeometry args={[barWidth, height, barWidth]} />
              <meshStandardMaterial
                color={color}
                roughness={0.25}
                metalness={0.2}
                transparent
                opacity={isHovered ? 1.0 : 0.85}
              />
            </mesh>

            {/* Wireframe edges */}
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(barWidth, height, barWidth)]} />
              <lineBasicMaterial color={isHovered ? '#ffffff' : color} />
            </lineSegments>

            {/* Floating Top Indicator */}
            {isHovered && (
              <Html position={[0, height / 2 + 0.3, 0]} center distanceFactor={8}>
                <div className="bg-slate-900 border border-cyan-400 p-2 rounded shadow-xl font-mono text-[10px] text-white whitespace-nowrap z-50">
                  <div className="font-bold text-cyan-300">{feat.feature}</div>
                  <div>|SHAP|: {feat.importance.toFixed(4)}</div>
                  {feat.is_sensitive && <div className="text-red-400 font-bold">[PROTECTED ATTRIBUTE]</div>}
                  {feat.is_proxy && <div className="text-amber-400 font-bold">[SUSPECTED PROXY]</div>}
                </div>
              </Html>
            )}

            {/* Label below floor */}
            <Html position={[0, -height / 2 - 0.25, 0]} center distanceFactor={8}>
              <div className="text-[9px] font-mono text-slate-400 transform -rotate-45 origin-top-left whitespace-nowrap">
                {feat.feature.length > 10 ? feat.feature.slice(0, 9) + '…' : feat.feature}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export const ShapSkyline3D: React.FC<ShapSkylineProps> = ({ features }) => {
  return (
    <div className="w-full h-72 sm:h-80 relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950/90 shadow-2xl">
      <div className="absolute top-2 left-3 z-10 font-mono text-[10px] text-cyan-400 flex items-center gap-2 tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        3D SHAP Skyline &bull; Attribution Altitude Matrix
      </div>
      <Canvas
        camera={{ position: [0, 1.2, 5.0], fov: 46 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 4]} intensity={0.9} />
        <SkylineScene features={features} />
      </Canvas>
    </div>
  );
};
