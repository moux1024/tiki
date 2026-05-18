// Written by Claude GLM-5.1

export interface BoardPosition {
  row: number;
  col: number;
}

export type TileType = "plus2" | "plus1" | "swamp" | "cursed";

export type PlayerColor = "red" | "blue";

export interface TikiPiece {
  id: string;
  owner: number;
}

export interface Village {
  position: BoardPosition;
  tileType: TileType;
  stack: TikiPiece[];
}

export interface Player {
  id: number;
  color: PlayerColor;
  fruits: number;
  supply: number;
}

export type GamePhase = "menu" | "playing" | "gameOver";

export type Direction = "up" | "down" | "left" | "right";

export type Action =
  | { type: "create"; position: BoardPosition }
  | { type: "move"; from: BoardPosition; direction: Direction };

export interface GameState {
  board: Village[][];
  players: [Player, Player];
  currentPlayer: 0 | 1;
  phase: GamePhase;
  fruitSupply: number;
  winner: number | null;
  vsAI: boolean;
}

export const FRUIT_TO_WIN = 4;
export const PIECES_PER_PLAYER = 8;
export const BOARD_SIZE = 3;
export const TOTEM_RESOLVE_HEIGHT = 3;

export const TILE_DISTRIBUTION: TileType[] = [
  "plus2", "plus2",
  "plus1", "plus1", "plus1",
  "swamp", "swamp",
  "cursed", "cursed",
];

export const TILE_INFO: Record<TileType, { label: string; emoji: string; color: string; effect: number }> = {
  plus2:  { label: "Rich Harvest", emoji: "🍍", color: "#2ecc71", effect: 2 },
  plus1:  { label: "Harvest",      emoji: "🍎", color: "#82e0aa", effect: 1 },
  swamp:  { label: "Swamp",        emoji: "🌿", color: "#5d6d7e", effect: 0 },
  cursed: { label: "Cursed",       emoji: "💀", color: "#8e44ad", effect: -1 },
};

export const PLAYER_COLORS: Record<PlayerColor, string> = {
  red:  "#e74c3c",
  blue: "#3498db",
};

export function posEqual(a: BoardPosition, b: BoardPosition): boolean {
  return a.row === b.row && a.col === b.col;
}

export function posKey(p: BoardPosition): string {
  return `${p.row},${p.col}`;
}
