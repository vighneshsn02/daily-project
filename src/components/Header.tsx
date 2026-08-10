import React from 'react';
import { Crown, RotateCcw, Lightbulb, Volume2, VolumeX, Settings, PlusCircle } from 'lucide-react';
import type { GameSettings } from '../types/chess';

interface HeaderProps {
  settings: GameSettings;
  onNewGame: () => void;
  onFlipBoard: () => void;
  onGetHint: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  isAiThinking: boolean;
  isGameOver: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onNewGame,
  onFlipBoard,
  onGetHint,
  onOpenSettings,
  onToggleSound,
  isAiThinking,
  isGameOver,
}) => {
  const getModeLabel = () => {
    if (settings.mode === 'ai') {
      const diffNames = { 1: 'Novice', 2: 'Casual', 3: 'Master', 4: 'Grandmaster' };
      return `vs AI (${diffNames[settings.aiDifficulty]})`;
    }
    if (settings.mode === 'pvp') return '2 Player (Pass & Play)';
    return 'Analysis Sandbox';
  };

  return (
    <header className="w-full glass-panel border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl z-20">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20">
          <Crown className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-200 via-amber-100 to-white bg-clip-text text-transparent tracking-wide">
            CHESS ROYALE
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-amber-300">
              {getModeLabel()}
            </span>
            {isAiThinking && (
              <span className="flex items-center gap-1 text-cyan-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                AI thinking...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onNewGame}
          className="btn-glass text-yellow-300 hover:text-yellow-200 hover:bg-amber-500/20 hover:border-amber-500/40"
          title="Start New Game"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Game</span>
        </button>

        <button
          onClick={onFlipBoard}
          className="btn-glass text-slate-300 hover:text-white"
          title="Flip Chessboard"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden md:inline">Flip</span>
        </button>

        <button
          onClick={onGetHint}
          disabled={isAiThinking || isGameOver}
          className="btn-glass text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-500/40 disabled:opacity-40"
          title="Get Move Hint"
        >
          <Lightbulb className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Hint</span>
        </button>

        <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

        <button
          onClick={onToggleSound}
          className="btn-icon"
          title={settings.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-rose-400" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="btn-icon"
          title="Game Settings"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
