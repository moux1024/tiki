// Written by Claude GLM-5.1

import { useRef, useMemo } from 'react';
import { Mesh, Group, CylinderGeometry, SphereGeometry, BoxGeometry } from 'three';
import { useFrame } from '@react-three/fiber';
import { TikiPiece, PLAYER_COLORS } from '../../game/types';

interface TikiPiece3DProps {
  piece: TikiPiece;
  position: [number, number, number];
  isTop: boolean;
}

export default function TikiPiece3D({ piece, position, isTop }: TikiPiece3DProps) {
  const groupRef = useRef<Group>(null);
  const color = PLAYER_COLORS[piece.color];

  useFrame((state) => {
    if (groupRef.current && isTop) {
      // Subtle floating animation for the top piece
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main body - tapered cylinder */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.4, 8]} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.24, 0.22, 0.06, 8]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Face band - decorative ring */}
      <mesh position={[0, 0.25, 0]}>
        <torusGeometry args={[0.24, 0.03, 6, 8]} />
        <meshStandardMaterial
          color="#2c2c2c"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Left eye */}
      <mesh position={[-0.1, 0.28, 0.22]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>

      {/* Right eye */}
      <mesh position={[0.1, 0.28, 0.22]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.2, 0.24]} rotation={[Math.PI / 6, 0, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* Mouth - horizontal bar */}
      <mesh position={[0, 0.13, 0.23]}>
        <boxGeometry args={[0.18, 0.03, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* Top ornament - small sphere */}
      <mesh position={[0, 0.48, 0]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.4}
          emissive={color}
          emissiveIntensity={isTop ? 0.2 : 0}
        />
      </mesh>
    </group>
  );
}
