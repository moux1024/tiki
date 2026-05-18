// Written by Claude GLM-5.1

import { create } from "zustand";
import { GameState, Action, BoardPosition, Direction, GamePhase } from "../game/types";
import { initGame, executeAction, getAllValidActions } from "../game/engine";
import { getAIMove } from "../game/ai";

type UIAction = "none" | "create" | "move";

interface GameStore {
  // Game state
  gameState: GameState;

  // UI state
  selectedAction: UIAction;
  selectedCell: BoardPosition | null;
  selectedDirection: Direction | null;
  animating: boolean;

  // Derived
  phase: GamePhase;

  // Actions
  startGame: (vsAI: boolean) => void;
  resetGame: () => void;
  selectAction: (action: UIAction) => void;
  selectCell: (pos: BoardPosition) => void;
  selectDirection: (dir: Direction) => void;
  executeCreate: (pos: BoardPosition) => void;
  executeMove: (from: BoardPosition, direction: Direction) => void;
}

const defaultState: GameState = {
  board: [[], [], []] as any,
  players: [
    { id: 0, color: "red", fruits: 0, supply: 8 },
    { id: 1, color: "blue", fruits: 0, supply: 8 },
  ],
  currentPlayer: 0,
  phase: "menu",
  fruitSupply: 20,
  winner: null,
  vsAI: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: defaultState,
  selectedAction: "none",
  selectedCell: null,
  selectedDirection: null,
  animating: false,
  phase: "menu",

  startGame: (vsAI: boolean) => {
    const state = initGame(vsAI);
    set({
      gameState: state,
      phase: "playing",
      selectedAction: "none",
      selectedCell: null,
      selectedDirection: null,
      animating: false,
    });

    if (vsAI) {
      setTimeout(() => triggerAI(get, set), 600);
    }
  },

  resetGame: () => {
    set({
      gameState: defaultState,
      phase: "menu",
      selectedAction: "none",
      selectedCell: null,
      selectedDirection: null,
      animating: false,
    });
  },

  selectAction: (action: UIAction) => {
    set({ selectedAction: action, selectedCell: null, selectedDirection: null });
  },

  selectCell: (pos: BoardPosition) => {
    const { gameState, selectedAction } = get();
    if (gameState.phase !== "playing") return;

    if (selectedAction === "create") {
      get().executeCreate(pos);
    } else if (selectedAction === "move") {
      const { selectedCell } = get();
      if (!selectedCell) {
        // Select the totem to move
        const village = gameState.board[pos.row][pos.col];
        if (
          village.stack.length > 0 &&
          village.stack[village.stack.length - 1].owner === gameState.currentPlayer
        ) {
          set({ selectedCell: pos });
        }
      }
    }
  },

  selectDirection: (dir: Direction) => {
    const { gameState, selectedCell } = get();
    if (!selectedCell) return;
    get().executeMove(selectedCell, dir);
  },

  executeCreate: (pos: BoardPosition) => {
    const { gameState } = get();
    if (gameState.phase !== "playing") return;
    if (gameState.players[gameState.currentPlayer].supply <= 0) return;

    const action: Action = { type: "create", position: pos };
    const newState = executeAction(gameState, action);
    set({ gameState: newState, phase: newState.phase, selectedAction: "none", selectedCell: null });

    if (newState.phase === "playing" && newState.vsAI) {
      setTimeout(() => triggerAI(get, set), 600);
    }
  },

  executeMove: (from: BoardPosition, direction: Direction) => {
    const { gameState } = get();
    if (gameState.phase !== "playing") return;

    const action: Action = { type: "move", from, direction };
    const newState = executeAction(gameState, action);
    set({
      gameState: newState,
      phase: newState.phase,
      selectedAction: "none",
      selectedCell: null,
      selectedDirection: null,
    });

    if (newState.phase === "playing" && newState.vsAI) {
      setTimeout(() => triggerAI(get, set), 600);
    }
  },
}));

function triggerAI(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void
) {
  const { gameState } = get();
  if (gameState.phase !== "playing" || !gameState.vsAI) return;
  if (gameState.currentPlayer !== 1) return;

  set({ animating: true });

  setTimeout(() => {
    const currentState = get().gameState;
    if (currentState.phase !== "playing" || currentState.currentPlayer !== 1) {
      set({ animating: false });
      return;
    }

    const action = getAIMove(currentState, "medium");
    if (!action) {
      set({ animating: false });
      return;
    }

    const newState = executeAction(currentState, action);
    set({
      gameState: newState,
      phase: newState.phase,
      animating: false,
      selectedAction: "none",
      selectedCell: null,
    });
  }, 500);
}
