// Written by Claude GLM-5.1

import {
  GameState,
  Action,
  BoardPosition,
  Direction,
  PIECES_PER_PLAYER,
  BOARD_SIZE,
  TOTEM_RESOLVE_HEIGHT,
  posEqual,
} from "./types";
import {
  createBoard,
  getValidCreatePositions,
  getOwnedTotems,
  canMoveTotem,
  getStep,
  resolveAffectedVillages,
  checkWinCondition,
  createPiece,
  resetPieceCounter,
} from "./rules";

export function initGame(vsAI: boolean): GameState {
  resetPieceCounter();
  const board = createBoard();
  return {
    board,
    players: [
      { id: 0, color: "red", fruits: 0, supply: PIECES_PER_PLAYER },
      { id: 1, color: "blue", fruits: 0, supply: PIECES_PER_PLAYER },
    ],
    currentPlayer: 0,
    phase: "playing",
    fruitSupply: 20,
    winner: null,
    vsAI,
  };
}

export function executeAction(state: GameState, action: Action): GameState {
  const player = state.players[state.currentPlayer];

  if (action.type === "create") {
    const validPositions = getValidCreatePositions(state);
    if (!validPositions.some((p) => posEqual(p, action.position))) return state;
    if (player.supply <= 0) return state;

    const piece = createPiece(state.currentPlayer);
    const newBoard = state.board.map((row) =>
      row.map((v) => ({ ...v, stack: [...v.stack] }))
    );
    const { row, col } = action.position;
    newBoard[row][col] = {
      ...newBoard[row][col],
      stack: [...newBoard[row][col].stack, piece],
    };

    const newPlayers: typeof state.players = [
      { ...state.players[0] },
      { ...state.players[1] },
    ];
    newPlayers[state.currentPlayer].supply -= 1;

    let newState: GameState = { ...state, board: newBoard, players: newPlayers };

    // Resolve height-3 totems at the created position
    newState = resolveAffectedVillages(newState, [action.position]);

    // Check win
    const result = checkWinCondition(newState);
    if (result.gameOver) {
      return { ...newState, phase: "gameOver", winner: result.winner ?? null };
    }

    return switchTurn(newState);
  }

  if (action.type === "move") {
    const { from, directions } = action;
    if (!canMoveTotem(state, from, directions)) return state;

    const village = state.board[from.row][from.col];
    const height = village.stack.length;

    const newBoard = state.board.map((row) =>
      row.map((v) => ({ ...v, stack: [...v.stack] }))
    );

    // Take all pieces from source
    const movingPieces = [...newBoard[from.row][from.col].stack];
    newBoard[from.row][from.col] = { ...newBoard[from.row][from.col], stack: [] };

    // Caterpillar move: for each step, drop the bottom piece at the current position, then move
    const affectedPositions: BoardPosition[] = [];
    let currentPos = from;

    for (let i = 0; i < height; i++) {
      const pieceToLeave = movingPieces[i]; // bottom piece of remaining stack

      // Drop the bottom piece at current position
      newBoard[currentPos.row][currentPos.col] = {
        ...newBoard[currentPos.row][currentPos.col],
        stack: [...newBoard[currentPos.row][currentPos.col].stack, pieceToLeave],
      };
      affectedPositions.push(currentPos);

      // Move to next position
      currentPos = getStep(currentPos, directions[i]);
    }

    // After all steps, all pieces have been dropped. currentPos is the final destination
    // but no piece remains there.

    let newState: GameState = { ...state, board: newBoard };

    // Resolve affected villages
    newState = resolveAffectedVillages(newState, affectedPositions);

    // Check win
    const result = checkWinCondition(newState);
    if (result.gameOver) {
      return { ...newState, phase: "gameOver", winner: result.winner ?? null };
    }

    return switchTurn(newState);
  }

  return state;
}

function switchTurn(state: GameState): GameState {
  const next = (state.currentPlayer === 0 ? 1 : 0) as 0 | 1;

  // Check if next player has any valid actions
  const nextState = { ...state, currentPlayer: next };
  const canCreate = state.players[next].supply > 0 && getValidCreatePositions(nextState).length > 0;
  const canMove = getAllValidActions(nextState).some((a) => a.type === "move");

  if (!canCreate && !canMove) {
    // Next player can't move - check if current player also can't
    const curCanCreate = state.players[state.currentPlayer].supply > 0 && getValidCreatePositions(state).length > 0;
    const curCanMove = getAllValidActions(state).some((a) => a.type === "move");
    if (!curCanCreate && !curCanMove) {
      const result = checkWinCondition(state);
      return { ...state, phase: "gameOver", winner: result.winner ?? null };
    }
  }

  return nextState;
}

/** Generate all valid direction sequences of given length from a starting position */
function generateDirectionSequences(
  from: BoardPosition,
  length: number
): Direction[][] {
  if (length === 0) return [[]];

  const allDirections: Direction[] = ["up", "down", "left", "right"];
  const results: Direction[][] = [];

  function backtrack(currentPos: BoardPosition, seq: Direction[]) {
    if (seq.length === length) {
      results.push([...seq]);
      return;
    }
    for (const dir of allDirections) {
      const next = getStep(currentPos, dir);
      if (next.row >= 0 && next.row < BOARD_SIZE && next.col >= 0 && next.col < BOARD_SIZE) {
        seq.push(dir);
        backtrack(next, seq);
        seq.pop();
      }
    }
  }

  backtrack(from, []);
  return results;
}

export function getAllValidActions(state: GameState): Action[] {
  const actions: Action[] = [];
  const player = state.players[state.currentPlayer];

  // Create actions
  if (player.supply > 0) {
    for (const pos of getValidCreatePositions(state)) {
      actions.push({ type: "create", position: pos });
    }
  }

  // Move actions: for each owned totem, generate all valid direction sequences
  for (const totem of getOwnedTotems(state, state.currentPlayer)) {
    // Only height 1 or 2 can be moved (height 3 resolves immediately)
    if (totem.height >= TOTEM_RESOLVE_HEIGHT) continue;

    const sequences = generateDirectionSequences(totem.position, totem.height);
    for (const dirs of sequences) {
      actions.push({ type: "move", from: totem.position, directions: dirs });
    }
  }

  return actions;
}
