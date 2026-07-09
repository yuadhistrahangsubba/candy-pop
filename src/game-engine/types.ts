export const CANDY_COLORS = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
] as const;

export type CandyColor = (typeof CANDY_COLORS)[number];

export type SpecialType = "striped-h" | "striped-v" | "wrapped" | "color-bomb";

export interface Tile {
  id: string;
  color: CandyColor | null;
  special: SpecialType | null;
}

export type Cell = Tile | null;

export interface Position {
  row: number;
  col: number;
}

export interface Board {
  width: number;
  height: number;
  cells: Cell[][];
  blocked: boolean[][];
  /**
   * Ice layers per cell (0 = none). Ice sits on the cell, not the tile:
   * candies on iced cells swap and fall normally, and clearing a match on
   * an iced cell breaks one layer.
   */
  ice: number[][];
}

export type ObjectiveType = "scoreTarget" | "collectColor" | "breakIce";

export interface Objective {
  type: ObjectiveType;
  target: number;
  color?: CandyColor;
}

export interface LevelDefinition {
  id: string;
  levelNumber: number;
  name: string;
  boardWidth: number;
  boardHeight: number;
  colorCount: number;
  blockedCells: Position[];
  iceCells: Position[];
  moveLimit: number;
  objectives: Objective[];
  starThresholds: [number, number, number];
  rngSeed?: number;
}

export interface MatchGroup {
  positions: Position[];
  color: CandyColor;
  createsSpecial: SpecialType | null;
  specialOrigin: Position;
}

/**
 * One cascade round captured for animation playback: the board with matched
 * tiles removed (exit animations), then the board after gravity + refill
 * settle (fall animations).
 */
export interface CascadeStep {
  cleared: Board;
  settled: Board;
  scoreGained: number;
  /** Every tile removed this round, with its color — drives per-cell clear effects. */
  clearedTiles: { pos: Position; color: CandyColor | null }[];
  /** Ice layers broken this round. */
  iceBroken: Position[];
}

export interface ResolveResult {
  board: Board;
  scoreGained: number;
  cascadeCount: number;
  collectedColors: Partial<Record<CandyColor, number>>;
  tilesCleared: number;
  iceBroken: number;
  steps: CascadeStep[];
}

export interface MoveResult {
  valid: boolean;
  board: Board;
  scoreGained: number;
  cascadeCount: number;
  collectedColors: Partial<Record<CandyColor, number>>;
}

export interface ObjectiveProgress {
  objective: Objective;
  current: number;
  complete: boolean;
}
