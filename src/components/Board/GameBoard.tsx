// Written by Claude GLM-5.1

import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { HexCoord } from '../../game/types';
import { getCell, hexKey } from '../../game/engine';
import HexCell from './HexCell';

export default function GameBoard() {
  const board = useGameStore((s) => s.board);
  const handleCellClick = useGameStore((s) => s.handleCellClick);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const selectedAction = useGameStore((s) => s.selectedAction);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const phase = useGameStore((s) => s.phase);

  const [hoveredCell, setHoveredCell] = useState<HexCoord | null>(null);

  const cells = useMemo(() => {
    return Array.from(board.values());
  }, [board]);

  const isValidTarget = (coord: HexCoord): boolean => {
    if (phase !== 'playing') return false;
    const cell = getCell(board, coord);
    if (!cell) return false;

    // For move action with source selected, show valid destinations
    if (selectedAction === 'move' && selectedCell) {
      const fromCell = getCell(board, selectedCell);
      if (fromCell && fromCell.ownerId === currentPlayerIndex) {
        // Adjacent cells that can be moved to
        const dx = Math.abs(coord.q - selectedCell.q);
        const dz = Math.abs(coord.r - selectedCell.r);
        const dist = (dx + dz + Math.abs(coord.q + coord.r - selectedCell.q - selectedCell.r)) / 2;
        if (dist === 1) return true;
      }
      return false;
    }

    // Show cells where current player can act
    if (selectedAction === 'place') {
      return cell.ownerId === null || (cell.ownerId === currentPlayerIndex && cell.stackHeight < 4);
    }
    if (selectedAction === 'move') {
      return cell.ownerId === currentPlayerIndex && cell.pieces.length > 0;
    }
    if (selectedAction === 'ascend') {
      return cell.ownerId === currentPlayerIndex && cell.pieces.length >= 2;
    }
    if (selectedAction === 'sacrifice') {
      return cell.ownerId === currentPlayerIndex && cell.pieces.length > 0;
    }

    // Default: highlight own cells and empty cells
    return cell.ownerId === null || cell.ownerId === currentPlayerIndex;
  };

  return (
    <group>
      {cells.map((cell) => {
        const key = hexKey(cell.coord.q, cell.coord.r);
        return (
          <HexCell
            key={key}
            cell={cell}
            isHovered={
              hoveredCell !== null &&
              hoveredCell.q === cell.coord.q &&
              hoveredCell.r === cell.coord.r
            }
            isSelected={
              selectedCell !== null &&
              selectedCell.q === cell.coord.q &&
              selectedCell.r === cell.coord.r
            }
            isValidTarget={isValidTarget(cell.coord)}
            onClick={handleCellClick}
            onHover={setHoveredCell}
          />
        );
      })}
    </group>
  );
}
