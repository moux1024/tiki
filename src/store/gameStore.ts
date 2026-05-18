// Written by Claude GLM-5.1

import { create } from "zustand";
import { GameState, Action, BoardPosition, Direction, GamePhase } from "../game/types";
import { initGame, executeAction, getAllValidActions } from "../game/engine";
import { getAIMove } from "../game/ai";
import { getStep } from "../game/rules";

type UIAction = "none" | "create" | "move";

interface GameStore {
  // Game state
  gameState: GameState;

  // UI state
  selectedAction: UIAction;
  selectedCell: BoardPosition | null;
  animating: boolean;

  // Multi-step move state
  moveStepDirections: Direction[];       // Directions chosen so far
  moveRemainingSteps: number;            // Steps remaining
  moveCurrentPos: BoardPosition | null;  // Virtual position during multi-step move

  // Derived
  phase: GamePhase;

  // Actions
  startGame: (vsAI: boolean) => void;
  resetGame: () => void;
  selectAction: (action: UIAction) => void;
  selectCell: (pos: BoardPosition) => void;
  selectDirection: (dir: Direction) => void;
  cancelMove: () => void;
  executeCreate: (pos: BoardPosition) => void;
}

const placeholderBoard: GameState["board"] = Array.from({ length: 3 }, (_, r) =>
  Array.from({ length: 3 }, (_, c) => ({
    position: { row: r, col: c },
    tileType: "swamp" as const,
    stack: [],
  }))
);

const defaultState: GameState = {
  board: placeholderBoard,
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
  animating: false,
  moveStepDirections: [],
  moveRemainingSteps: 0,
  moveCurrentPos: null,
  phase: "menu",

  startGame: (vsAI: boolean) => {
    const state = initGame(vsAI);
    set({
      gameState: state,
      phase: "playing",
      selectedAction: "none",
      selectedCell: null,
      animating: false,
      moveStepDirections: [],
      moveRemainingSteps: 0,
      moveCurrentPos: null,
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
      animating: false,
      moveStepDirections: [],
      moveRemainingSteps: 0,
      moveCurrentPos: null,
    });
  },

  selectAction: (action: UIAction) => {
    set({
      selectedAction: action,
      selectedCell: null,
      moveStepDirections: [],
      moveRemainingSteps: 0,
      moveCurrentPos: null,
    });
  },

  selectCell: (pos: BoardPosition) => {
    const { gameState, selectedAction, moveRemainingSteps } = get();
    if (gameState.phase !== "playing") return;

    if (selectedAction === "create") {
      get().executeCreate(pos);
    } else if (selectedAction === "move" && moveRemainingSteps === 0) {
      // Select the totem to move
      const village = gameState.board[pos.row][pos.col];
      if (
        village.stack.length > 0 &&
        village.stack[village.stack.length - 1].owner === gameState.currentPlayer
      ) {
        const height = village.stack.length;
        set({
          selectedCell: pos,
          moveStepDirections: [],
          moveRemainingSteps: height,
          moveCurrentPos: pos,
        });
      }
    }
  },

  selectDirection: (dir: Direction) => {
    const { gameState, selectedCell, moveStepDirections, moveRemainingSteps, moveCurrentPos } = get();
    if (!selectedCell || !moveCurrentPos || moveRemainingSteps <= 0) return;

    // Check if this step is valid (in bounds)
    const nextPos = getStep(moveCurrentPos, dir);
    if (nextPos.row < 0 || nextPos.row >= 3 || nextPos.col < 0 || nextPos.col >= 3) return;

    const newDirections = [...moveStepDirections, dir];
    const newRemaining = moveRemainingSteps - 1;

    if (newRemaining === 0) {
      // All steps chosen, execute the move
      const action: Action = { type: "move", from: selectedCell, directions: newDirections };
      const newState = executeAction(gameState, action);
      set({
        gameState: newState,
        phase: newState.phase,
        selectedAction: "none",
        selectedCell: null,
        moveStepDirections: [],
        moveRemainingSteps: 0,
        moveCurrentPos: null,
      });

      if (newState.phase === "playing" && newState.vsAI) {
        setTimeout(() => triggerAI(get, set), 600);
      }
    } else {
      // More steps to go
      set({
        moveStepDirections: newDirections,
        moveRemainingSteps: newRemaining,
        moveCurrentPos: nextPos,
      });
    }
  },

  cancelMove: () => {
    set({
      selectedAction: "none",
      selectedCell: null,
      moveStepDirections: [],
      moveRemainingSteps: 0,
      moveCurrentPos: null,
    });
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
      moveStepDirections: [],
      moveRemainingSteps: 0,
      moveCurrentPos: null,
    });
  }, 500);
}
