// Written by Claude Opus 4.7

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Water() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.35 + Math.sin(Date.now() * 0.001) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial
        color="#0a6e8a"
        transparent
        opacity={0.7}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}
