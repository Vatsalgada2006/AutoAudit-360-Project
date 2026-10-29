import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DatasetCloudProps {
  pointCount?: number;
  isScanning?: boolean;
}

function PointsMesh({ count = 3500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const scanPlaneRef = useRef<THREE.Mesh>(null);

  // Generate dataset points in a normalized bounded box [-3, 3]
  const [positions, baseColors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 6;
      const y = (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 4;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Initial color: Amber (#f59e0b)
      col[i * 3] = 0.96;
      col[i * 3 + 1] = 0.62;
      col[i * 3 + 2] = 0.04;
    }
    return [pos, col];
  }, [count]);

  const colorsBuffer = useMemo(() => new Float32Array(baseColors), [baseColors]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Slow camera orbit / wobble
    state.camera.position.x = Math.sin(t * 0.2) * 0.8;
    state.camera.position.y = Math.cos(t * 0.15) * 0.5 + 0.2;
    state.camera.lookAt(0, 0, 0);

    // Laser scan plane moves along X: [-3.2, 3.2]
    const scanX = Math.sin(t * 1.2) * 3.2;
    if (scanPlaneRef.current) {
      scanPlaneRef.current.position.x = scanX;
    }

    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry;
      const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;

      // Update point colors depending on whether they have been passed by the laser scan plane
      for (let i = 0; i < count; i++) {
        const px = positions[i * 3];
        const dist = px - scanX;

        if (dist < 0) {
          // Scanned: mostly Cyan (pass #06b6d4), 15% Red (flagged #ef4444)
          const isFlagged = (i % 7 === 0);
          if (isFlagged) {
            colorsBuffer[i * 3] = 0.94;     // R
            colorsBuffer[i * 3 + 1] = 0.27; // G
            colorsBuffer[i * 3 + 2] = 0.27; // B
          } else {
            colorsBuffer[i * 3] = 0.02;     // R
            colorsBuffer[i * 3 + 1] = 0.71; // G
            colorsBuffer[i * 3 + 2] = 0.83; // B
          }
        } else {
          // Unscanned: Amber (#f59e0b)
          colorsBuffer[i * 3] = 0.96;
          colorsBuffer[i * 3 + 1] = 0.62;
          colorsBuffer[i * 3 + 2] = 0.04;
        }
      }
      colorAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Wireframe Bounding Box */}
      <mesh>
        <boxGeometry args={[6.4, 4.4, 4.4]} />
        <meshBasicMaterial color="#0284c7" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Laser Scanning Plane */}
      <mesh ref={scanPlaneRef}>
        <planeGeometry args={[0.08, 4.3]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Points Cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colorsBuffer, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export const DatasetCloud3D: React.FC<DatasetCloudProps> = ({ pointCount = 3200 }) => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsReducedMotion(true);
    }
    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL || isReducedMotion) {
    return (
      <div className="w-full h-48 sm:h-56 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-cyan-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="w-48 h-32 border border-dashed border-cyan-800/40 rounded flex items-center justify-center text-center p-4">
          <div className="text-xs font-mono text-cyan-400">
            [DATASET MATRIX ENCLOSURE]
            <div className="text-[10px] text-slate-500 mt-1">N=4,000 Verified Test Vector Cloud</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-52 sm:h-60 relative rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950/90 shadow-2xl">
      <div className="absolute top-2 left-3 z-10 font-mono text-[10px] text-cyan-400 flex items-center gap-2 tracking-wider uppercase">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
        Real-time Instanced Point Cloud &bull; Forensic Scanner Active
      </div>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <PointsMesh count={pointCount} />
      </Canvas>
    </div>
  );
};
