// Written by Claude Opus 4.7

interface Props {
  position: [number, number, number];
  isVertical: boolean;
}

export function ShamanWall({ position, isVertical }: Props) {
  return (
    <group position={position} rotation={[0, isVertical ? 0 : Math.PI / 2, 0]}>
      {/* Glowing barrier */}
      <mesh>
        <boxGeometry args={[0.08, 1.2, 1.8]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.8}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <boxGeometry args={[0.12, 1.0, 1.6]} />
        <meshStandardMaterial
          color="#aaffcc"
          emissive="#00ff88"
          emissiveIntensity={1.5}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
