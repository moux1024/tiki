// Written by Claude Opus 4.7

import { useGameStore } from '../../store/gameStore';
import { type Position, TileType, ActionType } from '../../game/types';
import { canCreate, canMove, getTotemHeight, getTotemOwner, posEq } from '../../game/rules';
import { VillageTile } from './VillageTile';
import { TikiStack } from '../Tiki/TikiStack';
import { ShamanWall } from '../Effects/ShamanWall';

const TILE_SPACING = 2.2;
const BOARD_OFFSET = -TILE_SPACING; // center the 3x3 grid

function posTo3D(pos: Position): [number, number, number] {
  return [
    BOARD_OFFSET + pos.col * TILE_SPACING,
    0,
    BOARD_OFFSET + pos.row * TILE_SPACING,
  ];
}

export { posTo3D, TILE_SPACING, BOARD_OFFSET };

export function Board() {
  const state = useGameStore((s) => s.state);
  const selectedAction = useGameStore((s) => s.selectedAction);
  const selectedPosition = useGameStore((s) => s.selectedPosition);

  if (!state.board || state.board.length === 0) return null;

  return (
    <group>
      {/* Ground platform */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[7.5, 0.2, 7.5]} />
        <meshStandardMaterial color="#c4a265" roughness={0.9} />
      </mesh>

      {state.board.flat().map((village) => {
        const [x, y, z] = posTo3D(village.pos);
        const isSelectable =
          selectedAction === ActionType.Create
            ? canCreate(state, village.pos)
            : selectedAction === ActionType.Move
            ? village.stack.length > 0 &&
              getTotemOwner(village) === state.currentPlayer
            : false;

        const isSelected =
          selectedPosition && posEq(selectedPosition, village.pos);

        return (
          <group key={`${village.pos.row}-${village.pos.col}`} position={[x, y, z]}>
            <VillageTile
              village={village}
              isSelectable={isSelectable}
              isSelected={!!isSelected}
            />
            <TikiStack stack={village.stack} />
          </group>
        );
      })}

      {/* Shaman barriers */}
      {state.shamanBarriers.map((barrier, i) => {
        const [x1, , z1] = posTo3D(barrier.from);
        const [x2, , z2] = posTo3D(barrier.to);
        const mx = (x1 + x2) / 2;
        const mz = (z1 + z2) / 2;
        const isVertical = barrier.from.col !== barrier.to.col;
        return <ShamanWall key={i} position={[mx, 0.3, mz]} isVertical={isVertical} />;
      })}
    </group>
  );
}
