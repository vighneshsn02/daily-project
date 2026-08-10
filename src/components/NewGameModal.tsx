import React, { useState } from 'react';
import { Bot, Users, FlaskConical, Play, Clock, Sparkles } from 'lucide-react';
import type { GameMode, AIDifficulty, PlayerColor, TimeControl, GameSettings } from '../types/chess';
import { Piece } from '../utils/pieces';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (newSettings: Partial<GameSettings>) => void;
  currentSettings: GameSettings;
}

const TIME_CONTROLS: TimeControl[] = [
  { id: 'unlimited', name: 'Unlimited', initialSeconds: 0, incrementSeconds: 0 },
  { id: 'blitz-3', name: '3 min Blitz', initialSeconds: 180, incrementSeconds: 0 },
  { id: 'blitz-5', name: '5 min Rapid', initialSeconds: 300, incrementSeconds: 0 },
  { id: 'classical-10', name: '10 min Classical', initialSeconds: 600, incrementSeconds: 0 },
];

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  currentSettings,
}) => {
  const [mode, setMode] = useState<GameMode>(currentSettings.mode);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(currentSettings.aiDifficulty);
  const [userColor, setUserColor] = useState<PlayerColor>(currentSettings.userColor);
  const [timeControl, setTimeControl] = useState<TimeControl>(currentSettings.timeControl);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame({
      mode,
      aiDifficulty,
      userColor,
      timeControl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Start New Game</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Game Mode Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Game Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('ai')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  mode === 'ai'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Bot className="w-5 h-5" />
                <span className="text-xs font-medium">vs AI</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('pvp')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  mode === 'pvp'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">2 Player</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('sandbox')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  mode === 'sandbox'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <FlaskConical className="w-5 h-5" />
                <span className="text-xs font-medium">Sandbox</span>
              </button>
            </div>
          </div>

          {/* AI Difficulty Selector (Visible when mode === 'ai') */}
          {mode === 'ai' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">AI Bot Strength</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { diff: 1, label: 'Novice', rating: '800' },
                  { diff: 2, label: 'Casual', rating: '1200' },
                  { diff: 3, label: 'Master', rating: '1800' },
                  { diff: 4, label: 'GM', rating: '2400' },
                ].map(item => (
                  <button
                    key={item.diff}
                    type="button"
                    onClick={() => setAiDifficulty(item.diff as AIDifficulty)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center transition-all ${
                      aiDifficulty === item.diff
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <span className="text-[10px] text-slate-500">{item.rating}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Player Side Selection (White vs Black) */}
          {mode === 'ai' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Play As</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserColor('w')}
                  className={`p-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                    userColor === 'w'
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-5 h-5">
                    <Piece type="k" color="w" theme={currentSettings.pieceTheme} />
                  </div>
                  <span className="text-xs font-medium">White (First)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserColor('b')}
                  className={`p-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                    userColor === 'b'
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-5 h-5">
                    <Piece type="k" color="b" theme={currentSettings.pieceTheme} />
                  </div>
                  <span className="text-xs font-medium">Black (Second)</span>
                </button>
              </div>
            </div>
          )}

          {/* Time Control Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Time Control
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_CONTROLS.map(tc => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setTimeControl(tc)}
                  className={`py-2 px-3 rounded-xl border text-xs text-left transition-all ${
                    timeControl.id === tc.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Start Match
          </button>
        </form>
      </div>
    </div>
  );
};
