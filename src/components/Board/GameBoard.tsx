// Written by Claude GLM-5.1

import { useMemo } from "react";
import { useGameStore } from "../../store/gameStore";
import { BOARD_SIZE } from "../../game/types";
import { getValidCreatePositions, getOwnedTotems, canMoveTotem } from "../../game/rules";
import VillageTile from "./VillageTile";

export default function GameBoard() {
  const gameState = useGameStore((s) => s.gameState);
  const selectedAction = useGameStore((s) => s.selectedAction);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const selectCell = useGameStore((s) => s.selectCell);

  const validCreatePositions = useMemo(
    () => getValidCreatePositions(gameState),
    [gameState]
  );

  const ownedTotems = useMemo(
    () => getOwnedTotems(gameState, gameState.currentPlayer),
    [gameState]
  );

  const isVillageSelectable = (row: number, col: number): boolean => {
    if (gameState.phase !== "playing") return false;
    const player = gameState.players[gameState.currentPlayer];

    if (selectedAction === "create") {
      if (player.supply <= 0) return false;
      return validCreatePositions.some((p) => p.row === row && p.col === col);
    }

    if (selectedAction === "move") {
      if (selectedCell) {
        // Already selected a totem, show direction indicators aren't on tiles
        return false;
      }
      return ownedTotems.some((t) => t.position.row === row && t.position.col === col);
    }

    return false;
  };

  const isSelected = (row: number, col: number): boolean => {
    return selectedCell !== null && selectedCell.row === row && selectedCell.col === col;
  };

  const tiles = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const village = gameState.board[r]?.[c];
      if (!village) continue;
      tiles.push(
        <VillageTile
          key={`${r}-${c}`}
          village={village}
          isSelectable={isVillageSelectable(r, c)}
          isSelected={isSelected(r, c)}
          onClick={() => selectCell({ row: r, col: c })}
        />
      );
    }
  }

  // Board frame
  return (
    <group>
      {/* Board base */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[7, 0.1, 7]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Board border */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[7.2, 0.08, 7.2]} />
        <meshStandardMaterial color="#5D3A1A" roughness={0.8} />
      </mesh>

      {tiles}
    </group>
  );
}
