import React from 'react';
import { Settings as SettingsIcon, Volume2, Palette, Eye, RotateCw } from 'lucide-react';
import type { GameSettings, BoardTheme, PieceTheme } from '../types/chess';
import { Piece } from '../utils/pieces';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-amber-300">
            <SettingsIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Preferences</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Board Theme */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Chessboard Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'midnight', name: 'Obsidian Midnight', colors: ['#1e293b', '#0f172a'] },
                { id: 'walnut', name: 'Grandmaster Walnut', colors: ['#f0d9b5', '#b58863'] },
                { id: 'slate', name: 'Modern Slate', colors: ['#e2e8f0', '#475569'] },
                { id: 'cyberpunk', name: 'Cyber Neon', colors: ['#2e1065', '#581c87'] },
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => onUpdateSettings({ boardTheme: theme.id as BoardTheme })}
                  className={`p-2.5 rounded-2xl border flex items-center gap-2 transition-all ${
                    settings.boardTheme === theme.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex w-6 h-6 rounded-md overflow-hidden border border-slate-700">
                    <div className="w-1/2 h-full" style={{ backgroundColor: theme.colors[0] }}></div>
                    <div className="w-1/2 h-full" style={{ backgroundColor: theme.colors[1] }}></div>
                  </div>
                  <span className="text-xs">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Piece Style */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Piece Design</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'classic', name: 'Classic' },
                { id: 'neo', name: 'Neo Glow' },
                { id: 'flat', name: 'Flat Minimal' },
              ].map(pTheme => (
                <button
                  key={pTheme.id}
                  onClick={() => onUpdateSettings({ pieceTheme: pTheme.id as PieceTheme })}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    settings.pieceTheme === pTheme.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-6 h-6">
                    <Piece type="n" color="w" theme={pTheme.id as PieceTheme} />
                  </div>
                  <span className="text-xs">{pTheme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                Sound Effects
              </span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={e => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Visual Toggles */}
          <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              Gameplay Overlays
            </span>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Show Legal Target Dots</span>
              <input
                type="checkbox"
                checked={settings.showLegalMoves}
                onChange={e => onUpdateSettings({ showLegalMoves: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Highlight Last Move</span>
              <input
                type="checkbox"
                checked={settings.showMoveHighlights}
                onChange={e => onUpdateSettings({ showMoveHighlights: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Display Live Engine Evaluation Bar</span>
              <input
                type="checkbox"
                checked={settings.showEvalBar}
                onChange={e => onUpdateSettings({ showEvalBar: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-slate-400" /> Auto-Flip Board on Turn (PvP Mode)
              </span>
              <input
                type="checkbox"
                checked={settings.autoFlip}
                onChange={e => onUpdateSettings({ autoFlip: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
        >
          Close Preferences
        </button>
      </div>
    </div>
  );
};
