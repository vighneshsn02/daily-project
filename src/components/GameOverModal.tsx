import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Frown, Scale, RefreshCw, PlusCircle, Eye } from 'lucide-react';
import type { GameResult, GameSettings } from '../types/chess';

interface GameOverModalProps {
  result: GameResult | null;
  settings: GameSettings;
  onRematch: () => void;
  onNewGame: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  result,
  settings,
  onRematch,
  onNewGame,
  onClose,
}) => {
  if (!result) return null;

  const isUserWinner =
    settings.mode === 'ai'
      ? result.winner === settings.userColor
      : result.winner !== 'draw' && result.winner !== null;

  const isDraw = result.winner === 'draw';

  useEffect(() => {
    if (isUserWinner) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isUserWinner]);

  const getReasonText = () => {
    switch (result.reason) {
      case 'checkmate': return 'by Checkmate';
      case 'stalemate': return 'by Stalemate';
      case 'threefold': return 'by 3-Fold Repetition';
      case 'fifty-move': return 'by 50-Move Rule';
      case 'insufficient': return 'by Insufficient Material';
      case 'timeout': return 'on Time Out';
      case 'resignation': return 'by Resignation';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center text-center gap-5">
        {/* Banner Graphic */}
        <div className="relative">
          {isDraw ? (
            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-slate-300 shadow-xl">
              <Scale className="w-8 h-8" />
            </div>
          ) : isUserWinner ? (
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 animate-bounce">
              <Trophy className="w-8 h-8 stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 shadow-xl">
              <Frown className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Headline */}
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-amber-200 via-yellow-100 to-white bg-clip-text text-transparent">
            {isDraw
              ? 'Game Drawn'
              : isUserWinner
              ? 'VICTORY!'
              : 'DEFEAT'}
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            {result.winner === 'w' ? 'White' : result.winner === 'b' ? 'Black' : 'Match'} won {getReasonText()}
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-2">
          <button
            onClick={onRematch}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Rematch
          </button>

          <button
            onClick={onNewGame}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Custom Game
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-2xl text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Review Board
          </button>
        </div>
      </div>
    </div>
  );
};
