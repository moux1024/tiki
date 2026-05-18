// Written by Claude GLM-5.1

import { useRef, useState } from 'react';
import { Mesh, Vector3 } from 'three';
import { hexToWorld } from '../../game/engine';
import { CellState, HexCoord, PLAYER_COLORS, PlayerColor } from '../../game/types';
import TikiStack from '../Tiki/TikiStack';
import { useFrame } from '@react-three/fiber';

interface HexCellProps {
  cell: CellState;
  isHovered: boolean;
  isSelected: boolean;
  isValidTarget: boolean;
  onClick: (coord: HexCoord) => void;
  onHover: (coord: HexCoord | null) => void;
}

export default function HexCell({
  cell,
  isHovered,
  isSelected,
  isValidTarget,
  onClick,
  onHover,
}: HexCellProps) {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const worldPos = hexToWorld(cell.coord);
  const distFromCenter = Math.sqrt(worldPos.x * worldPos.x + worldPos.z * worldPos.z);

  // Color based on position - tropical island gradient
  let baseColor: string;
  if (cell.isSacredSite) {
    baseColor = '#ffd700'; // Gold for sacred sites
  } else if (distFromCenter > 4.5) {
    baseColor = '#4db8a4'; // Water edge - teal
  } else if (distFromCenter > 3.5) {
    baseColor = '#f4d03f'; // Sand/beach
  } else {
    baseColor = '#52be80'; // Grass
  }

  // Hover and selection highlights
  let color = baseColor;
  if (isSelected) color = '#ff6b6b';
  else if (isHovered && isValidTarget) color = '#a8e6cf';
  else if (isHovered) color = '#dfe6e9';

  const hexRadius = 0.95;
  const hexHeight = 0.15;

  // Sacred site glow animation
  useFrame((state) => {
    if (glowRef.current && cell.isSacredSite) {
      const t = state.clock.elapsedTime;
      glowRef.current.scale.setScalar(1 + 0.05 * Math.sin(t * 2));
      (glowRef.current.material as any).opacity = 0.3 + 0.15 * Math.sin(t * 3);
    }
  });

  return (
    <group position={[worldPos.x, worldPos.y, worldPos.z]}>
      {/* Hex tile */}
      <mesh
        ref={meshRef}
        position={[0, hexHeight / 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(cell.coord);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(cell.coord);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
      >
        <cylinderGeometry args={[hexRadius, hexRadius, hexHeight, 6]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.1}
          transparent={cell.isSacredSite}
        />
      </mesh>

      {/* Sacred site marker */}
      {cell.isSacredSite && (
        <>
          <mesh ref={glowRef} position={[0, 0.4, 0]}>
            <torusGeometry args={[0.3, 0.08, 8, 6]} />
            <meshStandardMaterial
              color="#ffd700"
              emissive="#ffa500"
              emissiveIntensity={0.8}
              transparent
              opacity={0.5}
            />
          </mesh>
          {/* Inner glow sphere */}
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial
              color="#fff3cd"
              emissive="#ffc107"
              emissiveIntensity={1.2}
              transparent
              opacity={0.6}
            />
          </mesh>
        </>
      )}

      {/* Tiki pieces stack */}
      <TikiStack
        pieces={cell.pieces}
        ownerId={cell.ownerId}
        position={[0, hexHeight, 0]}
      />
    </group>
  );
}
