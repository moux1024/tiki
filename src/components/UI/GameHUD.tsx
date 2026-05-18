// Written by Claude GLM-5.1

import { useGameStore } from '../../store/gameStore';
import { PLAYER_COLORS, ActionType } from '../../game/types';

export default function GameHUD() {
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const selectedAction = useGameStore((s) => s.selectedAction);
  const selectAction = useGameStore((s) => s.selectAction);
  const getScores = useGameStore((s) => s.getScores);
  const getValidActions = useGameStore((s) => s.getValidActions);
  const getCurrentPlayer = useGameStore((s) => s.getCurrentPlayer);
  const phase = useGameStore((s) => s.phase);

  if (phase !== 'playing') return null;

  const scores = getScores();
  const validActions = getValidActions();
  const currentPlayer = getCurrentPlayer();

  const actionLabels: Record<ActionType, { label: string; icon: string }> = {
    none: { label: 'Auto', icon: '🎯' },
    place: { label: 'Place', icon: '🗿' },
    move: { label: 'Move', icon: '➡️' },
    ascend: { label: 'Ascend', icon: '⬆️' },
    sacrifice: { label: 'Sacrifice', icon: '🔥' },
  };

  const actions: ActionType[] = ['place', 'move', 'ascend', 'sacrifice'];

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Top bar - Player info */}
      <div className="flex justify-between items-start p-4 pointer-events-auto">
        {/* Player scores */}
        <div className="flex gap-2">
          {players.map((player, i) => (
            <div
              key={i}
              className={`px-3 py-2 rounded-lg backdrop-blur-md border transition-all ${
                i === currentPlayerIndex
                  ? 'bg-black/60 border-amber-500/50 shadow-lg scale-105'
                  : 'bg-black/40 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PLAYER_COLORS[player.color] }}
                />
                <span className="text-white text-sm font-medium">{player.name}</span>
              </div>
              <div className="text-amber-300 text-xs mt-1">
                Score: {scores[i] || 0} | Pieces: {player.remainingPieces}
              </div>
            </div>
          ))}
        </div>

        {/* Turn indicator */}
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-amber-500/30">
          <div className="text-amber-300 text-sm font-semibold">
            Turn {currentPlayerIndex + 1}
          </div>
          <div
            className="text-sm font-bold"
            style={{ color: PLAYER_COLORS[currentPlayer.color as keyof typeof PLAYER_COLORS] }}
          >
            {currentPlayer.isAI ? '🤖 AI Thinking...' : `${currentPlayer.name}'s Turn`}
          </div>
        </div>
      </div>

      {/* Bottom bar - Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
        <div className="flex justify-center">
          <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-amber-500/20">
            <div className="text-center text-amber-200/60 text-xs mb-2">
              {currentPlayer.isAI ? 'AI is choosing...' : 'Select an action:'}
            </div>
            <div className="flex gap-2">
              {actions.map((action) => {
                const isValid = validActions.includes(action);
                const isSelected = selectedAction === action;
                const { label, icon } = actionLabels[action];

                return (
                  <button
                    key={action}
                    onClick={() => isValid && !currentPlayer.isAI && selectAction(action)}
                    disabled={!isValid || currentPlayer.isAI}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                        : isValid && !currentPlayer.isAI
                          ? 'bg-gray-800/80 text-white hover:bg-gray-700/80 border border-gray-600/30'
                          : 'bg-gray-900/50 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <span className="mr-1">{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
