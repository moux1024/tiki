// Written by Claude GLM-5.1

import {
  HexCoord,
  CellState,
  TikiPiece,
  PlayerColor,
  BOARD_RADIUS,
  SACRED_SITE_COUNT,
  MAX_PIECES_PER_PLAYER,
} from './types';

export function hexKey(q: number, r: number): string {
  return `${q},${r}`;
}

export function hexFromKey(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  return (
    (Math.abs(a.q - b.q) +
      Math.abs(a.q + a.r - b.q - b.r) +
      Math.abs(a.r - b.r)) /
    2
  );
}

export function hexNeighbors(coord: HexCoord): HexCoord[] {
  const dirs = [
    { q: 1, r: 0 },
    { q: -1, r: 0 },
    { q: 0, r: 1 },
    { q: 0, r: -1 },
    { q: 1, r: -1 },
    { q: -1, r: 1 },
  ];
  return dirs.map((d) => ({ q: coord.q + d.q, r: coord.r + d.r }));
}

export function generateHexGrid(radius: number): HexCoord[] {
  const coords: HexCoord[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      coords.push({ q, r });
    }
  }
  return coords;
}

export function generateSacredSites(radius: number, count: number): HexCoord[] {
  const allCoords = generateHexGrid(radius);
  const sites: HexCoord[] = [];

  // Place sacred sites at strategic positions - rings 2 and 3
  const candidates = allCoords.filter(
    (c) => hexDistance(c, { q: 0, r: 0 }) >= 1 && hexDistance(c, { q: 0, r: 0 }) <= 3
  );

  // Use deterministic placement for balanced gameplay
  const seed = [0, 1, -1, 2, -2, 3];
  for (let i = 0; i < Math.min(count, seed.length); i++) {
    const idx = Math.abs(seed[i] * 7 + i * 3) % candidates.length;
    const site = candidates[idx];
    if (!sites.some((s) => hexDistance(s, site) < 2)) {
      sites.push(site);
    } else {
      // Fallback: find closest unused candidate
      for (const c of candidates) {
        if (!sites.some((s) => hexDistance(s, c) < 2)) {
          sites.push(c);
          break;
        }
      }
    }
  }

  while (sites.length < count) {
    const remaining = candidates.filter(
      (c) => !sites.some((s) => s.q === c.q && s.r === c.r)
    );
    if (remaining.length === 0) break;
    sites.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }

  return sites;
}

export function createEmptyBoard(radius: number): Map<string, CellState> {
  const board = new Map<string, CellState>();
  const coords = generateHexGrid(radius);
  const sacredSites = generateSacredSites(radius, SACRED_SITE_COUNT);

  for (const coord of coords) {
    const key = hexKey(coord.q, coord.r);
    const isSacred = sacredSites.some((s) => s.q === coord.q && s.r === coord.r);
    board.set(key, {
      coord,
      stackHeight: 0,
      ownerId: null,
      pieces: [],
      isSacredSite: isSacred,
    });
  }

  return board;
}

let pieceIdCounter = 0;

export function createPiece(color: PlayerColor, position: HexCoord): TikiPiece {
  return {
    id: `piece-${pieceIdCounter++}-${Date.now()}`,
    color,
    height: 1,
    position,
  };
}

export function getCell(board: Map<string, CellState>, coord: HexCoord): CellState | undefined {
  return board.get(hexKey(coord.q, coord.r));
}

export function setCell(
  board: Map<string, CellState>,
  coord: HexCoord,
  cell: CellState
): Map<string, CellState> {
  const newBoard = new Map(board);
  newBoard.set(hexKey(coord.q, coord.r), cell);
  return newBoard;
}

export function isValidCoord(coord: HexCoord, radius: number): boolean {
  return hexDistance(coord, { q: 0, r: 0 }) <= radius;
}

export function hexToWorld(coord: HexCoord): { x: number; y: number; z: number } {
  const hexSize = 1.1;
  const x = hexSize * (Math.sqrt(3) * coord.q + (Math.sqrt(3) / 2) * coord.r);
  const z = hexSize * (1.5 * coord.r);
  return { x, y: 0, z };
}

export function worldToHex(x: number, z: number): HexCoord {
  const hexSize = 1.1;
  const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * z) / hexSize;
  const r = ((2 / 3) * z) / hexSize;
  return hexRound(q, r);
}

function hexRound(q: number, r: number): HexCoord {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  return { q: rq, r: rr };
}

export function resetPieceCounter(): void {
  pieceIdCounter = 0;
}
