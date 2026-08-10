export type GameMode = 'ai' | 'pvp' | 'sandbox';

export type AIDifficulty = 1 | 2 | 3 | 4;

export type PlayerColor = 'w' | 'b';

export type BoardTheme = 'midnight' | 'walnut' | 'slate' | 'cyberpunk';

export type PieceTheme = 'classic' | 'neo' | 'flat';

export interface TimeControl {
  id: string;
  name: string;
  initialSeconds: number; // 0 for unlimited
  incrementSeconds: number;
}

export interface GameSettings {
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  userColor: PlayerColor;
  timeControl: TimeControl;
  boardTheme: BoardTheme;
  pieceTheme: PieceTheme;
  soundEnabled: boolean;
  soundVolume: number;
  autoFlip: boolean;
  showLegalMoves: boolean;
  showMoveHighlights: boolean;
  showEvalBar: boolean;
}

export interface MoveHistoryItem {
  san: string;
  fen: string;
  from: string;
  to: string;
  piece: string;
  color: PlayerColor;
  captured?: string;
  promotion?: string;
  isCheck: boolean;
  isCheckmate: boolean;
  evalScore?: number;
}

export interface CapturedPieces {
  w: string[]; // Pieces captured by White (black pieces)
  b: string[]; // Pieces captured by Black (white pieces)
  advantage: number; // Positive = White advantage, Negative = Black advantage
}

export interface GameResult {
  winner: PlayerColor | 'draw' | null;
  reason: 'checkmate' | 'stalemate' | 'threefold' | 'fifty-move' | 'insufficient' | 'timeout' | 'resignation';
}
