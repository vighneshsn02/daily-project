import React, { useState } from 'react';
import { Chess, type Square } from 'chess.js';
import type { BoardTheme, PieceTheme, PlayerColor } from '../types/chess';
import { Piece } from '../utils/pieces';

interface ChessBoardProps {
  game: Chess;
  orientation: PlayerColor;
  boardTheme: BoardTheme;
  pieceTheme: PieceTheme;
  onMove: (from: Square, to: Square, promotion?: string) => boolean;
  showLegalMoves: boolean;
  showMoveHighlights: boolean;
  lastMove: { from: Square; to: Square } | null;
  hintMove: { from: Square; to: Square } | null;
  isAiThinking: boolean;
  isGameOver: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  orientation,
  boardTheme,
  pieceTheme,
  onMove,
  showLegalMoves,
  showMoveHighlights,
  lastMove,
  hintMove,
  isAiThinking,
  isGameOver,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Get board grid array (8x8)
  const board = game.board();

  // Define board theme color palettes
  const getThemeClasses = () => {
    switch (boardTheme) {
      case 'walnut':
        return {
          light: 'bg-[#f0d9b5] text-[#b58863]',
          dark: 'bg-[#b58863] text-[#f0d9b5]',
          boardBorder: 'border-[#8a5a36] shadow-[0_20px_50px_rgba(0,0,0,0.6)]',
        };
      case 'slate':
        return {
          light: 'bg-[#e2e8f0] text-[#64748b]',
          dark: 'bg-[#475569] text-[#cbd5e1]',
          boardBorder: 'border-[#334155] shadow-[0_20px_50px_rgba(15,23,42,0.7)]',
        };
      case 'cyberpunk':
        return {
          light: 'bg-[#2e1065] text-[#a855f7]',
          dark: 'bg-[#581c87] text-[#e879f9]',
          boardBorder: 'border-[#7e22ce] shadow-[0_20px_50px_rgba(168,85,247,0.3)]',
        };
      case 'midnight':
      default:
        return {
          light: 'bg-[#1e293b] text-[#64748b]',
          dark: 'bg-[#0f172a] text-[#475569]',
          boardBorder: 'border-[#334155] shadow-[0_20px_50px_rgba(0,0,0,0.8)]',
        };
    }
  };

  const themeColors = getThemeClasses();

  // Helper to handle square selection and legal moves
  const handleSquareClick = (square: Square) => {
    if (isAiThinking || isGameOver) return;

    // If click on already selected square -> deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // If a square is selected and user clicks on a valid target square -> attempt move
    if (selectedSquare && validMoves.includes(square)) {
      attemptMove(selectedSquare, square);
      return;
    }

    // Otherwise select piece on square if it belongs to turn player
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setValidMoves(moves.map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const attemptMove = (from: Square, to: Square, promotionPiece?: string) => {
    const piece = game.get(from);

    // Check if move is pawn promotion to 8th rank
    const isPawn = piece?.type === 'p';
    const isPromotionRank = (piece?.color === 'w' && to.endsWith('8')) || (piece?.color === 'b' && to.endsWith('1'));

    if (isPawn && isPromotionRank && !promotionPiece) {
      setPendingPromotion({ from, to });
      return;
    }

    onMove(from, to, promotionPiece || 'q');
    setSelectedSquare(null);
    setValidMoves([]);
    setPendingPromotion(null);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (isAiThinking || isGameOver) {
      e.preventDefault();
      return;
    }
    const piece = game.get(square);
    if (!piece || piece.color !== game.turn()) {
      e.preventDefault();
      return;
    }
    setDraggedSquare(square);
    setSelectedSquare(square);
    const moves = game.moves({ square, verbose: true });
    setValidMoves(moves.map(m => m.to as Square));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    if (draggedSquare && validMoves.includes(targetSquare)) {
      attemptMove(draggedSquare, targetSquare);
    }
    setDraggedSquare(null);
  };

  // Find King square if in check
  let checkKingSquare: Square | null = null;
  if (game.inCheck()) {
    const turn = game.turn();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = board[r][c];
        if (sq && sq.type === 'k' && sq.color === turn) {
          checkKingSquare = sq.square as Square;
          break;
        }
      }
    }
  }

  // Files and Ranks setup
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = orientation === 'w' ? files : [...files].reverse();
  const displayRanks = orientation === 'w' ? ranks : [...ranks].reverse();

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Outer Chessboard Frame */}
      <div className={`relative p-2 sm:p-3 rounded-2xl border-4 bg-slate-900 ${themeColors.boardBorder}`}>
        {/* 8x8 Chessboard Grid */}
        <div className="grid grid-cols-8 grid-rows-8 w-[88vw] h-[88vw] max-w-[540px] max-h-[540px] rounded-lg overflow-hidden select-none">
          {displayRanks.map((rank, rankIdx) =>
            displayFiles.map((file, fileIdx) => {
              const squareName = `${file}${rank}` as Square;
              const r = 8 - parseInt(rank);
              const c = files.indexOf(file);
              const piece = board[r][c];

              const isLight = (r + c) % 2 === 0;
              const isSelected = selectedSquare === squareName;
              const isValidTarget = showLegalMoves && validMoves.includes(squareName);
              const isLastMove = showMoveHighlights && lastMove && (lastMove.from === squareName || lastMove.to === squareName);
              const isHint = hintMove && (hintMove.from === squareName || hintMove.to === squareName);
              const isInCheck = checkKingSquare === squareName;

              return (
                <div
                  key={squareName}
                  onClick={() => handleSquareClick(squareName)}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, squareName)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                    isLight ? themeColors.light : themeColors.dark
                  } ${isSelected ? '!bg-amber-400/40 ring-4 ring-amber-400 inset-0 z-10' : ''} ${
                    isLastMove && !isSelected ? '!bg-emerald-500/30' : ''
                  } ${isHint ? '!bg-cyan-400/40 animate-pulse' : ''} ${
                    isInCheck ? '!bg-rose-600/70 animate-bounce z-10 ring-4 ring-rose-500' : ''
                  }`}
                >
                  {/* File & Rank labels on corner edges */}
                  {fileIdx === 0 && (
                    <span className="absolute top-1 left-1.5 text-[10px] font-mono font-bold opacity-75 pointer-events-none">
                      {rank}
                    </span>
                  )}
                  {rankIdx === 7 && (
                    <span className="absolute bottom-1 right-1.5 text-[10px] font-mono font-bold opacity-75 pointer-events-none">
                      {file}
                    </span>
                  )}

                  {/* Piece Render */}
                  {piece && (
                    <div
                      draggable={!isAiThinking && !isGameOver && piece.color === game.turn()}
                      onDragStart={e => handleDragStart(e, squareName)}
                      className="w-full h-full p-1 flex items-center justify-center transition-transform active:scale-110 z-1"
                    >
                      <Piece type={piece.type} color={piece.color} theme={pieceTheme} />
                    </div>
                  )}

                  {/* Valid move indicators */}
                  {isValidTarget && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      {piece ? (
                        // Target capture ring on enemy piece
                        <div className="w-full h-full border-4 border-emerald-400/80 rounded-full animate-pulse"></div>
                      ) : (
                        // Move dot on empty square
                        <div className="w-3.5 h-3.5 bg-emerald-400/80 rounded-full shadow-lg shadow-emerald-400/50"></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pawn Promotion Dialog Modal Overlay */}
        {pendingPromotion && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center gap-4 z-50 animate-fadeIn">
            <h3 className="text-lg font-bold text-amber-300 tracking-wide">Choose Promotion Piece</h3>
            <div className="flex items-center gap-3 bg-slate-900/90 p-4 rounded-2xl border border-amber-400/40 shadow-2xl">
              {(['q', 'r', 'b', 'n'] as const).map(pType => (
                <button
                  key={pType}
                  onClick={() => attemptMove(pendingPromotion.from, pendingPromotion.to, pType)}
                  className="w-14 h-14 p-2 bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400 rounded-xl transition-all hover:scale-110 flex items-center justify-center"
                >
                  <Piece type={pType} color={game.turn()} theme={pieceTheme} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
