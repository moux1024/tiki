// Written by Claude GLM-5.1

import { GameState, Action, TILE_INFO, FRUIT_TO_WIN, posEqual } from "./types";
import { getAllValidActions, executeAction } from "./engine";
import {
  getValidCreatePositions,
  getOwnedTotems,
  canMoveTotem,
  getMovePath,
} from "./rules";

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
  const opponentId = myId === 0 ? 1 : 0;
  let score = 0;

  if (action.type === "create") {
    const tile = state.board[action.position.row][action.position.col].tileType;
    const info = TILE_INFO[tile];

    // Prefer creating on positive tiles
    score += info.effect * 5;

    // Check if creating here would make height 3 eventually
    // Prefer tiles where we can later stack to 3
    const adjacentPositive = countAdjacentPositive(state, action.position, myId);
    score += adjacentPositive * 2;

    // Slight preference for center
    const centerDist = Math.abs(action.position.row - 1) + Math.abs(action.position.col - 1);
    score += (2 - centerDist) * 0.5;

    return score;
  }

  if (action.type === "move") {
    const from = action.from;
    const dir = action.direction;
    const height = state.board[from.row][from.col].stack.length;
    const path = getMovePath(from, dir, height);

    // The top piece (last in stack) lands at the final position
    const finalPos = path[path.length - 1];
    const finalVillage = state.board[finalPos.row][finalPos.col];
    const existingStack = finalVillage.stack.length;

    // If the final stack will be height 3, check tile effect
    if (existingStack + 1 >= 3) {
      const effect = TILE_INFO[finalVillage.tileType].effect;
      score += effect * 15;

      // Winning move!
      if (effect > 0 && state.players[myId].fruits + effect >= FRUIT_TO_WIN) {
        score += 100;
      }
    }

    // Also check intermediate positions that might reach height 3
    for (let i = 0; i < path.length - 1; i++) {
      const stepPos = path[i];
      const stepVillage = state.board[stepPos.row][stepPos.col];
      if (stepVillage.stack.length + 1 >= 3) {
        const effect = TILE_INFO[stepVillage.tileType].effect;
        score += effect * 10;
      }
    }

    // Avoid moving onto cursed tiles
    if (TILE_INFO[finalVillage.tileType].effect < 0 && existingStack + 1 < 3) {
      score -= 3;
    }

    // Prefer moving towards positive tiles
    const adjPositive = countAdjacentPositive(state, finalPos, myId);
    score += adjPositive;

    return score;
  }

  return 0;
}

function countAdjacentPositive(
  state: GameState,
  pos: { row: number; col: number },
  _playerId: number
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
