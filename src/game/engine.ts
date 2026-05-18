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
  getMovePath,
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
    const { from, direction } = action;
    if (!canMoveTotem(state, from, direction)) return state;

    const village = state.board[from.row][from.col];
    const height = village.stack.length;
    const path = getMovePath(from, direction, height);

    const newBoard = state.board.map((row) =>
      row.map((v) => ({ ...v, stack: [...v.stack] }))
    );

    // Remove all pieces from source
    const movingPieces = [...newBoard[from.row][from.col].stack];
    newBoard[from.row][from.col] = { ...newBoard[from.row][from.col], stack: [] };

    // Place pieces along the path: bottom piece stays at each step
    const affectedPositions: BoardPosition[] = [];
    for (let i = 0; i < height; i++) {
      const stepPos = path[i];
      const pieceToLeave = movingPieces[i];
      newBoard[stepPos.row][stepPos.col] = {
        ...newBoard[stepPos.row][stepPos.col],
        stack: [...newBoard[stepPos.row][stepPos.col].stack, pieceToLeave],
      };
      affectedPositions.push(stepPos);
    }

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
  const canCreate = state.players[next].supply > 0 && getValidCreatePositions(state).length > 0;
  const canMove = getOwnedTotems(state, next).some((t) => {
    return (["up", "down", "left", "right"] as const).some(
      (d) => canMoveTotem({ ...state, currentPlayer: next }, t.position, d)
    );
  });

  if (!canCreate && !canMove) {
    // Next player can't move - check if current player also can't
    const curCanCreate = state.players[state.currentPlayer].supply > 0 && getValidCreatePositions(state).length > 0;
    const curCanMove = getOwnedTotems(state, state.currentPlayer).some((t) => {
      return (["up", "down", "left", "right"] as const).some(
        (d) => canMoveTotem(state, t.position, d)
      );
    });
    if (!curCanCreate && !curCanMove) {
      const result = checkWinCondition(state);
      return { ...state, phase: "gameOver", winner: result.winner ?? null };
    }
  }

  return { ...state, currentPlayer: next };
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

  // Move actions
  for (const totem of getOwnedTotems(state, state.currentPlayer)) {
    for (const dir of ["up", "down", "left", "right"] as const) {
      if (canMoveTotem(state, totem.position, dir)) {
        actions.push({ type: "move", from: totem.position, direction: dir });
      }
    }
  }

  return actions;
}
