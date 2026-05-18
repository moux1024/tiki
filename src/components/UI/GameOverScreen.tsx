// Written by Claude Opus 4.7

import { useGameStore } from '../../store/gameStore';
import { PLAYER_COLORS } from '../../game/types';

export function GameOverScreen() {
  const state = useGameStore((s) => s.state);
  const resetToMenu = useGameStore((s) => s.resetToMenu);

  const winner = state.winner;
  const winnerName = winner ? state.players[winner].name : 'Nobody';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[380px] rounded-2xl border border-[#d4a020]/30 bg-[#0d1117]/95 p-8 text-center shadow-2xl">
        <h2 className="text-4xl font-bold text-[#d4a020]">
          {winner ? 'Victory!' : 'Draw!'}
        </h2>
        <p className="mt-3 text-lg text-white">
          {winner ? `${winnerName} wins!` : 'The game is a tie!'}
        </p>

        {winner && (
          <div className="mt-4 flex justify-center">
            <div
              className="h-4 w-4 rounded-full"
              style={{ background: PLAYER_COLORS[winner] }}
            />
          </div>
        )}

        {/* Final scores */}
        <div className="mt-6 flex justify-center gap-8">
          {Object.values(state.players).map((player) => (
            <div key={player.id} className="text-center">
              <div
                className="mx-auto mb-1 h-3 w-3 rounded-full"
                style={{ background: player.color }}
              />
              <p className="text-sm text-[#8b9dc3]">{player.name}</p>
              <p className="text-2xl font-bold text-[#d4a020]">{player.fruits}</p>
              <p className="text-xs text-[#5a6a7a]">fruits</p>
            </div>
          ))}
        </div>

        <button
          onClick={resetToMenu}
          className="mt-8 w-full rounded-xl bg-[#d4a020] py-3 text-sm font-bold text-[#0d1117] transition-all hover:bg-[#e8b82e] active:scale-95"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
