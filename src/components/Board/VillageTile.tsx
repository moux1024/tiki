// Written by Claude GLM-5.1

import { useState } from "react";
import { Village, TILE_INFO } from "../../game/types";
import TikiStack from "../Tiki/TikiStack";

interface Props {
  village: Village;
  isSelectable: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export default function VillageTile({ village, isSelectable, isSelected, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const info = TILE_INFO[village.tileType];
  const spacing = 2.1;
  const x = (village.position.col - 1) * spacing;
  const z = (village.position.row - 1) * spacing;

  let emissiveColor = "#000000";
  let emissiveIntensity = 0;
  if (isSelected) {
    emissiveColor = "#ffffff";
    emissiveIntensity = 0.4;
  } else if (hovered && isSelectable) {
    emissiveColor = "#ffd700";
    emissiveIntensity = 0.3;
  }

  return (
    <group position={[x, 0, z]}>
      {/* Base tile */}
      <mesh
        position={[0, 0.075, 0]}
        receiveShadow
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          if (isSelectable) onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (isSelectable) setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <boxGeometry args={[1.8, 0.15, 1.8]} />
        <meshStandardMaterial
          color={isSelected ? "#ffffff" : hovered && isSelectable ? "#ffffcc" : info.color}
          roughness={0.7}
          metalness={0.1}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Tile type label - emoji on top */}
      <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshStandardMaterial
          color={village.tileType === "cursed" ? "#ff4444" : village.tileType === "swamp" ? "#7f8c8d" : "#f39c12"}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Plus2 fruit decorations */}
      {village.tileType === "plus2" && (
        <>
          {([[-0.55, 0.16, -0.55], [0.55, 0.16, -0.55], [-0.55, 0.16, 0.55], [0.55, 0.16, 0.55]] as [number, number, number][]).map((pos, i) => (
            <mesh key={i} position={pos} castShadow>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ff6b35" />
            </mesh>
          ))}
        </>
      )}

      {/* Cursed skull indicator */}
      {village.tileType === "cursed" && (
        <mesh position={[0, 0.2, 0]} castShadow>
          <dodecahedronGeometry args={[0.18]} />
          <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
      )}

      {/* Swamp bubbles */}
      {village.tileType === "swamp" && (
        <>
          {([[-0.4, 0.16, 0.3], [0.3, 0.16, -0.4]] as [number, number, number][]).map((pos, i) => (
            <mesh key={i} position={pos}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#6b8e5a" transparent opacity={0.5} />
            </mesh>
          ))}
        </>
      )}

      {/* Tiki stack */}
      <TikiStack pieces={village.stack} position={[0, 0.15, 0]} />
    </group>
  );
}
