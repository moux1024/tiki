// Written by Claude GLM-5.1

import { GameState, MoveAction } from './types';
import { getValidMoves, calculateScores } from './rules';
import { getCell, hexDistance } from './engine';

export function getAIMove(
  state: GameState,
  playerId: number,
  difficulty: 'easy' | 'medium'
): MoveAction | null {
  const allActions: Array<MoveAction['type']> = ['place', 'move', 'ascend', 'sacrifice'];

  // Gather all valid moves across all action types
  const allMoves: MoveAction[] = [];
  for (const actionType of allActions) {
    allMoves.push(...getValidMoves(state, actionType, playerId));
  }

  if (allMoves.length === 0) return null;

  if (difficulty === 'easy') {
    return easyAI(allMoves);
  }

  return mediumAI(state, allMoves, playerId);
}

function easyAI(moves: MoveAction[]): MoveAction {
  return moves[Math.floor(Math.random() * moves.length)];
}

function mediumAI(
  state: GameState,
  moves: MoveAction[],
  playerId: number
): MoveAction {
  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const score = evaluateMove(state, move, playerId);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  // Add small random factor to avoid being too predictable
  if (Math.random() < 0.15 && moves.length > 1) {
    const alternatives = moves.filter((m) => evaluateMove(state, m, playerId) > bestScore * 0.6);
    if (alternatives.length > 0) {
      return alternatives[Math.floor(Math.random() * alternatives.length)];
    }
  }

  return bestMove;
}

function evaluateMove(
  state: GameState,
  move: MoveAction,
  playerId: number
): number {
  let score = 0;
  const targetCell = getCell(state.board, move.to);

  if (!targetCell) return 0;

  // Highly prioritize sacred sites
  if (targetCell.isSacredSite && targetCell.ownerId !== playerId) {
    score += 15;
  }

  // Prioritize center positions
  const distFromCenter = hexDistance(move.to, { q: 0, r: 0 });
  score += (state.boardRadius - distFromCenter) * 1.5;

  // Prefer placing over other actions early game
  if (move.type === 'place') {
    score += 3;
  }

  // Prefer moving to opponent's cells (capture)
  if (move.type === 'move' && targetCell.ownerId !== null && targetCell.ownerId !== playerId) {
    score += 8;
  }

  // Ascend is good for tall stacks
  if (move.type === 'ascend') {
    score += 4;
  }

  // Sacrifice near sacred sites for strategic advantage
  if (move.type === 'sacrifice') {
    if (targetCell.isSacredSite) {
      score -= 5; // Don't sacrifice sacred site control
    } else {
      score += 2;
    }
  }

  // Avoid placing/moving adjacent to stronger opponent stacks
  if (move.type === 'place' || move.type === 'move') {
    const neighbors = getNeighborThreats(state, move.to, playerId);
    score -= neighbors * 2;
  }

  return score;
}

function getNeighborThreats(
  state: GameState,
  coord: { q: number; r: number },
  playerId: number
): number {
  const dirs = [
    { q: 1, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 1 },
    { q: 0, r: -1 }, { q: 1, r: -1 }, { q: -1, r: 1 },
  ];
  let threats = 0;
  for (const d of dirs) {
    const neighbor = getCell(state.board, { q: coord.q + d.q, r: coord.r + d.r });
    if (neighbor && neighbor.ownerId !== null && neighbor.ownerId !== playerId) {
      threats += neighbor.stackHeight;
    }
  }
  return threats;
}
