import { useState, useEffect } from 'react';
import { 
  ChessPiece, 
  Position, 
  GameMove, 
  GameHistory, 
  CastlingRights, 
  PawnPromotion, 
  GameStatus,
  GameMode,
  AiDifficulty
} from '../types';

export const useChessGame = () => {
  const initializeBoard = (): (ChessPiece | null)[][] => {
    const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    board[0][0] = { type: 'rook', color: 'black', symbol: '♜' };
    board[0][1] = { type: 'knight', color: 'black', symbol: '♞' };
    board[0][2] = { type: 'bishop', color: 'black', symbol: '♝' };
    board[0][3] = { type: 'queen', color: 'black', symbol: '♛' };
    board[0][4] = { type: 'king', color: 'black', symbol: '♚' };
    board[0][5] = { type: 'bishop', color: 'black', symbol: '♝' };
    board[0][6] = { type: 'knight', color: 'black', symbol: '♞' };
    board[0][7] = { type: 'rook', color: 'black', symbol: '♜' };
    
    for (let col = 0; col < 8; col++) {
      board[1][col] = { type: 'pawn', color: 'black', symbol: '♟' };
    }
    
    for (let col = 0; col < 8; col++) {
      board[6][col] = { type: 'pawn', color: 'white', symbol: '♙' };
    }
    
    board[7][0] = { type: 'rook', color: 'white', symbol: '♖' };
    board[7][1] = { type: 'knight', color: 'white', symbol: '♘' };
    board[7][2] = { type: 'bishop', color: 'white', symbol: '♗' };
    board[7][3] = { type: 'queen', color: 'white', symbol: '♕' };
    board[7][4] = { type: 'king', color: 'white', symbol: '♔' };
    board[7][5] = { type: 'bishop', color: 'white', symbol: '♗' };
    board[7][6] = { type: 'knight', color: 'white', symbol: '♘' };
    board[7][7] = { type: 'rook', color: 'white', symbol: '♖' };
    
    return board;
  };

  const [board, setBoard] = useState<(ChessPiece | null)[][]>(initializeBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [isInCheck, setIsInCheck] = useState({ white: false, black: false });
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [showEndGameModal, setShowEndGameModal] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('human-vs-human');
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('easy');
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const [castlingRights, setCastlingRights] = useState<CastlingRights>({
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
  });

  const [pawnPromotion, setPawnPromotion] = useState<PawnPromotion | null>(null);
  const [timers, setTimers] = useState({ white: 600, black: 600 });
  const [timerActive, setTimerActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const [gameHistory, setGameHistory] = useState<GameHistory>({
    moves: [],
    currentMoveIndex: -1
  });
  
  const [moveNumber, setMoveNumber] = useState(1);

  const resetGame = () => {
    setBoard(initializeBoard());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCurrentPlayer('white');
    setIsInCheck({ white: false, black: false });
    setGameStatus('playing');
    setCastlingRights({
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true
    });
    setPawnPromotion(null);
    setTimers({ white: 600, black: 600 });
    setTimerActive(false);
    setGameHistory({ moves: [], currentMoveIndex: -1 });
    setMoveNumber(1);
    setShowEndGameModal(true);
    setIsAiThinking(false);
    setGameStarted(false);
  };

  return {
    // State
    board,
    selectedSquare,
    possibleMoves,
    currentPlayer,
    isInCheck,
    gameStatus,
    showEndGameModal,
    gameMode,
    aiDifficulty,
    isAiThinking,
    castlingRights,
    pawnPromotion,
    timers,
    timerActive,
    gameStarted,
    gameHistory,
    moveNumber,
    
    // Setters
    setBoard,
    setSelectedSquare,
    setPossibleMoves,
    setCurrentPlayer,
    setIsInCheck,
    setGameStatus,
    setShowEndGameModal,
    setGameMode,
    setAiDifficulty,
    setIsAiThinking,
    setCastlingRights,
    setPawnPromotion,
    setTimers,
    setTimerActive,
    setGameStarted,
    setGameHistory,
    setMoveNumber,
    
    // Actions
    resetGame,
    initializeBoard
  };
};