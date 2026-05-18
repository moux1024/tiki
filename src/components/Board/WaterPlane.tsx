// Written by Claude GLM-5.1

import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

export default function WaterPlane() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.05 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[12, 64]} />
      <meshStandardMaterial
        color="#1a6b8a"
        transparent
        opacity={0.85}
        roughness={0.2}
        metalness={0.3}
      />
    </mesh>
  );
}
