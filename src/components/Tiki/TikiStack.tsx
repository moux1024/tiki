// Written by Claude GLM-5.1

import { useRef } from 'react';
import { Group } from 'three';
import { TikiPiece, PLAYER_COLORS } from '../../game/types';
import TikiPiece3D from './TikiPiece3D';

interface TikiStackProps {
  pieces: TikiPiece[];
  ownerId: number | null;
  position: [number, number, number];
}

export default function TikiStack({ pieces, ownerId, position }: TikiStackProps) {
  const groupRef = useRef<Group>(null);

  if (pieces.length === 0) return null;

  return (
    <group ref={groupRef} position={position}>
      {pieces.map((piece, index) => {
        const y = index * 0.55;
        return (
          <TikiPiece3D
            key={piece.id}
            piece={piece}
            position={[0, y, 0]}
            isTop={index === pieces.length - 1}
          />
        );
      })}
    </group>
  );
}
