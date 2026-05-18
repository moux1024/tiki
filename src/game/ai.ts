// Written by Claude GLM-5.1

import { GameState, Action, TILE_INFO, FRUIT_TO_WIN } from "./types";
import { getAllValidActions, executeAction } from "./engine";
import { getStep } from "./rules";

export function getAIMove(
  state: GameState,
  difficulty: "easy" | "medium"
): Action | null {
  const actions = getAllValidActions(state);
  if (actions.length === 0) return null;

  if (difficulty === "easy") {
    return actions[Math.floor(Math.random() * actions.length)];
  }

  return mediumAI(state, actions);
}

function mediumAI(state: GameState, actions: Action[]): Action {
  let bestAction = actions[0];
  let bestScore = -Infinity;

  for (const action of actions) {
    const score = evaluateAction(state, action);
    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  }

  if (Math.random() < 0.15 && actions.length > 1) {
    const alternatives = actions.filter((a) => evaluateAction(state, a) > bestScore * 0.5);
    if (alternatives.length > 0) {
      return alternatives[Math.floor(Math.random() * alternatives.length)];
    }
  }

  return bestAction;
}

function evaluateAction(state: GameState, action: Action): number {
  const myId = state.currentPlayer;
  let score = 0;

  if (action.type === "create") {
    const tile = state.board[action.position.row][action.position.col].tileType;
    const info = TILE_INFO[tile];

    // Prefer creating on positive tiles
    score += info.effect * 5;

    // Prefer tiles where we can later stack to 3
    const adjacentPositive = countAdjacentPositive(state, action.position);
    score += adjacentPositive * 2;

    // Slight preference for center
    const centerDist = Math.abs(action.position.row - 1) + Math.abs(action.position.col - 1);
    score += (2 - centerDist) * 0.5;

    return score;
  }

  if (action.type === "move") {
    const { from, directions } = action;
    const height = state.board[from.row][from.col].stack.length;

    // Simulate the caterpillar move to find drop positions
    let currentPos = from;
    for (let i = 0; i < height; i++) {
      // Piece i is dropped at currentPos
      const existingStack = state.board[currentPos.row][currentPos.col].stack.length;

      // Adjust for pieces already dropped in this simulation
      // The first drop is at `from`, which starts with height pieces that are all removed first
      // So existingStack for `from` is 0 (we removed all), plus 1 for the dropped piece
      let effectiveExisting: number;
      if (i === 0) {
        // At `from`, all original pieces are removed, then piece 0 is dropped
        effectiveExisting = 0;
      } else {
        // At other positions, existing pieces + pieces dropped by this move
        effectiveExisting = existingStack;
      }

      const newStackHeight = effectiveExisting + 1;

      if (newStackHeight >= 3) {
        const village = state.board[currentPos.row][currentPos.col];
        const effect = TILE_INFO[village.tileType].effect;
        const pieceOwner = state.board[from.row][from.col].stack[i].owner;

        if (pieceOwner === myId) {
          score += effect * 15;
          if (effect > 0 && state.players[myId].fruits + effect >= FRUIT_TO_WIN) {
            score += 100;
          }
        } else {
          // Opponent's piece on top of resolved totem
          score += effect * -10;
        }
      }

      currentPos = getStep(currentPos, directions[i]);
    }

    // Prefer moves towards positive tiles
    const adjPositive = countAdjacentPositive(state, currentPos);
    score += adjPositive * 0.5;

    return score;
  }

  return 0;
}

function countAdjacentPositive(
  state: GameState,
  pos: { row: number; col: number }
): number {
  let count = 0;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const nr = pos.row + dr;
    const nc = pos.col + dc;
    if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
      const tile = state.board[nr][nc].tileType;
      if (TILE_INFO[tile].effect > 0) count++;
    }
  }
  return count;
}
