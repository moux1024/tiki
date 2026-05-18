// Written by Claude GLM-5.1

import { useGameStore } from "../../store/gameStore";
import { PLAYER_COLORS, Direction } from "../../game/types";
import { getStep } from "../../game/rules";

export default function GameHUD() {
  const gameState = useGameStore((s) => s.gameState);
  const selectedAction = useGameStore((s) => s.selectedAction);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const selectAction = useGameStore((s) => s.selectAction);
  const selectDirection = useGameStore((s) => s.selectDirection);
  const cancelMove = useGameStore((s) => s.cancelMove);
  const animating = useGameStore((s) => s.animating);
  const moveStepDirections = useGameStore((s) => s.moveStepDirections);
  const moveRemainingSteps = useGameStore((s) => s.moveRemainingSteps);
  const moveCurrentPos = useGameStore((s) => s.moveCurrentPos);

  if (gameState.phase !== "playing") return null;

  const player = gameState.players[gameState.currentPlayer];
  const isAITurn = gameState.vsAI && gameState.currentPlayer === 1;

  const canCreate = player.supply > 0;
  const hasTotems =
    gameState.board.flat().some(
      (v) => v.stack.length > 0 && v.stack[v.stack.length - 1].owner === gameState.currentPlayer
    );

  const directions: { dir: Direction; label: string; icon: string }[] = [
    { dir: "up", label: "Up", icon: "↑" },
    { dir: "down", label: "Down", icon: "↓" },
    { dir: "left", label: "Left", icon: "←" },
    { dir: "right", label: "Right", icon: "→" },
  ];

  const canMoveDir = (dir: Direction): boolean => {
    if (!moveCurrentPos) return false;
    const next = getStep(moveCurrentPos, dir);
    return next.row >= 0 && next.row < 3 && next.col >= 0 && next.col < 3;
  };

  const totalSteps = moveStepDirections.length + moveRemainingSteps;
  const currentStep = moveStepDirections.length + 1;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Top bar - Player info */}
      <div className="flex justify-between items-start p-4 pointer-events-auto">
        {gameState.players.map((p, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded-lg backdrop-blur-md border transition-all ${
              i === gameState.currentPlayer
                ? "bg-black/60 border-amber-500/50 shadow-lg scale-105"
                : "bg-black/40 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PLAYER_COLORS[p.color] }}
              />
              <span className="text-white text-sm font-medium">
                {i === 0 ? "Red" : "Blue"}
                {gameState.vsAI && i === 1 && " (AI)"}
              </span>
            </div>
            <div className="text-amber-300 text-xs mt-1">
              🍎 {p.fruits} | Supply: {p.supply}
            </div>
          </div>
        ))}
      </div>

      {/* Turn indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-amber-500/30">
          <div
            className="text-sm font-bold text-center"
            style={{ color: PLAYER_COLORS[player.color] }}
          >
            {isAITurn ? "AI Thinking..." : `${player.color === "red" ? "Red" : "Blue"}'s Turn`}
          </div>
        </div>
      </div>

      {/* Bottom bar - Actions */}
      {!isAITurn && (
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="flex flex-col items-center gap-3">
            {/* Direction buttons (shown during multi-step move) */}
            {selectedAction === "move" && selectedCell && moveRemainingSteps > 0 && (
              <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-amber-500/20">
                <div className="text-center text-amber-200/60 text-xs mb-1">
                  Step {currentStep} of {totalSteps}: Choose direction
                </div>
                {moveStepDirections.length > 0 && (
                  <div className="text-center text-amber-200/40 text-xs mb-2">
                    Path: {moveStepDirections.map(d => d === "up" ? "↑" : d === "down" ? "↓" : d === "left" ? "←" : "→").join(" ")}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-1 w-32">
                  <div />
                  <button
                    onClick={() => selectDirection("up")}
                    disabled={!canMoveDir("up")}
                    className={`py-2 rounded text-lg font-bold ${
                      canMoveDir("up")
                        ? "bg-amber-500 text-black hover:bg-amber-400"
                        : "bg-gray-800/50 text-gray-600"
                    }`}
                  >
                    ↑
                  </button>
                  <div />
                  <button
                    onClick={() => selectDirection("left")}
                    disabled={!canMoveDir("left")}
                    className={`py-2 rounded text-lg font-bold ${
                      canMoveDir("left")
                        ? "bg-amber-500 text-black hover:bg-amber-400"
                        : "bg-gray-800/50 text-gray-600"
                    }`}
                  >
                    ←
                  </button>
                  <div />
                  <button
                    onClick={() => selectDirection("right")}
                    disabled={!canMoveDir("right")}
                    className={`py-2 rounded text-lg font-bold ${
                      canMoveDir("right")
                        ? "bg-amber-500 text-black hover:bg-amber-400"
                        : "bg-gray-800/50 text-gray-600"
                    }`}
                  >
                    →
                  </button>
                  <div />
                  <button
                    onClick={() => selectDirection("down")}
                    disabled={!canMoveDir("down")}
                    className={`py-2 rounded text-lg font-bold ${
                      canMoveDir("down")
                        ? "bg-amber-500 text-black hover:bg-amber-400"
                        : "bg-gray-800/50 text-gray-600"
                    }`}
                  >
                    ↓
                  </button>
                  <div />
                </div>
              </div>
            )}

            {/* Action selection */}
            <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-amber-500/20">
              <div className="text-center text-amber-200/60 text-xs mb-2">
                {selectedAction === "move" && !selectedCell
                  ? "Select a totem to move"
                  : selectedAction === "move" && selectedCell && moveRemainingSteps > 0
                    ? `Step ${currentStep} of ${totalSteps}: Choose direction`
                    : selectedAction === "create"
                      ? "Select empty village to place piece"
                      : "Choose an action:"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => selectAction("create")}
                  disabled={!canCreate}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedAction === "create"
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                      : canCreate
                        ? "bg-gray-800/80 text-white hover:bg-gray-700/80 border border-gray-600/30"
                        : "bg-gray-900/50 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  🗿 Create
                </button>
                <button
                  onClick={() => selectAction("move")}
                  disabled={!hasTotems}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedAction === "move"
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                      : hasTotems
                        ? "bg-gray-800/80 text-white hover:bg-gray-700/80 border border-gray-600/30"
                        : "bg-gray-900/50 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  ➡️ Move
                </button>
                <button
                  onClick={() => {
                    if (selectedAction === "move" && selectedCell && moveRemainingSteps > 0) {
                      cancelMove();
                    } else {
                      selectAction("none");
                    }
                  }}
                  className="px-3 py-2 rounded-lg text-sm bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
