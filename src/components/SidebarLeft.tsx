import React from 'react';
import { Bot, User, Flag, Handshake, Undo2, Clock } from 'lucide-react';
import type { CapturedPieces, GameSettings, PlayerColor } from '../types/chess';
import { Piece } from '../utils/pieces';

interface SidebarLeftProps {
  settings: GameSettings;
  turn: PlayerColor;
  whiteTime: number; // in seconds
  blackTime: number;
  capturedPieces: CapturedPieces;
  onResign: () => void;
  onOfferDraw: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isGameOver: boolean;
  orientation: PlayerColor;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  settings,
  turn,
  whiteTime,
  blackTime,
  capturedPieces,
  onResign,
  onOfferDraw,
  onUndo,
  canUndo,
  isGameOver,
  orientation,
}) => {
  const formatTime = (totalSec: number) => {
    if (totalSec <= 0 && settings.timeControl.initialSeconds > 0) return '00:00';
    if (settings.timeControl.initialSeconds === 0) return '∞';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlayerDetails = (color: PlayerColor) => {
    const isAi = settings.mode === 'ai' && color !== settings.userColor;
    const isUser = settings.mode === 'ai' && color === settings.userColor;

    let name = color === 'w' ? 'White Player' : 'Black Player';
    let rating = '1200';

    if (isAi) {
      const diffs = { 1: 'Novice (800)', 2: 'Casual (1200)', 3: 'Master (1800)', 4: 'Grandmaster (2400)' };
      name = 'Royale AI';
      rating = diffs[settings.aiDifficulty];
    } else if (isUser) {
      name = 'Player 1';
      rating = 'Human';
    } else if (settings.mode === 'pvp') {
      name = color === 'w' ? 'Player 1 (White)' : 'Player 2 (Black)';
    } else {
      name = color === 'w' ? 'White' : 'Black';
    }

    return { name, rating, isAi };
  };

  // Determine top and bottom players depending on board orientation
  const topColor: PlayerColor = orientation === 'w' ? 'b' : 'w';
  const bottomColor: PlayerColor = orientation === 'w' ? 'w' : 'b';

  const topPlayer = getPlayerDetails(topColor);
  const bottomPlayer = getPlayerDetails(bottomColor);

  const topTime = topColor === 'w' ? whiteTime : blackTime;
  const bottomTime = bottomColor === 'w' ? whiteTime : blackTime;

  // Captured pieces by top player (bottom's lost pieces) and bottom player (top's lost pieces)
  const topCaptured = topColor === 'w' ? capturedPieces.w : capturedPieces.b;
  const bottomCaptured = bottomColor === 'w' ? capturedPieces.w : capturedPieces.b;

  const topAdvantage = topColor === 'w' ? capturedPieces.advantage : -capturedPieces.advantage;
  const bottomAdvantage = bottomColor === 'w' ? capturedPieces.advantage : -capturedPieces.advantage;

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-4 z-10">
      {/* Top Player Card */}
      <div
        className={`glass-panel p-4 rounded-2xl border transition-all duration-300 ${
          turn === topColor && !isGameOver
            ? 'border-amber-400/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
            : 'border-white/10'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              {topPlayer.isAi ? <Bot className="w-6 h-6 text-cyan-400" /> : <User className="w-6 h-6 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-slate-100">{topPlayer.name}</span>
                <span className={`w-2.5 h-2.5 rounded-full border ${topColor === 'w' ? 'bg-white border-slate-400' : 'bg-slate-900 border-slate-700'}`}></span>
              </div>
              <span className="text-xs text-slate-400">{topPlayer.rating}</span>
            </div>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
              turn === topColor && !isGameOver
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {formatTime(topTime)}
          </div>
        </div>

        {/* Captured Pieces by Top Player */}
        <div className="mt-3 flex items-center justify-between min-h-[26px] pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-0.5 max-w-[170px]">
            {topCaptured.map((pieceType, idx) => (
              <div key={idx} className="w-4 h-4">
                <Piece type={pieceType as any} color={topColor === 'w' ? 'b' : 'w'} theme={settings.pieceTheme} />
              </div>
            ))}
          </div>
          {topAdvantage > 0 && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              +{topAdvantage}
            </span>
          )}
        </div>
      </div>

      {/* Middle Controls (Resign, Draw, Undo) */}
      <div className="glass-panel p-3 rounded-2xl border border-white/10 flex items-center justify-around gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo || isGameOver}
          className="btn-glass flex-1 py-2 text-xs text-slate-300 hover:text-white disabled:opacity-30"
          title="Undo Last Move"
        >
          <Undo2 className="w-4 h-4" />
          <span>Undo</span>
        </button>

        <button
          onClick={onOfferDraw}
          disabled={isGameOver || settings.mode === 'sandbox'}
          className="btn-glass flex-1 py-2 text-xs text-slate-300 hover:text-yellow-300 hover:bg-yellow-500/10 disabled:opacity-30"
          title="Offer Draw"
        >
          <Handshake className="w-4 h-4" />
          <span>Draw</span>
        </button>

        <button
          onClick={onResign}
          disabled={isGameOver || settings.mode === 'sandbox'}
          className="btn-glass flex-1 py-2 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 hover:border-rose-500/40 disabled:opacity-30"
          title="Resign Match"
        >
          <Flag className="w-4 h-4 text-rose-400" />
          <span>Resign</span>
        </button>
      </div>

      {/* Bottom Player Card */}
      <div
        className={`glass-panel p-4 rounded-2xl border transition-all duration-300 ${
          turn === bottomColor && !isGameOver
            ? 'border-amber-400/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
            : 'border-white/10'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              {bottomPlayer.isAi ? <Bot className="w-6 h-6 text-cyan-400" /> : <User className="w-6 h-6 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-slate-100">{bottomPlayer.name}</span>
                <span className={`w-2.5 h-2.5 rounded-full border ${bottomColor === 'w' ? 'bg-white border-slate-400' : 'bg-slate-900 border-slate-700'}`}></span>
              </div>
              <span className="text-xs text-slate-400">{bottomPlayer.rating}</span>
            </div>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
              turn === bottomColor && !isGameOver
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {formatTime(bottomTime)}
          </div>
        </div>

        {/* Captured Pieces by Bottom Player */}
        <div className="mt-3 flex items-center justify-between min-h-[26px] pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-0.5 max-w-[170px]">
            {bottomCaptured.map((pieceType, idx) => (
              <div key={idx} className="w-4 h-4">
                <Piece type={pieceType as any} color={bottomColor === 'w' ? 'b' : 'w'} theme={settings.pieceTheme} />
              </div>
            ))}
          </div>
          {bottomAdvantage > 0 && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              +{bottomAdvantage}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};
