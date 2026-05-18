// Written by Claude GLM-5.1

import { useState } from "react";

interface Props {
  onStart: (vsAI: boolean) => void;
}

export default function MainMenu({ onStart }: Props) {
  const [vsAI, setVsAI] = useState(true);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full mx-4 border border-amber-500/30 shadow-2xl">
        <div className="text-center mb-8">
          <h1
            className="text-5xl font-bold text-amber-400 mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            TIKI
          </h1>
          <p className="text-amber-200/70 text-sm tracking-widest uppercase">
            Island Board Game
          </p>
        </div>

        {/* Game mode */}
        <div className="mb-6">
          <label className="text-amber-300 text-sm font-semibold block mb-3">
            Game Mode
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setVsAI(true)}
              className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all ${
                vsAI
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              vs AI
            </button>
            <button
              onClick={() => setVsAI(false)}
              className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all ${
                !vsAI
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              2 Players
            </button>
          </div>
        </div>

        <button
          onClick={() => onStart(vsAI)}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-xl rounded-xl
            hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20
            active:scale-[0.98]"
        >
          Start Game
        </button>

        {/* Rules */}
        <div className="mt-6 text-gray-400 text-xs space-y-1">
          <p className="text-amber-200/60 font-semibold text-sm mb-2">Rules</p>
          <p>🏝️ 3x3 board with 9 village tiles (shuffled)</p>
          <p>🍎 Each player has 8 tiki pieces. CREATE or MOVE each turn</p>
          <p>🗿 Move totem = move stack N steps, leaving bottom piece at each step</p>
          <p>⚡ Height-3 totems resolve: owner gets fruit, pieces return to supply</p>
          <p>🏆 First to 4 fruits wins! Most fruits if supply exhausted</p>
        </div>
      </div>
    </div>
  );
}
