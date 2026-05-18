// Written by Claude GLM-5.1

import { useGameStore } from "../../store/gameStore";
import { PLAYER_COLORS } from "../../game/types";

export default function GameOver() {
  const gameState = useGameStore((s) => s.gameState);
  const resetGame = useGameStore((s) => s.resetGame);

  if (gameState.phase !== "gameOver") return null;

  const winner = gameState.winner;
  const winnerPlayer = winner !== null ? gameState.players[winner] : null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
      <div className="bg-black/90 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 border border-amber-500/40 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏆</div>
          <h2 className="text-3xl font-bold text-amber-400 mb-2">Game Over!</h2>
          {winnerPlayer && (
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: PLAYER_COLORS[winnerPlayer.color] }}
              />
              <span
                className="text-xl font-bold"
                style={{ color: PLAYER_COLORS[winnerPlayer.color] }}
              >
                {winnerPlayer.color === "red" ? "Red" : "Blue"} Wins!
              </span>
            </div>
          )}
        </div>

        {/* Scores */}
        <div className="space-y-3 mb-8">
          {gameState.players.map((p, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                i === winner
                  ? "bg-amber-500/20 border border-amber-500/30"
                  : "bg-gray-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-amber-300 font-bold w-6">
                  {i === winner ? "👑" : `#${i + 1}`}
                </span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PLAYER_COLORS[p.color] }}
                />
                <span className="text-white font-medium">
                  {p.color === "red" ? "Red" : "Blue"}
                  {gameState.vsAI && i === 1 && " (AI)"}
                </span>
              </div>
              <span className="text-amber-300 font-bold text-lg">🍎 {p.fruits}</span>
            </div>
          ))}
        </div>

        <button
          onClick={resetGame}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold rounded-xl
            hover:from-amber-400 hover:to-orange-500 transition-all"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
