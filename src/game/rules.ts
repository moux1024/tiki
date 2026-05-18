// Written by Claude GLM-5.1

import {
  GameState,
  BoardPosition,
  Village,
  TikiPiece,
  Direction,
  TILE_DISTRIBUTION,
  TILE_INFO,
  BOARD_SIZE,
  FRUIT_TO_WIN,
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

export function isInBounds(pos: BoardPosition): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

export function getStep(pos: BoardPosition, dir: Direction): BoardPosition {
  switch (dir) {
    case "up":    return { row: pos.row - 1, col: pos.col };
    case "down":  return { row: pos.row + 1, col: pos.col };
    case "left":  return { row: pos.row, col: pos.col - 1 };
    case "right": return { row: pos.row, col: pos.col + 1 };
  }
}

/** Check if a single step from currentPos in the given direction is in bounds */
export function canMoveStep(currentPos: BoardPosition, dir: Direction): boolean {
  return isInBounds(getStep(currentPos, dir));
}

/** Get all directions that are valid for the first step from the totem's position */
export function getValidFirstDirections(state: GameState, from: BoardPosition): Direction[] {
  const village = state.board[from.row][from.col];
  if (village.stack.length === 0) return [];
  if (village.stack[village.stack.length - 1].owner !== state.currentPlayer) return [];
  // Height 3 totems resolve immediately and cannot be moved
  if (village.stack.length >= TOTEM_RESOLVE_HEIGHT) return [];

  const dirs: Direction[] = [];
  for (const d of ["up", "down", "left", "right"] as Direction[]) {
    if (canMoveStep(from, d)) {
      dirs.push(d);
    }
  }
  return dirs;
}

/** Get all directions valid for the next step from current virtual position */
export function getValidNextDirections(currentPos: BoardPosition): Direction[] {
  const dirs: Direction[] = [];
  for (const d of ["up", "down", "left", "right"] as Direction[]) {
    if (canMoveStep(currentPos, d)) {
      dirs.push(d);
    }
  }
  return dirs;
}

/**
 * Validate a full direction sequence for moving a totem.
 * The sequence length must equal the totem height.
 * Each step must stay in bounds.
 */
export function canMoveTotem(
  state: GameState,
  from: BoardPosition,
  directions: Direction[]
): boolean {
  const village = state.board[from.row][from.col];
  if (village.stack.length === 0) return false;
  if (village.stack[village.stack.length - 1].owner !== state.currentPlayer) return false;
  if (village.stack.length >= TOTEM_RESOLVE_HEIGHT) return false;

  const height = village.stack.length;
  if (directions.length !== height) return false;

  let current = from;
  for (const dir of directions) {
    const next = getStep(current, dir);
    if (!isInBounds(next)) return false;
    current = next;
  }
  return true;
}

/**
 * Simulate a full move and return all positions that get pieces dropped on them.
 * Used for checking which villages might resolve.
 */
export function getMoveDropPositions(
  from: BoardPosition,
  directions: Direction[]
): BoardPosition[] {
  const positions: BoardPosition[] = [];
  let current = from;
  for (const dir of directions) {
    // The bottom piece is left at the current position (where we just were)
    positions.push(current);
    current = getStep(current, dir);
  }
  // The last remaining piece (top) lands at the final position
  // Actually no - with N steps and N pieces, all N pieces are dropped off.
  // After N steps, there are 0 pieces left. But the last piece is dropped at the (N-1)th step's departure point.
  // Wait, let me re-think. The directions length == height.
  // Step i: take bottom piece, leave at current position, move to next.
  // After all N steps, all N pieces have been dropped.
  // The positions where pieces are dropped are: from, step1_pos, step2_pos, ..., step(N-1)_pos
  // That's N positions for N pieces. The final position after the last step has no piece.
  // But wait, that doesn't feel right either.
  // Actually: we have N pieces. Each step we drop one. So after N steps we've dropped N pieces.
  // Piece 0 dropped at `from` (the starting position, which is where we were before step 0)
  // Piece 1 dropped at the position after step 0 (before step 1)
  // ...
  // Piece N-1 dropped at the position after step N-2 (before step N-1)
  // After step N-1 we're at some position but have 0 pieces left.
  // 
  // Hmm wait, that means the final position after all steps has nothing. Let me re-read the spec:
  // "对高度为 N 的图腾，执行 N 步：
  //  1. 从 from 出发，当前图腾 = 原始 stack
  //  2. 每一步 i (0 to N-1):
  //     a. 取出当前图腾的最底部棋子（stack[0]）
  //     b. 剩余棋子 = stack[1:]
  //     c. 将取出的底部棋子叠加到**当前位置**的已有棋子上方
  //     d. 按方向计算新位置
  //     e. 当前位置更新为新位置，当前图腾 = 剩余棋子
  //  3. 最后一步后，当前图腾为空（因为N步脱落N个棋子）"
  // So piece i is dropped at the position BEFORE moving, and after moving there are no pieces left.
  // The "from" position gets piece 0 (bottom), then we move to step 0 target.
  // Step 0 target gets piece 1, then we move to step 1 target.
  // ...
  // After the last step, we've dropped all pieces, nothing remains.
  return positions;
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
    // A totem can move if it has any valid direction sequence
    return hasAnyValidMove(state, t.position);
  });
  const p1CanMove = getOwnedTotems(state, 1).some((t) => {
    return hasAnyValidMove({ ...state, currentPlayer: 1 }, t.position);
  });

  if (!p0CanCreate && !p0CanMove && !p1CanCreate && !p1CanMove) {
    if (state.players[0].fruits > state.players[1].fruits) return { gameOver: true, winner: 0 };
    if (state.players[1].fruits > state.players[0].fruits) return { gameOver: true, winner: 1 };
    return { gameOver: true, winner: 0 };
  }

  return { gameOver: false };
}

/** Check if a totem at `from` has any valid move at all (any direction sequence) */
function hasAnyValidMove(state: GameState, from: BoardPosition): boolean {
  const village = state.board[from.row][from.col];
  if (village.stack.length === 0) return false;
  if (village.stack[village.stack.length - 1].owner !== state.currentPlayer) return false;
  if (village.stack.length >= TOTEM_RESOLVE_HEIGHT) return false;
  // A totem of height 1 or 2 can move if there's at least one in-bounds direction for the first step
  return getValidFirstDirections(state, from).length > 0;
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
