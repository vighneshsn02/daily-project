import { Chess, type Square } from 'chess.js';
import type { AIDifficulty, CapturedPieces, PlayerColor } from '../types/chess';

// Standard material values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece Square Tables (PST) for positional evaluation from White's perspective
const PAWN_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_PST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_PST = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_PST = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_PST = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MIDGAME_PST = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

function getSquarePSTValue(pieceType: string, color: 'w' | 'b', squareIndex: number): number {
  // Flip index vertically for Black
  const row = Math.floor(squareIndex / 8);
  const col = squareIndex % 8;
  const idx = color === 'w' ? (7 - row) * 8 + col : row * 8 + col;

  switch (pieceType) {
    case 'p': return PAWN_PST[idx];
    case 'n': return KNIGHT_PST[idx];
    case 'b': return BISHOP_PST[idx];
    case 'r': return ROOK_PST[idx];
    case 'q': return QUEEN_PST[idx];
    case 'k': return KING_MIDGAME_PST[idx];
    default: return 0;
  }
}

/**
 * Returns evaluation score from White's perspective in Pawns (e.g. +1.5 means White is up 1.5 pawns).
 */
export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -999 : 999;
  }
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
    return 0;
  }

  let totalEval = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board[r][c];
      if (square) {
        const val = PIECE_VALUES[square.type] + getSquarePSTValue(square.type, square.color, r * 8 + c);
        if (square.color === 'w') {
          totalEval += val;
        } else {
          totalEval -= val;
        }
      }
    }
  }

  return Math.round((totalEval / 100) * 10) / 10;
}

/**
 * Quiescence Search to avoid horizon effect on captures
 */
function quiescenceSearch(game: Chess, alpha: number, beta: number, isMaximizing: boolean, depthLimit = 2): number {
  const standPat = evaluateBoard(game) * 100;

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  if (depthLimit <= 0) return standPat;

  const captures = game.moves({ verbose: true }).filter(m => m.captured);

  for (const move of captures) {
    game.move(move);
    const score = quiescenceSearch(game, alpha, beta, !isMaximizing, depthLimit - 1);
    game.undo();

    if (isMaximizing) {
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    } else {
      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
  }

  return isMaximizing ? alpha : beta;
}

/**
 * Minimax algorithm with Alpha-Beta Pruning & Move Ordering
 */
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0) {
    return quiescenceSearch(game, alpha, beta, isMaximizing);
  }

  if (game.isGameOver()) {
    return evaluateBoard(game) * 100;
  }

  const rawMoves = game.moves({ verbose: true });
  // Move ordering: prioritize captures & checks for efficient pruning
  const moves = rawMoves.sort((a, b) => {
    const scoreA = (a.captured ? PIECE_VALUES[a.captured] * 10 : 0) + (a.san.includes('+') ? 50 : 0);
    const scoreB = (b.captured ? PIECE_VALUES[b.captured] * 10 : 0) + (b.san.includes('+') ? 50 : 0);
    return scoreB - scoreA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalVal = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalVal = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Calculates the best move for AI according to selected difficulty.
 */
export async function getBestMove(game: Chess, difficulty: AIDifficulty): Promise<{ from: Square; to: Square; promotion?: string } | null> {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  const turn = game.turn();
  const isWhite = turn === 'w';

  // Level 1: Novice (85% random, 15% simple capture)
  if (difficulty === 1) {
    const captureMoves = moves.filter(m => m.captured);
    if (captureMoves.length > 0 && Math.random() < 0.3) {
      const selected = captureMoves[Math.floor(Math.random() * captureMoves.length)];
      return { from: selected.from as Square, to: selected.to as Square, promotion: selected.promotion };
    }
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return { from: randomMove.from as Square, to: randomMove.to as Square, promotion: randomMove.promotion };
  }

  // Level 2: Casual (Minimax Depth 2)
  // Level 3: Intermediate (Minimax Depth 3)
  // Level 4: Master (Minimax Depth 4)
  const depth = difficulty === 2 ? 2 : difficulty === 3 ? 3 : 4;

  let bestMove = moves[0];
  let bestValue = isWhite ? -Infinity : Infinity;

  // Small random noise to prevent identical moves in repetition
  const noiseFactor = difficulty === 4 ? 0 : 5;

  for (const move of moves) {
    game.move(move);
    const boardVal = minimax(game, depth - 1, -Infinity, Infinity, !isWhite) + (Math.random() * noiseFactor - noiseFactor / 2);
    game.undo();

    if (isWhite) {
      if (boardVal > bestValue) {
        bestValue = boardVal;
        bestMove = move;
      }
    } else {
      if (boardVal < bestValue) {
        bestValue = boardVal;
        bestMove = move;
      }
    }
  }

  return { from: bestMove.from as Square, to: bestMove.to as Square, promotion: bestMove.promotion };
}

/**
 * Returns hint move for the current turn player
 */
export function getHintMove(game: Chess): { from: Square; to: Square; san: string; eval: number } | null {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  const isWhite = game.turn() === 'w';
  let bestMove = moves[0];
  let bestVal = isWhite ? -Infinity : Infinity;

  for (const move of moves) {
    game.move(move);
    const val = minimax(game, 2, -Infinity, Infinity, !isWhite);
    game.undo();

    if (isWhite) {
      if (val > bestVal) {
        bestVal = val;
        bestMove = move;
      }
    } else {
      if (val < bestVal) {
        bestVal = val;
        bestMove = move;
      }
    }
  }

  return {
    from: bestMove.from as Square,
    to: bestMove.to as Square,
    san: bestMove.san,
    eval: Math.round((bestVal / 100) * 10) / 10,
  };
}

/**
 * Computes captured pieces for White and Black and material score difference.
 */
export function calculateCapturedPieces(game: Chess): CapturedPieces {
  const initialCounts: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const currentCounts: Record<PlayerColor, Record<string, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
  };

  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c];
      if (sq && sq.type !== 'k') {
        currentCounts[sq.color][sq.type] = (currentCounts[sq.color][sq.type] || 0) + 1;
      }
    }
  }

  // White captured black pieces = initial - black current
  const whiteCaptured: string[] = [];
  let whiteMaterial = 0;
  // Black captured white pieces = initial - white current
  const blackCaptured: string[] = [];
  let blackMaterial = 0;

  ['q', 'r', 'b', 'n', 'p'].forEach(type => {
    // Missing black pieces (captured by White)
    const missingBlack = initialCounts[type] - (currentCounts.b[type] || 0);
    for (let i = 0; i < missingBlack; i++) {
      whiteCaptured.push(type);
      whiteMaterial += PIECE_VALUES[type] / 100;
    }

    // Missing white pieces (captured by Black)
    const missingWhite = initialCounts[type] - (currentCounts.w[type] || 0);
    for (let i = 0; i < missingWhite; i++) {
      blackCaptured.push(type);
      blackMaterial += PIECE_VALUES[type] / 100;
    }
  });

  return {
    w: whiteCaptured,
    b: blackCaptured,
    advantage: whiteMaterial - blackMaterial,
  };
}
