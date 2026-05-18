// Written by Claude GLM-5.1

import { create } from 'zustand';
import {
  GameState,
  HexCoord,
  ActionType,
  MoveAction,
  GamePhase,
} from '../game/types';
import {
  executeAction,
  nextTurn,
  calculateScores,
  getValidMoves,
  canPlace,
  canMove,
  canAscend,
  canSacrifice,
  initGameState,
} from '../game/rules';
import { getAIMove } from '../game/ai';

interface GameStore extends GameState {
  // Game setup
  startGame: (playerCount: number, aiPlayers: number[]) => void;
  resetGame: () => void;

  // Actions
  selectAction: (action: ActionType) => void;
  handleCellClick: (coord: HexCoord) => void;
  selectCell: (coord: HexCoord | null) => void;

  // Helpers
  getScores: () => number[];
  getValidActions: () => ActionType[];
  getCurrentPlayer: () => { id: number; name: string; color: string; remainingPieces: number; isAI: boolean };
  setPhase: (phase: GamePhase) => void;
}

const initialState: GameState = {
  board: new Map(),
  players: [],
  currentPlayerIndex: 0,
  phase: 'menu',
  selectedAction: 'none',
  selectedCell: null,
  winner: null,
  boardRadius: 4,
  turnCount: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: (playerCount: number, aiPlayers: number[]) => {
    const state = initGameState(playerCount, aiPlayers);
    set({ ...state, phase: 'playing' });

    // If first player is AI, trigger AI move
    const firstPlayer = state.players[0];
    if (firstPlayer.isAI) {
      setTimeout(() => triggerAIMove(get, set), 800);
    }
  },

  resetGame: () => {
    set({ ...initialState, phase: 'menu', board: new Map() });
  },

  selectAction: (action: ActionType) => {
    set({ selectedAction: action, selectedCell: null });
  },

  handleCellClick: (coord: HexCoord) => {
    const state = get();
    if (state.phase !== 'playing') return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.isAI) return; // Don't allow clicks during AI turn

    const playerId = state.currentPlayerIndex;
    const action = state.selectedAction;

    if (action === 'none') {
      // Auto-detect best action based on cell state
      if (canPlace(state, coord, playerId)) {
        const move: MoveAction = { type: 'place', to: coord, playerId };
        const newState = executeAction(state, move);
        const advancedState = nextTurn(newState);
        set(advancedState);
        triggerAIIfNext(advancedState, get, set);
      }
      return;
    }

    if (action === 'place') {
      if (canPlace(state, coord, playerId)) {
        const move: MoveAction = { type: 'place', to: coord, playerId };
        const newState = executeAction(state, move);
        const advancedState = nextTurn(newState);
        set(advancedState);
        triggerAIIfNext(advancedState, get, set);
      }
    } else if (action === 'move') {
      if (!state.selectedCell) {
        // First click: select source
        const cell = state.board.get(`${coord.q},${coord.r}`);
        if (cell && cell.ownerId === playerId && cell.pieces.length > 0) {
          set({ selectedCell: coord });
        }
      } else {
        // Second click: select destination
        if (canMove(state, state.selectedCell, coord, playerId)) {
          const move: MoveAction = {
            type: 'move',
            from: state.selectedCell,
            to: coord,
            playerId,
          };
          const newState = executeAction(state, move);
          const advancedState = nextTurn(newState);
          set({ ...advancedState, selectedCell: null });
          triggerAIIfNext(advancedState, get, set);
        } else {
          set({ selectedCell: null });
        }
      }
    } else if (action === 'ascend') {
      if (canAscend(state, coord, playerId)) {
        const move: MoveAction = { type: 'ascend', to: coord, playerId };
        const newState = executeAction(state, move);
        const advancedState = nextTurn(newState);
        set(advancedState);
        triggerAIIfNext(advancedState, get, set);
      }
    } else if (action === 'sacrifice') {
      if (canSacrifice(state, coord, playerId)) {
        const move: MoveAction = { type: 'sacrifice', to: coord, playerId };
        const newState = executeAction(state, move);
        const advancedState = nextTurn(newState);
        set(advancedState);
        triggerAIIfNext(advancedState, get, set);
      }
    }
  },

  selectCell: (coord: HexCoord | null) => {
    set({ selectedCell: coord });
  },

  getScores: () => {
    return calculateScores(get());
  },

  getValidActions: () => {
    const state = get();
    if (state.phase !== 'playing') return [];
    const actions: ActionType[] = [];
    const pid = state.currentPlayerIndex;

    if (getValidMoves(state, 'place', pid).length > 0) actions.push('place');
    if (getValidMoves(state, 'move', pid).length > 0) actions.push('move');
    if (getValidMoves(state, 'ascend', pid).length > 0) actions.push('ascend');
    if (getValidMoves(state, 'sacrifice', pid).length > 0) actions.push('sacrifice');

    return actions;
  },

  getCurrentPlayer: () => {
    const state = get();
    const p = state.players[state.currentPlayerIndex];
    if (!p) return { id: 0, name: '', color: '', remainingPieces: 0, isAI: false };
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      remainingPieces: p.remainingPieces,
      isAI: p.isAI,
    };
  },

  setPhase: (phase: GamePhase) => {
    set({ phase });
  },
}));

function triggerAIIfNext(
  state: GameState,
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void
) {
  if (state.phase !== 'playing') return;
  const nextPlayer = state.players[state.currentPlayerIndex];
  if (nextPlayer?.isAI) {
    setTimeout(() => triggerAIMove(get, set), 600);
  }
}

function triggerAIMove(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void
) {
  const state = get();
  if (state.phase !== 'playing') return;

  const player = state.players[state.currentPlayerIndex];
  if (!player?.isAI) return;

  const move = getAIMove(state, player.id, player.aiDifficulty || 'medium');
  if (!move) {
    // No valid moves, skip turn
    const advancedState = nextTurn(state);
    set(advancedState);
    triggerAIIfNext(advancedState, get, set);
    return;
  }

  const newState = executeAction(state, move);
  const advancedState = nextTurn(newState);
  set(advancedState);
  triggerAIIfNext(advancedState, get, set);
}
