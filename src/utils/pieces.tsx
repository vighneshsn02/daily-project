import React from 'react';
import type { PieceTheme } from '../types/chess';

interface PieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  theme?: PieceTheme;
  className?: string;
  size?: number | string;
}

export const Piece: React.FC<PieceProps> = ({ type, color, theme = 'classic', className = '', size = '100%' }) => {
  const isWhite = color === 'w';

  // Base fill & stroke styles according to piece theme
  let fillWhite = '#ffffff';
  let strokeWhite = '#1e293b';
  let fillBlack = '#1e293b';
  let strokeBlack = '#cbd5e1';

  if (theme === 'neo') {
    fillWhite = '#38bdf8'; // Glowing Cyan
    strokeWhite = '#0284c7';
    fillBlack = '#f43f5e'; // Glowing Rose/Pink
    strokeBlack = '#be123c';
  } else if (theme === 'flat') {
    fillWhite = '#f8fafc';
    strokeWhite = '#475569';
    fillBlack = '#334155';
    strokeBlack = '#0f172a';
  }

  const pieceFill = isWhite ? fillWhite : fillBlack;
  const pieceStroke = isWhite ? strokeWhite : strokeBlack;

  const style: React.CSSProperties = {
    width: size,
    height: size,
    filter: isWhite ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' : 'drop-shadow(0px 2px 5px rgba(0,0,0,0.6))',
  };

  switch (type.toLowerCase()) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className={className} style={style}>
          <path
            d="M 22.5,9 C 24.15,9 25.5,10.35 25.5,12 C 25.5,13.2 24.8,14.2 23.8,14.7 C 24.5,15.2 25.2,16 25.5,17 L 27.5,26 C 28,28 26.5,29.5 24.5,29.5 L 20.5,29.5 C 18.5,29.5 17,28 17.5,26 L 19.5,17 C 19.8,16 20.5,15.2 21.2,14.7 C 20.2,14.2 19.5,13.2 19.5,12 C 19.5,10.35 20.85,9 22.5,9 z M 15,32 L 30,32 L 30,36 L 15,36 z"
            fill={pieceFill}
            stroke={pieceStroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className={className} style={style}>
          <g fill={pieceFill} stroke={pieceStroke} strokeWidth="1.5" strokeLinejoin="round">
            <path d="M 9,39 L 36,39 L 36,35 L 9,35 L 9,39 z M 12,35 L 33,35 L 33,26 L 12,26 L 12,35 z M 10,26 L 35,26 L 35,17 L 10,17 L 10,26 z M 9,17 L 11,17 L 11,10 L 15,10 L 15,13 L 20,13 L 20,10 L 25,10 L 25,13 L 30,13 L 30,10 L 34,10 L 34,17 L 36,17 L 36,15 L 9,15 z" />
            <path d="M 12,10 L 12,15 M 17,10 L 17,15 M 22,10 L 22,15 M 27,10 L 27,15 M 33,10 L 33,15" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className={className} style={style}>
          <g fill={pieceFill} stroke={pieceStroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M 22,10 C 32.5,11 38.5,18 31,39 L 15,39 C 15,30 25,32.5 23,18" />
            <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,8.5 C 14.5,9.5 16.5,9.5 16.5,9.5 C 16.5,9.5 17.5,7.5 19.5,8.5 C 19.5,8.5 20.5,9.5 22,10 z" />
            <circle cx="15" cy="15" r="1.5" fill={pieceStroke} />
          </g>
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className={className} style={style}>
          <g fill={pieceFill} stroke={pieceStroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M 9,36 C 12.39,35.03 19.11,36.46 22.5,34 C 25.89,36.46 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,36.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
            <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,22 30,22 C 30.5,20.5 27.5,13.5 22.5,11.5 C 17.5,13.5 14.5,20.5 15,22 C 15,22 14.5,30.5 15,32 z" />
            <circle cx="22.5" cy="9.5" r="2.5" />
            <path d="M 17.5,26 L 27.5,26 M 22.5,21 L 22.5,31" />
          </g>
        </svg>
      );

    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className={className} style={style}>
          <g fill={pieceFill} stroke={pieceStroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,21 L 22.5,10 L 14,21 L 6.5,13.5 L 9,26 z" />
            <path d="M 9,26 C 9,28 10.5,34 11.5,35 C 12.5,36 32.5,36 33.5,35 C 34.5,34 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" />
            <path d="M 11.5,35 C 15,37 30,37 33.5,35 M 12,38 C 15,40 30,40 33,38" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="13.5" cy="19.5" r="2" />
            <circle cx="22.5" cy="8.5" r="2" />
            <circle cx="31.5" cy="19.5" r="2" />
            <circle cx="39" cy="12" r="2" />
          </g>
        </svg>
      );

    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className={className} style={style}>
          <g fill={pieceFill} stroke={pieceStroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M 22.5,11.5 L 22.5,6 M 20,8 L 25,8" />
            <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,11.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25 z" />
            <path d="M 11.5,37 C 17,40 28,40 33.5,37 M 11.5,30 C 17,27 28,27 33.5,30 M 11.5,33.5 C 17,31.5 28,31.5 33.5,33.5 M 11.5,37 L 11.5,30 C 11.5,30 8.5,24.5 12,18.5 C 15.5,12.5 22.5,16 22.5,16 C 22.5,16 29.5,12.5 33,18.5 C 36.5,24.5 33.5,30 33.5,30 L 33.5,37 z" />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
