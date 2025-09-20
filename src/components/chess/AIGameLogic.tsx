import { useEffect } from 'react';
import { ChessAI } from './ai/chessAI';
import { ChessGameLogic } from './ChessGameLogic';
import { ChessPiece, GameMove } from './types';

interface AIGameLogicProps {
  gameMode: string;
  currentPlayer: 'white' | 'black';
  gameStatus: string;
  isAiThinking: boolean;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  board: (ChessPiece | null)[][];
  gameHistory: { moves: GameMove[]; currentMoveIndex: number };
  setIsAiThinking: (thinking: boolean) => void;
  setBoard: (board: (ChessPiece | null)[][]) => void;
  setCurrentPlayer: (player: 'white' | 'black') => void;
  setGameStatus: (status: string) => void;
  setShowEndGameModal: (show: boolean) => void;
  setGameHistory: (updater: (prev: any) => any) => void;
  setMoveNumber: (updater: (prev: number) => number) => void;
  setIsInCheck: (updater: (prev: any) => any) => void;
}

export const useAIGameLogic = ({
  gameMode,
  currentPlayer,
  gameStatus,
  isAiThinking,
  aiDifficulty,
  board,
  gameHistory,
  setIsAiThinking,
  setBoard,
  setCurrentPlayer,
  setGameStatus,
  setShowEndGameModal,
  setGameHistory,
  setMoveNumber,
  setIsInCheck
}: AIGameLogicProps) => {
  
  // ИИ логика с минимакс алгоритмом
  const makeAiMove = () => {
    setIsAiThinking(true);
    
    setTimeout(() => {
      // Используем продвинутый ИИ с минимакс алгоритмом
      const bestMove = ChessAI.getBestMove(board, aiDifficulty);
      
      if (!bestMove) {
        // Нет доступных ходов - мат или пат
        const isInCheck = ChessAI.isKingInCheck(board, 'black');
        if (isInCheck) {
          setGameStatus('checkmate');
        } else {
          setGameStatus('stalemate');
        }
        setShowEndGameModal(true);
        setIsAiThinking(false);
        return;
      }
      
      if (bestMove) {
        
        const capturedPiece = board[bestMove.to.row][bestMove.to.col];
        const newBoard = board.map(r => [...r]);
        newBoard[bestMove.from.row][bestMove.from.col] = null;
        newBoard[bestMove.to.row][bestMove.to.col] = bestMove.piece;
        
        // Проверяем превращение пешки
        if (bestMove.piece.type === 'pawn' && bestMove.to.row === 7) {
          newBoard[bestMove.to.row][bestMove.to.col] = {
            type: 'queen',
            color: 'black',
            symbol: '♛'
          };
        }
        
        const notation = ChessGameLogic.createMoveNotation(bestMove.piece, bestMove.from, bestMove.to, capturedPiece);
        
        const gameMove: GameMove = {
          from: bestMove.from,
          to: bestMove.to,
          piece: bestMove.piece,
          capturedPiece,
          notation,
          boardAfterMove: newBoard.map(r => [...r])
        };
        
        setBoard(newBoard);
        setCurrentPlayer('white');
        setGameHistory(prev => ({
          moves: [...prev.moves.slice(0, prev.currentMoveIndex + 1), gameMove],
          currentMoveIndex: prev.currentMoveIndex + 1
        }));
        setMoveNumber(prev => prev + 1);
        
        // Проверяем трёхкратное повторение позиции
        const repetitionCheck = ChessGameLogic.checkThreefoldRepetition(newBoard, [...gameHistory.moves.slice(0, gameHistory.currentMoveIndex + 1)]);
        if (repetitionCheck.isRepetition) {
          setGameStatus('draw');
          setShowEndGameModal(true);
          setIsAiThinking(false);
          return;
        }
        
        // Проверяем шах/мат для белых после хода ИИ
        const isCheck = ChessGameLogic.isKingInCheck(newBoard, 'white');
        setIsInCheck(prev => ({
          ...prev,
          white: isCheck
        }));
        
        // Проверяем есть ли доступные ходы у белых
        const availableMovesForWhite = ChessAI.getAllMoves(newBoard, 'white');
        
        if (availableMovesForWhite.length === 0) {
          if (isCheck) {
            setGameStatus('checkmate');
            setShowEndGameModal(true);
          } else {
            setGameStatus('stalemate');
            setShowEndGameModal(true);
          }
        } else if (isCheck) {
          setGameStatus('check');
        } else {
          setGameStatus('playing');
        }
      }
      
      setIsAiThinking(false);
    }, aiDifficulty === 'easy' ? 800 : aiDifficulty === 'medium' ? 1200 : 2000); // Разная задержка по сложности
  };

  // Эффект для ходов ИИ
  useEffect(() => {
    const isAtLatestMove = gameHistory.moves.length === 0 || 
                          gameHistory.currentMoveIndex === gameHistory.moves.length - 1;
    
    if (gameMode === 'human-vs-ai' && currentPlayer === 'black' && 
        (gameStatus === 'playing' || gameStatus === 'check') && !isAiThinking && isAtLatestMove) {
      makeAiMove();
    }
  }, [currentPlayer, gameMode, gameStatus, gameHistory.currentMoveIndex, gameHistory.moves.length]);

  return { makeAiMove };
};

export default useAIGameLogic;