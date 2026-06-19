import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

/** Convierte lat/lng a un punto en la esfera de radio r. */
function latLngToVec3(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function Globe() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.06;
  });

  const cph = useMemo(() => latLngToVec3(55.68, 12.57, 1.52), []);

  return (
    <group ref={group} rotation={[0.3, 0, 0.1]}>
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial color="#0a1228" roughness={0.85} metalness={0.2} />
      </mesh>
      {/* Wireframe atmosférico */}
      <mesh>
        <sphereGeometry args={[1.51, 32, 32]} />
        <meshBasicMaterial color="#40e0ff" wireframe transparent opacity={0.12} />
      </mesh>
      {/* Halo */}
      <mesh>
        <sphereGeometry args={[1.62, 32, 32]} />
        <meshBasicMaterial color="#40e0ff" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      {/* Pin Copenhague */}
      <mesh position={cph}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#ffc454" />
      </mesh>
      <pointLight position={cph.clone().multiplyScalar(1.4)} color="#ffc454" intensity={2} distance={2} />
    </group>
  );
}

/** Globo R3F del hero — solo desktop premium. Lazy-loaded. */
export default function GlobeR3F() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.8]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} color="#8ab4ff" />
        <Suspense fallback={null}>
          <Stars radius={50} depth={40} count={1800} factor={3} fade speed={0.6} />
          <Globe />
        </Suspense>
      </Canvas>
    </div>
  );
}
