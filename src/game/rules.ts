// Written by Claude GLM-5.1

import {
  GameState,
  BoardPosition,
  Village,
  TikiPiece,
  TILE_DISTRIBUTION,
  TILE_INFO,
  BOARD_SIZE,
  FRUIT_TO_WIN,
  PIECES_PER_PLAYER,
  TOTEM_RESOLVE_HEIGHT,
  posEqual,
} from "./types";

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getValidCreatePositions(state: GameState): BoardPosition[] {
  const positions: BoardPosition[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (state.board[r][c].stack.length === 0) {
        positions.push({ row: r, col: c });
      }
    }
  }
  return positions;
}

export function getOwnedTotems(
  state: GameState,
  playerId: number
): { position: BoardPosition; height: number }[] {
  const totems: { position: BoardPosition; height: number }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const stack = state.board[r][c].stack;
      if (stack.length > 0 && stack[stack.length - 1].owner === playerId) {
        totems.push({ position: { row: r, col: c }, height: stack.length });
      }
    }
  }
  return totems;
}

function isInBounds(pos: BoardPosition): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

function getStep(pos: BoardPosition, dir: "up" | "down" | "left" | "right"): BoardPosition {
  switch (dir) {
    case "up":    return { row: pos.row - 1, col: pos.col };
    case "down":  return { row: pos.row + 1, col: pos.col };
    case "left":  return { row: pos.row, col: pos.col - 1 };
    case "right": return { row: pos.row, col: pos.col + 1 };
  }
}

export function canMoveTotem(
  state: GameState,
  from: BoardPosition,
  direction: "up" | "down" | "left" | "right"
): boolean {
  const village = state.board[from.row][from.col];
  if (village.stack.length === 0) return false;
  if (village.stack[village.stack.length - 1].owner !== state.currentPlayer) return false;

  const height = village.stack.length;
  let current = from;
  for (let step = 0; step < height; step++) {
    current = getStep(current, direction);
    if (!isInBounds(current)) return false;
  }
  return true;
}

export function getMovePath(
  from: BoardPosition,
  direction: "up" | "down" | "left" | "right",
  height: number
): BoardPosition[] {
  const path: BoardPosition[] = [];
  let current = from;
  for (let step = 0; step < height; step++) {
    current = getStep(current, direction);
    path.push(current);
  }
  return path;
}

export function resolveAffectedVillages(
  state: GameState,
  affectedPositions: BoardPosition[]
): GameState {
  const newBoard = state.board.map((row) =>
    row.map((v) => ({ ...v, stack: [...v.stack] }))
  );
  const players: [typeof state.players[0], typeof state.players[1]] = [
    { ...state.players[0] },
    { ...state.players[1] },
  ];
  let fruitSupply = state.fruitSupply;

  const allPositions = new Set<string>();
  for (const pos of affectedPositions) {
    allPositions.add(`${pos.row},${pos.col}`);
  }

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!allPositions.has(`${r},${c}`)) continue;
      const village = newBoard[r][c];
      if (village.stack.length < TOTEM_RESOLVE_HEIGHT) continue;

      const owner = village.stack[village.stack.length - 1].owner;
      const effect = TILE_INFO[village.tileType].effect;

      if (effect > 0 && fruitSupply > 0) {
        const gained = Math.min(effect, fruitSupply);
        players[owner].fruits += gained;
        fruitSupply -= gained;
      } else if (effect < 0) {
        players[owner].fruits = Math.max(0, players[owner].fruits + effect);
      }

      // Return pieces to owners' supply
      for (const piece of village.stack) {
        players[piece.owner].supply += 1;
      }
      newBoard[r][c] = { ...village, stack: [] };
    }
  }

  return { ...state, board: newBoard, players, fruitSupply };
}

export function checkWinCondition(state: GameState): { gameOver: boolean; winner?: number } {
  for (let i = 0; i < 2; i++) {
    if (state.players[i].fruits >= FRUIT_TO_WIN) {
      return { gameOver: true, winner: i };
    }
  }

  // Check supply exhaustion - game ends when both players can't create and can't move
  const p0CanCreate = state.players[0].supply > 0 && getValidCreatePositions(state).length > 0;
  const p1CanCreate = state.players[1].supply > 0 && getValidCreatePositions(state).length > 0;
  const p0CanMove = getOwnedTotems(state, 0).some((t) => {
    return (["up", "down", "left", "right"] as const).some((d) => canMoveTotem(state, t.position, d));
  });
  const p1CanMove = getOwnedTotems(state, 1).some((t) => {
    return (["up", "down", "left", "right"] as const).some((d) => canMoveTotem(state, t.position, d));
  });

  if (!p0CanCreate && !p0CanMove && !p1CanCreate && !p1CanMove) {
    if (state.players[0].fruits > state.players[1].fruits) return { gameOver: true, winner: 0 };
    if (state.players[1].fruits > state.players[0].fruits) return { gameOver: true, winner: 1 };
    return { gameOver: true, winner: 0 };
  }

  return { gameOver: false };
}

export function createBoard(): Village[][] {
  const tiles = shuffleArray(TILE_DISTRIBUTION);
  const board: Village[][] = [];
  let idx = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[r][c] = {
        position: { row: r, col: c },
        tileType: tiles[idx++],
        stack: [],
      };
    }
  }
  return board;
}

let pieceCounter = 0;

export function createPiece(owner: number): TikiPiece {
  return { id: `p${pieceCounter++}`, owner };
}

export function resetPieceCounter(): void {
  pieceCounter = 0;
}
