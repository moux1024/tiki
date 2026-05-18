// Written by Claude GLM-5.1

import { useState } from 'react';
import { PLAYER_COLORS, PLAYER_COLOR_NAMES } from '../../game/types';

interface MainMenuProps {
  onStart: (playerCount: number, aiPlayers: number[]) => void;
}

export default function MainMenu({ onStart }: MainMenuProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [aiCount, setAiCount] = useState(1);

  const colors = ['red', 'blue', 'green', 'yellow'] as const;

  const handleStart = () => {
    const aiPlayers: number[] = [];
    // Make the last N players AI
    for (let i = playerCount - aiCount; i < playerCount; i++) {
      aiPlayers.push(i);
    }
    onStart(playerCount, aiPlayers);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full mx-4 border border-amber-500/30 shadow-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-400 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            🏝️ TIKI
          </h1>
          <p className="text-amber-200/70 text-sm tracking-widest uppercase">
            Island Board Game
          </p>
        </div>

        {/* Player count */}
        <div className="mb-6">
          <label className="text-amber-300 text-sm font-semibold block mb-3">
            Number of Players
          </label>
          <div className="flex gap-3">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setPlayerCount(n);
                  if (aiCount >= n) setAiCount(n - 1);
                }}
                className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all ${
                  playerCount === n
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            {colors.slice(0, playerCount).map((color, i) => (
              <div
                key={color}
                className="flex-1 text-center text-xs py-1 rounded"
                style={{ backgroundColor: PLAYER_COLORS[color] + '33', color: PLAYER_COLORS[color] }}
              >
                P{i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* AI count */}
        <div className="mb-8">
          <label className="text-amber-300 text-sm font-semibold block mb-3">
            AI Opponents
          </label>
          <div className="flex gap-3">
            {Array.from({ length: playerCount }, (_, i) => i).map((n) => (
              <button
                key={n}
                onClick={() => setAiCount(n)}
                className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all ${
                  aiCount === n
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-xl rounded-xl
            hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20
            active:scale-[0.98]"
        >
          Start Game
        </button>

        {/* Instructions */}
        <div className="mt-6 text-gray-400 text-xs space-y-1">
          <p className="text-amber-200/60 font-semibold text-sm mb-2">How to Play</p>
          <p>🏝️ Control sacred sites (gold tiles) to score points</p>
          <p>🗿 Place Tiki totems on the hexagonal island board</p>
          <p>⚔️ Move, stack, or sacrifice your totems strategically</p>
          <p>🏆 The player with the highest score wins!</p>
        </div>
      </div>
    </div>
  );
}
