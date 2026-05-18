// Written by Claude GLM-5.1

import {
  GameState,
  HexCoord,
  MoveAction,
  Player,
  CellState,
  BOARD_RADIUS,
  MAX_PIECES_PER_PLAYER,
  SACRED_SITE_COUNT,
} from './types';
import {
  hexKey,
  getCell,
  setCell,
  createPiece,
  hexNeighbors,
  hexDistance,
  isValidCoord,
  resetPieceCounter,
} from './engine';

export function canPlace(state: GameState, coord: HexCoord, playerId: number): boolean {
  if (!isValidCoord(coord, state.boardRadius)) return false;
  const cell = getCell(state.board, coord);
  if (!cell) return false;

  const player = state.players[playerId];
  if (!player || player.remainingPieces <= 0) return false;

  // Can place on empty cells or on top of own pieces
  if (cell.ownerId === null) return true;
  if (cell.ownerId === playerId && cell.stackHeight < 4) return true;

  return false;
}

export function canMove(
  state: GameState,
  from: HexCoord,
  to: HexCoord,
  playerId: number
): boolean {
  if (!isValidCoord(from, state.boardRadius) || !isValidCoord(to, state.boardRadius))
    return false;

  const fromCell = getCell(state.board, from);
  const toCell = getCell(state.board, to);
  if (!fromCell || !toCell) return false;

  // Must own the from cell and have pieces there
  if (fromCell.ownerId !== playerId || fromCell.pieces.length === 0) return false;

  // Must be adjacent
  if (hexDistance(from, to) !== 1) return false;

  // Can move to empty or own cell (not exceeding max stack)
  if (toCell.ownerId === null) return true;
  if (toCell.ownerId === playerId && toCell.stackHeight < 4) return true;

  // Can capture: if moving to opponent's cell and our stack is higher
  if (toCell.ownerId !== playerId) {
    return fromCell.stackHeight >= toCell.stackHeight;
  }

  return false;
}

export function canAscend(state: GameState, coord: HexCoord, playerId: number): boolean {
  if (!isValidCoord(coord, state.boardRadius)) return false;
  const cell = getCell(state.board, coord);
  if (!cell) return false;

  // Must own the cell and have at least 2 pieces
  if (cell.ownerId !== playerId) return false;
  if (cell.pieces.length < 2) return false;

  return true;
}

export function canSacrifice(state: GameState, coord: HexCoord, playerId: number): boolean {
  if (!isValidCoord(coord, state.boardRadius)) return false;
  const cell = getCell(state.board, coord);
  if (!cell) return false;

  // Must own the cell and have pieces
  if (cell.ownerId !== playerId) return false;
  if (cell.pieces.length === 0) return false;

  return true;
}

export function getValidMoves(
  state: GameState,
  action: MoveAction['type'],
  playerId: number
): MoveAction[] {
  const moves: MoveAction[] = [];
  const coords = Array.from(state.board.keys());

  switch (action) {
    case 'place':
      for (const key of coords) {
        const cell = state.board.get(key)!;
        const coord = cell.coord;
        if (canPlace(state, coord, playerId)) {
          moves.push({ type: 'place', to: coord, playerId });
        }
      }
      break;

    case 'move':
      for (const key of coords) {
        const fromCell = state.board.get(key)!;
        if (fromCell.ownerId !== playerId || fromCell.pieces.length === 0) continue;
        for (const neighbor of hexNeighbors(fromCell.coord)) {
          if (canMove(state, fromCell.coord, neighbor, playerId)) {
            moves.push({
              type: 'move',
              from: fromCell.coord,
              to: neighbor,
              playerId,
            });
          }
        }
      }
      break;

    case 'ascend':
      for (const key of coords) {
        const cell = state.board.get(key)!;
        if (canAscend(state, cell.coord, playerId)) {
          moves.push({ type: 'ascend', to: cell.coord, playerId });
        }
      }
      break;

    case 'sacrifice':
      for (const key of coords) {
        const cell = state.board.get(key)!;
        if (canSacrifice(state, cell.coord, playerId)) {
          moves.push({ type: 'sacrifice', to: cell.coord, playerId });
        }
      }
      break;
  }

  return moves;
}

export function executeAction(state: GameState, action: MoveAction): GameState {
  const newBoard = new Map(state.board);
  const player = state.players[action.playerId];
  if (!player) return state;

  switch (action.type) {
    case 'place': {
      const cell = getCell(newBoard, action.to);
      if (!cell) return state;
      const piece = createPiece(player.color, action.to);
      piece.height = cell.stackHeight + 1;
      const newCell: CellState = {
        ...cell,
        pieces: [...cell.pieces, piece],
        stackHeight: cell.stackHeight + 1,
        ownerId: action.playerId,
      };
      setCell(newBoard, action.to, newCell);

      const newPlayers = [...state.players];
      newPlayers[action.playerId] = {
        ...player,
        remainingPieces: player.remainingPieces - 1,
      };

      return checkGameEnd({
        ...state,
        board: newBoard,
        players: newPlayers,
      });
    }

    case 'move': {
      if (!action.from) return state;
      const fromCell = getCell(newBoard, action.from);
      const toCell = getCell(newBoard, action.to);
      if (!fromCell || !toCell) return state;

      const topPiece = fromCell.pieces[fromCell.pieces.length - 1];
      const updatedFromPieces = fromCell.pieces.slice(0, -1);

      const newFromCell: CellState = {
        ...fromCell,
        pieces: updatedFromPieces,
        stackHeight: updatedFromPieces.length,
        ownerId: updatedFromPieces.length > 0 ? fromCell.ownerId : null,
      };
      setCell(newBoard, action.from, newFromCell);

      topPiece.position = action.to;
      topPiece.height = toCell.stackHeight + 1;
      const newToCell: CellState = {
        ...toCell,
        pieces: [...toCell.pieces, topPiece],
        stackHeight: toCell.stackHeight + 1,
        ownerId: action.playerId,
      };
      setCell(newBoard, action.to, newToCell);

      return checkGameEnd({ ...state, board: newBoard });
    }

    case 'ascend': {
      const cell = getCell(newBoard, action.to);
      if (!cell || cell.pieces.length < 2) return state;

      const topPiece = cell.pieces[cell.pieces.length - 1];
      const bottomPiece = cell.pieces[cell.pieces.length - 2];

      // Merge: remove bottom piece, boost top piece height
      const updatedPieces = cell.pieces.slice(0, -2).concat([
        { ...topPiece, height: bottomPiece.height },
      ]);

      const newCell: CellState = {
        ...cell,
        pieces: updatedPieces,
        stackHeight: updatedPieces.length,
      };
      setCell(newBoard, action.to, newCell);

      return checkGameEnd({ ...state, board: newBoard });
    }

    case 'sacrifice': {
      const cell = getCell(newBoard, action.to);
      if (!cell || cell.pieces.length === 0) return state;

      const updatedPieces = cell.pieces.slice(0, -1);
      const newCell: CellState = {
        ...cell,
        pieces: updatedPieces,
        stackHeight: updatedPieces.length,
        ownerId: updatedPieces.length > 0 ? cell.ownerId : null,
      };
      setCell(newBoard, action.to, newCell);

      // Sacrifice gives bonus: place on any adjacent empty cell
      // This is handled by the game store as a follow-up action
      return checkGameEnd({ ...state, board: newBoard });
    }
  }

  return state;
}

export function calculateScores(state: GameState): number[] {
  const scores = state.players.map(() => 0);
  const controlledSites = new Map<number, number>();

  for (const [, cell] of state.board) {
    if (cell.ownerId !== null && cell.pieces.length > 0) {
      const pid = cell.ownerId;
      // Base: +1 per controlled cell
      scores[pid] += 1;

      // Sacred site bonus: +3
      if (cell.isSacredSite) {
        scores[pid] += 3;
        controlledSites.set(pid, (controlledSites.get(pid) || 0) + 1);
      }

      // Tall totem bonus: +2 for stacks >= 3
      if (cell.stackHeight >= 3) {
        scores[pid] += 2;
      }
    }
  }

  return scores;
}

function checkGameEnd(state: GameState): GameState {
  // Check if all sacred sites are occupied
  let sacredOccupied = 0;
  for (const [, cell] of state.board) {
    if (cell.isSacredSite && cell.ownerId !== null) {
      sacredOccupied++;
    }
  }

  if (sacredOccupied >= SACRED_SITE_COUNT) {
    return endGame(state);
  }

  // Check if any player has no pieces left AND no pieces on board
  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[i];
    let hasPiecesOnBoard = false;
    for (const [, cell] of state.board) {
      if (cell.ownerId === i) {
        hasPiecesOnBoard = true;
        break;
      }
    }
    if (player.remainingPieces <= 0 && !hasPiecesOnBoard) {
      return endGame(state);
    }
  }

  // Check if current player has any valid moves
  const currentPlayer = state.players[state.currentPlayerIndex];
  const allActionTypes = ['place', 'move', 'ascend', 'sacrifice'] as const;
  const hasAnyMoves = allActionTypes.some((action) => {
    return getValidMoves(state, action, state.currentPlayerIndex).length > 0;
  });

  if (!hasAnyMoves) {
    // Skip to next player or end game if no one can move
    return advanceTurn(state);
  }

  return state;
}

function endGame(state: GameState): GameState {
  const scores = calculateScores(state);
  let maxScore = -1;
  let winner = -1;

  for (let i = 0; i < scores.length; i++) {
    if (scores[i] > maxScore) {
      maxScore = scores[i];
      winner = i;
    }
  }

  const newPlayers = state.players.map((p, i) => ({
    ...p,
    score: scores[i],
  }));

  return {
    ...state,
    phase: 'gameOver',
    winner,
    players: newPlayers,
  };
}

function advanceTurn(state: GameState): GameState {
  let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    turnCount: state.turnCount + 1,
    selectedAction: 'none',
    selectedCell: null,
  };
}

export function nextTurn(state: GameState): GameState {
  return advanceTurn(state);
}

export function initGameState(playerCount: number, aiPlayers: number[]): GameState {
  resetPieceCounter();
  const board = new Map<string, CellState>();
  const coords: HexCoord[] = [];

  // Generate hex grid
  for (let q = -BOARD_RADIUS; q <= BOARD_RADIUS; q++) {
    const r1 = Math.max(-BOARD_RADIUS, -q - BOARD_RADIUS);
    const r2 = Math.min(BOARD_RADIUS, -q + BOARD_RADIUS);
    for (let r = r1; r <= r2; r++) {
      coords.push({ q, r });
    }
  }

  // Generate sacred sites deterministically
  const sacredSites: HexCoord[] = [
    { q: 2, r: -1 },
    { q: -2, r: 1 },
    { q: 1, r: 1 },
    { q: -1, r: -1 },
    { q: 0, r: 2 },
    { q: 0, r: -2 },
  ];

  for (const coord of coords) {
    const key = hexKey(coord.q, coord.r);
    const isSacred = sacredSites.some((s) => s.q === coord.q && s.r === coord.r);
    board.set(key, {
      coord,
      stackHeight: 0,
      ownerId: null,
      pieces: [],
      isSacredSite: isSacred,
    });
  }

  const colors: Array<'red' | 'blue' | 'green' | 'yellow'> = ['red', 'blue', 'green', 'yellow'];
  const players: Player[] = [];

  for (let i = 0; i < playerCount; i++) {
    players.push({
      id: i,
      name: aiPlayers.includes(i) ? `AI ${i + 1}` : `Player ${i + 1}`,
      color: colors[i],
      score: 0,
      remainingPieces: MAX_PIECES_PER_PLAYER,
      isAI: aiPlayers.includes(i),
      aiDifficulty: aiPlayers.includes(i) ? 'medium' : undefined,
    });
  }

  return {
    board,
    players,
    currentPlayerIndex: 0,
    phase: 'playing',
    selectedAction: 'none',
    selectedCell: null,
    winner: null,
    boardRadius: BOARD_RADIUS,
    turnCount: 0,
  };
}
