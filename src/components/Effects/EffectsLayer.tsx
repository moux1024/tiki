// Written by Claude Opus 4.7

import { useGameStore } from '../../store/gameStore';
import { type PlayerID as PlayerIDType } from '../../game/types';

export function EffectsLayer() {
  const lastResolved = useGameStore((s) => s.lastResolved);
  const state = useGameStore((s) => s.state);

  if (!lastResolved || lastResolved.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      {lastResolved.map((resolved, i) => {
        const player = state.players[resolved.owner];
        const isPositive = resolved.effect > 0;
        const isNegative = resolved.effect < 0;

        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 animate-bounce"
          >
            <div
              className="rounded-xl px-6 py-3 text-center text-2xl font-bold shadow-lg"
              style={{
                background: isPositive
                  ? 'rgba(46, 204, 113, 0.9)'
                  : isNegative
                  ? 'rgba(231, 76, 60, 0.9)'
                  : 'rgba(100, 100, 100, 0.9)',
                color: 'white',
                border: `2px solid ${player.color}`,
              }}
            >
              {resolved.effect > 0 ? `+${resolved.effect}` : resolved.effect < 0 ? `${resolved.effect}` : 'Swamp'}
              {' '}
              {player.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
