  I have built Chess Royale, a web chess application built with React, TypeScript, Vite, Tailwind CSS, and Web Audio
  API.
  ### 🌐 Dev Server Live

  The application is running locally at: http://localhost:5173/
  ──────
  ### 👑 Features & Architecture

  1. Chess Engine & AI Bot:
      • Built on chess.js for legal move validation, FEN/PGN generation, en passant, castling, and draw detection.
      • 4 AI Difficulty Levels powered by Minimax search with Alpha-Beta Pruning, Piece-Square Tables (PST), and
      Quiescence search:
          • 🟢 Novice (800 ELO): Beginner friendly.
          • 🔵 Casual (1200 ELO): Balanced casual play.
          • 🟣 Master (1800 ELO): Positional and tactical depth.
          • 🟡 Grandmaster (2400 ELO): Deep evaluation and tactical calculation.

  2. Game Modes:
      • 🤖 Player vs AI: Choose White or Black side and battle against AI bot.
      • 👥 2-Player (Pass & Play): Local 2-player mode with optional auto-flipping board.
      • 🔬 Analysis Sandbox: Unlimited move undo/redo, move evaluation, and position testing.
  3. Interactive Chessboard:
      • Both Click-to-Move and Drag-and-Drop support.

Resume with -c (or command below):
agy --conversation=65ae21b2-a6bc-4cf7-b5e4-01fbae676a0f

      • Legal move target dots & enemy capture indicators.
      • Selected piece glow & last move square highlights.
      • Animated King check warning.
      • Pawn promotion modal dialog (Queen, Rook, Bishop, Knight).
      • 💡 AI Move Hint: Suggests optimal tactical move on demand.
  4. Web Audio SFX Engine:
      • Synthesizes realistic wooden board taps, capture snaps, check alerts, castle sounds, win chimes, and defeat
      tones directly via Web Audio API.
  5. Luxury Dark Theme & Customization:
      • 4 Board Themes: Obsidian Midnight, Grandmaster Walnut, Modern Slate, Cyber Neon.
      • 3 Piece Styles: Classic SVG, Neo Glow, Flat Minimal.
      • Live Engine Evaluation Bar: Displays material and position advantage in real-time.
      • Move History Table: Standard PGN notation, jump-to-move history preview, FEN & PGN copy tools.

  ──────
  ### 📁 Project Structure

  • App.tsx: Main application state & controller.
  • ChessBoard.tsx: 8x8 interactive board.
  • SidebarLeft.tsx: Player profiles, countdown timers, captured pieces.
  • SidebarRight.tsx: Move history table & engine eval bar.
  • engine.ts: Minimax AI & evaluation engine.
  • audio.ts: Audio synthesizer engine.
