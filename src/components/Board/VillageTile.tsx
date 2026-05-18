// Written by Claude Opus 4.7

import { useRef, useState } from 'react';
import { type Village, TileType } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

const TILE_COLORS: Record<TileType, string> = {
  [TileType.FruitPlus2]: '#2d8a4e',
  [TileType.FruitPlus1]: '#5dbb63',
  [TileType.Swamp]: '#4a4a3a',
  [TileType.Cursed]: '#6b2d8b',
};

const TILE_LABELS: Record<TileType, string> = {
  [TileType.FruitPlus2]: '+2',
  [TileType.FruitPlus1]: '+1',
  [TileType.Swamp]: '~',
  [TileType.Cursed]: '-1',
};

interface Props {
  village: Village;
  isSelectable: boolean;
  isSelected: boolean;
}

export function VillageTile({ village, isSelectable, isSelected }: Props) {
  const [hovered, setHovered] = useState(false);
  const selectPosition = useGameStore((s) => s.selectPosition);
  const selectedAction = useGameStore((s) => s.selectedAction);
  const animating = useGameStore((s) => s.animating);

  const color = TILE_COLORS[village.tileType];
  const baseColor = new THREE.Color(color);

  const handleClick = () => {
    if (animating || !selectedAction) return;
    selectPosition(village.pos);
  };

  return (
    <group>
      {/* Base tile */}
      <mesh
        position={[0, 0, 0]}
        receiveShadow
        castShadow
        onClick={handleClick}
        onPointerOver={() => isSelectable && setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.8, 0.15, 1.8]} />
        <meshStandardMaterial
          color={hovered && isSelectable ? '#ffffaa' : isSelected ? '#ffffff' : color}
          roughness={0.7}
          emissive={isSelected ? '#ffffff' : hovered && isSelectable ? baseColor : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : hovered && isSelectable ? 0.2 : 0}
        />
      </mesh>

      {/* Tile type indicator */}
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.25, 16]} />
        <meshStandardMaterial
          color={village.tileType === TileType.Cursed ? '#ff4444' : '#ffffff'}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Label sprite */}
      <sprite position={[0, 0.3, 0]} scale={[0.5, 0.5, 1]}>
        <spriteMaterial color="#ffffff" opacity={0.9} transparent />
      </sprite>

      {/* Corner fruits for +2 tiles */}
      {village.tileType === TileType.FruitPlus2 && (
        <>
          {[[-0.6, 0.12, -0.6], [0.6, 0.12, -0.6], [-0.6, 0.12, 0.6], [0.6, 0.12, 0.6]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} castShadow>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ff6b35" />
            </mesh>
          ))}
        </>
      )}

      {/* Skull indicator for cursed */}
      {village.tileType === TileType.Cursed && (
        <mesh position={[0, 0.15, 0]} castShadow>
          <dodecahedronGeometry args={[0.15]} />
          <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
      )}

      {/* Swamp bubbles */}
      {village.tileType === TileType.Swamp && (
        <>
          {[[-0.4, 0.12, 0.3], [0.3, 0.12, -0.4]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#6b8e5a" transparent opacity={0.5} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
