// Written by Claude GLM-5.1

import { TikiPiece } from "../../game/types";
import TikiPiece3D from "./TikiPiece3D";

interface Props {
  pieces: TikiPiece[];
  position: [number, number, number];
}

export default function TikiStack({ pieces, position }: Props) {
  if (pieces.length === 0) return null;

  return (
    <group position={position}>
      {pieces.map((piece, index) => {
        const y = index * 0.55;
        const isTop = index === pieces.length - 1;
        const color = piece.owner === 0 ? "red" as const : "blue" as const;
        return (
          <TikiPiece3D
            key={piece.id}
            owner={piece.owner}
            position={[0, y, 0]}
            isTop={isTop}
            color={color}
          />
        );
      })}
    </group>
  );
}
