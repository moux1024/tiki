// Written by Claude GLM-5.1

export interface HexCoord {
  q: number;
  r: number;
}

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export interface TikiPiece {
  id: string;
  color: PlayerColor;
  height: number;
  position: HexCoord;
}

export interface Player {
  id: number;
  name: string;
  color: PlayerColor;
  score: number;
  remainingPieces: number;
  isAI: boolean;
  aiDifficulty?: 'easy' | 'medium';
}

export type GamePhase = 'menu' | 'playing' | 'gameOver';
export type ActionType = 'place' | 'move' | 'ascend' | 'sacrifice' | 'none';

export interface CellState {
  coord: HexCoord;
  stackHeight: number;
  ownerId: number | null; // player id or null
  pieces: TikiPiece[];
  isSacredSite: boolean;
}

export interface GameState {
  board: Map<string, CellState>;
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  selectedAction: ActionType;
  selectedCell: HexCoord | null;
  winner: number | null;
  boardRadius: number;
  turnCount: number;
}

export interface MoveAction {
  type: 'place' | 'move' | 'ascend' | 'sacrifice';
  from?: HexCoord;
  to: HexCoord;
  playerId: number;
}

export const PLAYER_COLORS: Record<PlayerColor, string> = {
  red: '#e74c3c',
  blue: '#3498db',
  green: '#2ecc71',
  yellow: '#f1c40f',
};

export const PLAYER_COLOR_NAMES: Record<PlayerColor, string> = {
  red: 'Volcanic Red',
  blue: 'Ocean Blue',
  green: 'Jungle Green',
  yellow: 'Sun Gold',
};

export const MAX_PIECES_PER_PLAYER = 12;
export const SACRED_SITE_COUNT = 6;
export const BOARD_RADIUS = 4;
