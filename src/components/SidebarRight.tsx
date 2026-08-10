import React, { useEffect, useRef } from 'react';
import { History, Copy, Check, BarChart2 } from 'lucide-react';
import type { MoveHistoryItem, GameSettings } from '../types/chess';

interface SidebarRightProps {
  moveHistory: MoveHistoryItem[];
  currentMoveIndex: number;
  onJumpToMove: (index: number) => void;
  evaluation: number; // Positive = White advantage, Negative = Black
  currentFen: string;
  pgnString: string;
  settings: GameSettings;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  moveHistory,
  currentMoveIndex,
  onJumpToMove,
  evaluation,
  currentFen,
  pgnString,
  settings,
}) => {
  const [copiedFen, setCopiedFen] = React.useState(false);
  const [copiedPgn, setCopiedPgn] = React.useState(false);
  const historyContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll move history to bottom when new move is played
  useEffect(() => {
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  const copyToClipboard = (text: string, type: 'fen' | 'pgn') => {
    navigator.clipboard.writeText(text);
    if (type === 'fen') {
      setCopiedFen(true);
      setTimeout(() => setCopiedFen(false), 2000);
    } else {
      setCopiedPgn(true);
      setTimeout(() => setCopiedPgn(false), 2000);
    }
  };

  // Format move pairs (Move #, White, Black)
  const movePairs: { number: number; white: { item: MoveHistoryItem; index: number }; black?: { item: MoveHistoryItem; index: number } }[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: { item: moveHistory[i], index: i },
      black: moveHistory[i + 1] ? { item: moveHistory[i + 1], index: i + 1 } : undefined,
    });
  }

  // Calculate eval bar height percentage (range -10 to +10 pawns mapped to 0% to 100%)
  const evalClamped = Math.max(-10, Math.min(10, evaluation));
  const whiteEvalPct = Math.round(((evalClamped + 10) / 20) * 100);

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4 z-10">
      {/* Live Engine Evaluation Bar Panel */}
      {settings.showEvalBar && (
        <div className="glass-panel p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5 text-amber-300">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Engine Advantage
            </span>
            <span className="font-mono font-bold text-slate-100">
              {evaluation > 0 ? `+${evaluation}` : evaluation}
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-700/80 p-0.5">
            {/* White side */}
            <div
              className="h-full bg-gradient-to-r from-amber-200 to-white rounded-l-full transition-all duration-500 ease-out"
              style={{ width: `${whiteEvalPct}%` }}
            ></div>
            {/* Black side */}
            <div
              className="h-full bg-gradient-to-r from-slate-800 to-slate-950 rounded-r-full transition-all duration-500 ease-out"
              style={{ width: `${100 - whiteEvalPct}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Move History Panel */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col flex-1 min-h-[280px] max-h-[420px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold text-sm text-slate-100">Move History</h2>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
            {moveHistory.length} ply
          </span>
        </div>

        {/* Moves Table */}
        <div ref={historyContainerRef} className="flex-1 overflow-y-auto mt-2 pr-1 space-y-1 scrollbar-thin">
          {movePairs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 italic py-12 text-center">
              No moves played yet.
              <br />
              Make your first move on the board!
            </div>
          ) : (
            movePairs.map(pair => (
              <div key={pair.number} className="flex items-center text-xs rounded-lg hover:bg-white/5 py-1 px-1.5 transition-colors">
                <span className="w-8 font-mono text-slate-500 text-right pr-2">{pair.number}.</span>

                {/* White Move */}
                <button
                  onClick={() => onJumpToMove(pair.white.index)}
                  className={`flex-1 text-left px-2 py-1 rounded-md font-mono transition-colors ${
                    currentMoveIndex === pair.white.index
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {pair.white.item.san}
                </button>

                {/* Black Move */}
                {pair.black ? (
                  <button
                    onClick={() => onJumpToMove(pair.black!.index)}
                    className={`flex-1 text-left px-2 py-1 rounded-md font-mono transition-colors ${
                      currentMoveIndex === pair.black.index
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {pair.black.item.san}
                  </button>
                ) : (
                  <div className="flex-1"></div>
                )}
              </div>
            ))
          )}
        </div>

        {/* FEN / PGN Export Buttons */}
        <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={() => copyToClipboard(currentFen, 'fen')}
            className="btn-glass flex-1 py-1.5 text-xs text-slate-300 hover:text-white"
            title="Copy FEN string to clipboard"
          >
            {copiedFen ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>Copy FEN</span>
          </button>

          <button
            onClick={() => copyToClipboard(pgnString, 'pgn')}
            className="btn-glass flex-1 py-1.5 text-xs text-slate-300 hover:text-white"
            title="Copy PGN string to clipboard"
          >
            {copiedPgn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>Copy PGN</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
