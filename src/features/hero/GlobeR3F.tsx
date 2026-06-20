import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const TEX = {
  day: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  night: 'https://unpkg.com/three-globe/example/img/earth-night.jpg',
  bump: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
};

/** lat/lng → punto en la esfera de radio r. */
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
  const [day, night, bump] = useTexture([TEX.day, TEX.night, TEX.bump]);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.05;
  });
  const cph = useMemo(() => latLngToVec3(55.68, 12.57, 1.52), []);

  return (
    <group ref={group} rotation={[0.32, 0, 0.08]}>
      {/* Tierra: día con albedo + lado nocturno con luces de ciudad emissive */}
      <mesh>
        <sphereGeometry args={[1.5, 96, 96]} />
        <meshStandardMaterial
          map={day}
          emissiveMap={night}
          emissive={new THREE.Color('#ffd49a')}
          emissiveIntensity={1.15}
          bumpMap={bump}
          bumpScale={0.05}
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>
      {/* Atmósfera */}
      <mesh>
        <sphereGeometry args={[1.63, 48, 48]} />
        <meshBasicMaterial color="#3fa9ff" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
      {/* Pin Copenhague */}
      <mesh position={cph}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#ffc454" />
      </mesh>
      <pointLight position={cph.clone().multiplyScalar(1.5)} color="#ffc454" intensity={2.4} distance={2.2} />
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
        <ambientLight intensity={0.18} />
        <directionalLight position={[5, 2, 4]} intensity={1.5} color="#cfe0ff" />
        <Suspense fallback={null}>
          <Stars radius={50} depth={40} count={1800} factor={3} fade speed={0.6} />
          <Globe />
        </Suspense>
      </Canvas>
    </div>
  );
}
