// Written by Claude GLM-5.1

import { useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { PLAYER_COLORS, PlayerColor } from "../../game/types";

interface Props {
  owner: number;
  position: [number, number, number];
  isTop: boolean;
  color: PlayerColor;
}

export default function TikiPiece3D({ owner, position, isTop, color }: Props) {
  const groupRef = useRef<Group>(null);
  const baseColor = PLAYER_COLORS[color];

  useFrame((state) => {
    if (groupRef.current && isTop) {
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.015;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main body - tapered cylinder */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.4, 8]} />
        <meshStandardMaterial color={baseColor} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.24, 0.22, 0.06, 8]} />
        <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Carved ring detail */}
      <mesh position={[0, 0.25, 0]}>
        <torusGeometry args={[0.24, 0.03, 6, 8]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.1, 0.28, 0.22]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.1, 0.28, 0.22]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.2, 0.24]} rotation={[Math.PI / 6, 0, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, 0.13, 0.23]}>
        <boxGeometry args={[0.18, 0.03, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* Top ornament */}
      <mesh position={[0, 0.48, 0]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.4}
          metalness={0.4}
          emissive={baseColor}
          emissiveIntensity={isTop ? 0.2 : 0}
        />
      </mesh>
    </group>
  );
}
