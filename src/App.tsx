import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, type Square } from 'chess.js';
import { Header } from './components/Header';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { ChessBoard } from './components/ChessBoard';
import { NewGameModal } from './components/NewGameModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import type { GameSettings, MoveHistoryItem, GameResult, PlayerColor } from './types/chess';
import { sounds } from './utils/audio';
import { evaluateBoard, getBestMove, getHintMove, calculateCapturedPieces } from './utils/engine';

export const App: React.FC = () => {
  // Main Game State
  const [game, setGame] = useState<Chess>(new Chess());
  const [fen, setFen] = useState<string>(game.fen());
  const [settings, setSettings] = useState<GameSettings>({
    mode: 'ai',
    aiDifficulty: 2,
    userColor: 'w',
    timeControl: { id: 'blitz-5', name: '5 min Rapid', initialSeconds: 300, incrementSeconds: 0 },
    boardTheme: 'midnight',
    pieceTheme: 'classic',
    soundEnabled: true,
    soundVolume: 0.7,
    autoFlip: false,
    showLegalMoves: true,
    showMoveHighlights: true,
    showEvalBar: true,
  });

  const [orientation, setOrientation] = useState<PlayerColor>('w');
  const [whiteTime, setWhiteTime] = useState<number>(300);
  const [blackTime, setBlackTime] = useState<number>(300);
  const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintMove, setHintMove] = useState<{ from: Square; to: Square; san: string; eval: number } | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [result, setResult] = useState<GameResult | null>(null);

  // Modals state
  const [isNewGameOpen, setIsNewGameOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);

  // Keep FEN history for move previewing
  const fenHistoryRef = useRef<string[]>([new Chess().fen()]);

  // Sync sound settings with audio engine
  useEffect(() => {
    sounds.setEnabled(settings.soundEnabled);
    sounds.setVolume(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  // Check Game Over status
  const checkGameOverStatus = useCallback((currentGame: Chess) => {
    if (currentGame.isCheckmate()) {
      const winner = currentGame.turn() === 'w' ? 'b' : 'w';
      setResult({ winner, reason: 'checkmate' });
      setIsGameOverOpen(true);
      if (winner === settings.userColor || settings.mode === 'pvp') {
        sounds.playWin();
      } else {
        sounds.playLose();
      }
      return true;
    }
    if (currentGame.isStalemate()) {
      setResult({ winner: 'draw', reason: 'stalemate' });
      setIsGameOverOpen(true);
      return true;
    }
    if (currentGame.isThreefoldRepetition()) {
      setResult({ winner: 'draw', reason: 'threefold' });
      setIsGameOverOpen(true);
      return true;
    }
    if (currentGame.isInsufficientMaterial()) {
      setResult({ winner: 'draw', reason: 'insufficient' });
      setIsGameOverOpen(true);
      return true;
    }
    if (currentGame.isDraw()) {
      setResult({ winner: 'draw', reason: 'fifty-move' });
      setIsGameOverOpen(true);
      return true;
    }
    return false;
  }, [settings.userColor, settings.mode]);

  // Execute Move Handler
  const makeMove = useCallback(
    (from: Square, to: Square, promotion = 'q') => {
      if (result) return false;

      // If user is viewing a historical move, return to current state before making move
      if (currentMoveIndex < moveHistory.length - 1) {
        const currentFEN = fenHistoryRef.current[fenHistoryRef.current.length - 1];
        game.load(currentFEN);
        setCurrentMoveIndex(moveHistory.length - 1);
      }

      try {
        const move = game.move({ from, to, promotion });
        if (!move) return false;

        const newFen = game.fen();
        setFen(newFen);
        fenHistoryRef.current.push(newFen);
        setLastMove({ from, to });
        setHintMove(null);

        // Sound SFX
        if (move.san.includes('O-O')) {
          sounds.playCastle();
        } else if (move.captured) {
          sounds.playCapture();
        } else if (move.san.includes('+') || move.san.includes('#')) {
          sounds.playCheck();
        } else {
          sounds.playMove();
        }

        const isCheck = game.inCheck();
        const isCheckmate = game.isCheckmate();
        const currentEval = evaluateBoard(game);

        const newHistoryItem: MoveHistoryItem = {
          san: move.san,
          fen: newFen,
          from: move.from as Square,
          to: move.to as Square,
          piece: move.piece,
          color: move.color,
          captured: move.captured,
          promotion: move.promotion,
          isCheck,
          isCheckmate,
          evalScore: currentEval,
        };

        const updatedHistory = [...moveHistory, newHistoryItem];
        setMoveHistory(updatedHistory);
        setCurrentMoveIndex(updatedHistory.length - 1);

        // Auto Flip board if enabled in PvP mode
        if (settings.mode === 'pvp' && settings.autoFlip) {
          setOrientation(game.turn());
        }

        checkGameOverStatus(game);
        return true;
      } catch {
        sounds.playIllegal();
        return false;
      }
    },
    [game, result, currentMoveIndex, moveHistory, settings.mode, settings.autoFlip, checkGameOverStatus]
  );

  // AI Turn Logic
  useEffect(() => {
    if (settings.mode !== 'ai' || result || isAiThinking) return;

    const currentTurn = game.turn();
    if (currentTurn !== settings.userColor) {
      setIsAiThinking(true);

      const delay = Math.random() * 300 + 400; // 400ms - 700ms realistic bot response time
      const timer = setTimeout(async () => {
        const aiMove = await getBestMove(game, settings.aiDifficulty);
        if (aiMove) {
          makeMove(aiMove.from, aiMove.to, aiMove.promotion);
        }
        setIsAiThinking(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [game, fen, settings.mode, settings.userColor, settings.aiDifficulty, result, isAiThinking, makeMove]);

  // Timer Countdown Effect
  useEffect(() => {
    if (result || settings.timeControl.initialSeconds === 0 || settings.mode === 'sandbox') return;

    const interval = setInterval(() => {
      const turn = game.turn();
      if (turn === 'w') {
        setWhiteTime(prev => {
          if (prev <= 1) {
            setResult({ winner: 'b', reason: 'timeout' });
            setIsGameOverOpen(true);
            sounds.playLose();
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 1) {
            setResult({ winner: 'w', reason: 'timeout' });
            setIsGameOverOpen(true);
            sounds.playWin();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game, result, settings.timeControl.initialSeconds, settings.mode]);

  // Reset / Start New Game Handler
  const handleStartNewGame = (newSettings?: Partial<GameSettings>) => {
    const mergedSettings = { ...settings, ...newSettings };
    setSettings(mergedSettings);

    const newChess = new Chess();
    setGame(newChess);
    setFen(newChess.fen());
    fenHistoryRef.current = [newChess.fen()];

    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setLastMove(null);
    setHintMove(null);
    setResult(null);
    setIsAiThinking(false);

    // Timers setup
    const timeSec = mergedSettings.timeControl.initialSeconds;
    setWhiteTime(timeSec);
    setBlackTime(timeSec);

    // Set board orientation (White by default, or user color for AI)
    if (mergedSettings.mode === 'ai') {
      setOrientation(mergedSettings.userColor);
    } else {
      setOrientation('w');
    }
  };

  // Move History Jump / Review
  const handleJumpToMove = (index: number) => {
    if (index < -1 || index >= moveHistory.length) return;
    setCurrentMoveIndex(index);

    const targetFen = index === -1 ? fenHistoryRef.current[0] : fenHistoryRef.current[index + 1];
    const previewChess = new Chess(targetFen);
    setGame(previewChess);
    setFen(targetFen);

    if (index >= 0) {
      const item = moveHistory[index];
      setLastMove({ from: item.from as Square, to: item.to as Square });
    } else {
      setLastMove(null);
    }
  };

  // Move Hint Trigger
  const handleGetHint = () => {
    if (result || isAiThinking) return;
    const hint = getHintMove(game);
    if (hint) {
      setHintMove(hint);
      sounds.playHint();
    }
  };

  // Game Action Triggers
  const handleResign = () => {
    if (result) return;
    const winner = game.turn() === 'w' ? 'b' : 'w';
    setResult({ winner, reason: 'resignation' });
    setIsGameOverOpen(true);
  };

  const handleOfferDraw = () => {
    if (result) return;
    setResult({ winner: 'draw', reason: 'stalemate' });
    setIsGameOverOpen(true);
  };

  const handleUndo = () => {
    if (moveHistory.length === 0 || isAiThinking || result) return;

    // Undo 2 plies if in AI mode (user move + AI move), else 1 ply
    const pliesToUndo = settings.mode === 'ai' ? 2 : 1;
    const newHistoryLength = Math.max(0, moveHistory.length - pliesToUndo);

    const newHistory = moveHistory.slice(0, newHistoryLength);
    fenHistoryRef.current = fenHistoryRef.current.slice(0, newHistoryLength + 1);

    const targetFen = fenHistoryRef.current[fenHistoryRef.current.length - 1];
    const newChess = new Chess(targetFen);

    setGame(newChess);
    setFen(targetFen);
    setMoveHistory(newHistory);
    setCurrentMoveIndex(newHistory.length - 1);
    setHintMove(null);

    if (newHistory.length > 0) {
      const last = newHistory[newHistory.length - 1];
      setLastMove({ from: last.from as Square, to: last.to as Square });
    } else {
      setLastMove(null);
    }
  };

  const currentEvalScore = evaluateBoard(game);
  const capturedPieces = calculateCapturedPieces(game);
  const pgnString = game.pgn();

  return (
    <div className="min-h-screen flex flex-col items-center justify-between text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Navigation Header */}
      <Header
        settings={settings}
        onNewGame={() => setIsNewGameOpen(true)}
        onFlipBoard={() => setOrientation(prev => (prev === 'w' ? 'b' : 'w'))}
        onGetHint={handleGetHint}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSound={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
        isAiThinking={isAiThinking}
        isGameOver={result !== null}
      />

      {/* Main Game Layout Grid */}
      <main className="w-full max-w-7xl px-4 py-6 flex-1 flex flex-col lg:flex-row items-center justify-center gap-6">
        {/* Left Sidebar: Player Cards & Timers */}
        <SidebarLeft
          settings={settings}
          turn={game.turn()}
          whiteTime={whiteTime}
          blackTime={blackTime}
          capturedPieces={capturedPieces}
          onResign={handleResign}
          onOfferDraw={handleOfferDraw}
          onUndo={handleUndo}
          canUndo={moveHistory.length > 0}
          isGameOver={result !== null}
          orientation={orientation}
        />

        {/* Center: Interactive Chessboard */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <ChessBoard
            game={game}
            orientation={orientation}
            boardTheme={settings.boardTheme}
            pieceTheme={settings.pieceTheme}
            onMove={makeMove}
            showLegalMoves={settings.showLegalMoves}
            showMoveHighlights={settings.showMoveHighlights}
            lastMove={lastMove}
            hintMove={hintMove}
            isAiThinking={isAiThinking}
            isGameOver={result !== null}
          />
        </div>

        {/* Right Sidebar: Move History & Engine Evaluation Bar */}
        <SidebarRight
          moveHistory={moveHistory}
          currentMoveIndex={currentMoveIndex}
          onJumpToMove={handleJumpToMove}
          evaluation={currentEvalScore}
          currentFen={fen}
          pgnString={pgnString}
          settings={settings}
        />
      </main>

      {/* Footer Branding */}
      <footer className="w-full py-3 text-center text-xs text-slate-500 border-t border-white/5 font-medium">
        Chess Royale &copy; 2026 &bull; Crafted with React & Web Audio API
      </footer>

      {/* Dialog Modals */}
      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onStartGame={handleStartNewGame}
        currentSettings={settings}
      />

      <GameOverModal
        result={isGameOverOpen ? result : null}
        settings={settings}
        onRematch={() => handleStartNewGame()}
        onNewGame={() => {
          setIsGameOverOpen(false);
          setIsNewGameOpen(true);
        }}
        onClose={() => setIsGameOverOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={newS => setSettings(prev => ({ ...prev, ...newS }))}
      />
    </div>
  );
};

export default App;
