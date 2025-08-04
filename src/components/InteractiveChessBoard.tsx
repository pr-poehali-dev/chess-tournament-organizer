import { useEffect, useState } from 'react';
import { useChessGame } from './chess/hooks/useChessGame';
import ChessBoard from './chess/ChessBoard';
import GameModeSelector from './chess/GameModeSelector';
import PlayerTimers from './chess/PlayerTimers';
import MoveHistory from './chess/MoveHistory';
import Icon from '@/components/ui/icon';
import { ChessPiece, Position, GameMove } from './chess/types';
import { ChessAI } from './chess/ai/chessAI';

const InteractiveChessBoard = () => {
  const [showModeSelector, setShowModeSelector] = useState(false);
  
  const {
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
  } = useChessGame();

  // Игровая логика
  const findKing = (board: (ChessPiece | null)[][], color: 'white' | 'black'): Position | null => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  };

  // Функция для проверки трёхкратного повторения позиции
  const checkThreefoldRepetition = (newBoard: (ChessPiece | null)[][], currentHistory: GameMove[]): { isRepetition: boolean; moveNumber?: number; totalMoves?: number } => {
    // Слишком мало ходов для повторения (минимум 8 ходов - 4 полных хода каждой стороны)
    if (currentHistory.length < 8) {
      return { isRepetition: false };
    }

    // Преобразуем доску в строку для сравнения
    const boardToString = (board: (ChessPiece | null)[][]): string => {
      return board.map(row => 
        row.map(piece => piece ? `${piece.color}${piece.type}` : '').join('')
      ).join('');
    };

    const currentPosition = boardToString(newBoard);
    let repetitionCount = 0;
    const matchingMoves: number[] = [];

    // Проверяем все предыдущие позиции в истории
    for (let i = 0; i < currentHistory.length; i++) {
      if (boardToString(currentHistory[i].boardAfterMove) === currentPosition) {
        repetitionCount++;
        matchingMoves.push(i + 1); // +1 для человеческого счёта ходов
      }
    }

    // Временная отладка для выявления проблемы
    if (currentHistory.length >= 4) {
      console.log(`Проверка повторений: ходов=${currentHistory.length}, повторений=${repetitionCount}, позиция=${currentPosition.slice(0, 20)}...`);
    }

    // Возвращаем подробную информацию если позиция встречалась ровно 2 раза в истории (+ текущая = 3)
    // И убеждаемся что это действительно значимое повторение (не случайное)
    if (repetitionCount === 2 && matchingMoves.length >= 2) {
      // Проверяем что повторения не слишком близко друг к другу (минимум 2 хода между повторениями)
      const isValidRepetition = matchingMoves.every((moveIndex, idx) => 
        idx === 0 || moveIndex - matchingMoves[idx - 1] >= 2
      );
      
      if (isValidRepetition) {
        return { 
          isRepetition: true, 
          moveNumber: Math.ceil((currentHistory.length + 1) / 2),
          totalMoves: currentHistory.length + 1
        };
      }
    }

    return { isRepetition: false };
  };

  const isSquareAttacked = (board: (ChessPiece | null)[][], targetRow: number, targetCol: number, byColor: 'white' | 'black'): boolean => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === byColor) {
          const moves = getPieceAttackMoves(board, row, col, piece);
          if (moves.some(move => move.row === targetRow && move.col === targetCol)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const getPieceAttackMoves = (board: (ChessPiece | null)[][], row: number, col: number, piece: ChessPiece): Position[] => {
    const moves: Position[] = [];

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        for (const colOffset of [-1, 1]) {
          const newRow = row + direction;
          const newCol = col + colOffset;
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            moves.push({ row: newRow, col: newCol });
          }
        }
        break;

      case 'rook':
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
            moves.push({ row: newRow, col: newCol });
            if (board[newRow][newCol]) break;
          }
        }
        break;

      case 'knight':
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of knightMoves) {
          const newRow = row + dr;
          const newCol = col + dc;
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            moves.push({ row: newRow, col: newCol });
          }
        }
        break;

      case 'bishop':
        for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
            moves.push({ row: newRow, col: newCol });
            if (board[newRow][newCol]) break;
          }
        }
        break;

      case 'queen':
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
            moves.push({ row: newRow, col: newCol });
            if (board[newRow][newCol]) break;
          }
        }
        break;

      case 'king':
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const newRow = row + dr;
          const newCol = col + dc;
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            moves.push({ row: newRow, col: newCol });
          }
        }
        break;
    }

    return moves;
  };

  const isKingInCheck = (board: (ChessPiece | null)[][], color: 'white' | 'black'): boolean => {
    const kingPos = findKing(board, color);
    if (!kingPos) return false;

    const enemyColor = color === 'white' ? 'black' : 'white';
    return isSquareAttacked(board, kingPos.row, kingPos.col, enemyColor);
  };

  const isMoveLegal = (board: (ChessPiece | null)[][], fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const testBoard = board.map(row => [...row]);
    const piece = testBoard[fromRow][fromCol];
    if (!piece) return false;

    testBoard[fromRow][fromCol] = null;
    testBoard[toRow][toCol] = piece;

    return !isKingInCheck(testBoard, piece.color);
  };

  const getRawMoves = (board: (ChessPiece | null)[][], row: number, col: number): Position[] => {
    const piece = board[row][col];
    if (!piece) return [];

    const moves: Position[] = [];

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
          moves.push({ row: row + direction, col });
          
          if (row === startRow && !board[row + 2 * direction][col]) {
            moves.push({ row: row + 2 * direction, col });
          }
        }

        // Обычные взятия пешкой
        for (const colOffset of [-1, 1]) {
          const newRow = row + direction;
          const newCol = col + colOffset;
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = board[newRow][newCol];
            if (targetPiece && targetPiece.color !== piece.color) {
              moves.push({ row: newRow, col: newCol });
            }
          }
        }
        
        // Взятие на проходе
        if (gameHistory.moves.length > 0) {
          const lastMove = gameHistory.moves[gameHistory.moves.length - 1];
          if (lastMove.isPawnDoubleMove && lastMove.piece.type === 'pawn' && 
              lastMove.piece.color !== piece.color) {
            // Проверяем, находится ли наша пешка рядом с пешкой противника, которая сделала двойной ход
            const enemyPawnRow = lastMove.to.row;
            const enemyPawnCol = lastMove.to.col;
            const ourPawnExpectedRow = piece.color === 'white' ? 3 : 4; // 5-й ряд для белых, 4-й для черных
            
            if (row === ourPawnExpectedRow && enemyPawnRow === row && 
                Math.abs(enemyPawnCol - col) === 1) {
              // Можем взять на проходе
              moves.push({ row: row + direction, col: enemyPawnCol });
            }
          }
        }
        break;
        
      case 'rook':
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
            
            const targetPiece = board[newRow][newCol];
            if (!targetPiece) {
              moves.push({ row: newRow, col: newCol });
            } else {
              if (targetPiece.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
              }
              break;
            }
          }
        }
        break;

      case 'knight':
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of knightMoves) {
          const newRow = row + dr;
          const newCol = col + dc;
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = board[newRow][newCol];
            if (!targetPiece || targetPiece.color !== piece.color) {
              moves.push({ row: newRow, col: newCol });
            }
          }
        }
        break;

      case 'bishop':
        for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
            
            const targetPiece = board[newRow][newCol];
            if (!targetPiece) {
              moves.push({ row: newRow, col: newCol });
            } else {
              if (targetPiece.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
              }
              break;
            }
          }
        }
        break;

      case 'queen':
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
            
            const targetPiece = board[newRow][newCol];
            if (!targetPiece) {
              moves.push({ row: newRow, col: newCol });
            } else {
              if (targetPiece.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
              }
              break;
            }
          }
        }
        break;

      case 'king':
        // Обычные ходы короля
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const newRow = row + dr;
          const newCol = col + dc;
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = board[newRow][newCol];
            if (!targetPiece || targetPiece.color !== piece.color) {
              moves.push({ row: newRow, col: newCol });
            }
          }
        }
        
        // Рокировка
        if (!isKingInCheck(board, piece.color)) {
          const kingRow = piece.color === 'white' ? 7 : 0;
          
          // Короткая рокировка (король на e1->g1 или e8->g8)
          if (piece.color === 'white' && castlingRights.whiteKingSide || 
              piece.color === 'black' && castlingRights.blackKingSide) {
            if (row === kingRow && col === 4 && // Король на начальной позиции
                !board[kingRow][5] && !board[kingRow][6] && // Поля f и g свободны
                board[kingRow][7]?.type === 'rook' && board[kingRow][7]?.color === piece.color && // Ладья на h
                !isSquareAttacked(board, kingRow, 5, piece.color === 'white' ? 'black' : 'white') && // f не под боем
                !isSquareAttacked(board, kingRow, 6, piece.color === 'white' ? 'black' : 'white')) { // g не под боем
              moves.push({ row: kingRow, col: 6 }); // Короткая рокировка
            }
          }
          
          // Длинная рокировка (король на e1->c1 или e8->c8)
          if (piece.color === 'white' && castlingRights.whiteQueenSide || 
              piece.color === 'black' && castlingRights.blackQueenSide) {
            if (row === kingRow && col === 4 && // Король на начальной позиции
                !board[kingRow][3] && !board[kingRow][2] && !board[kingRow][1] && // Поля d, c, b свободны
                board[kingRow][0]?.type === 'rook' && board[kingRow][0]?.color === piece.color && // Ладья на a
                !isSquareAttacked(board, kingRow, 3, piece.color === 'white' ? 'black' : 'white') && // d не под боем
                !isSquareAttacked(board, kingRow, 2, piece.color === 'white' ? 'black' : 'white')) { // c не под боем
              moves.push({ row: kingRow, col: 2 }); // Длинная рокировка
            }
          }
        }
        break;
    }

    return moves;
  };

  const getPossibleMoves = (board: (ChessPiece | null)[][], row: number, col: number): Position[] => {
    const rawMoves = getRawMoves(board, row, col);
    return rawMoves.filter(move => isMoveLegal(board, row, col, move.row, move.col));
  };

  const createMoveNotation = (piece: ChessPiece, from: Position, to: Position, capturedPiece: ChessPiece | null): string => {
    const files = 'abcdefgh';
    let notation = '';
    
    if (piece.type !== 'pawn') {
      const pieceSymbols = {
        king: 'K', queen: 'Q', rook: 'R', 
        bishop: 'B', knight: 'N'
      };
      notation += pieceSymbols[piece.type as keyof typeof pieceSymbols];
    }
    
    if (capturedPiece) {
      if (piece.type === 'pawn') {
        notation += files[from.col];
      }
      notation += 'x';
    }
    
    notation += files[to.col] + (8 - to.row);
    
    return notation;
  };

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
        
        const notation = createMoveNotation(bestMove.piece, bestMove.from, bestMove.to, capturedPiece);
        
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
        const repetitionCheck = checkThreefoldRepetition(newBoard, [...gameHistory.moves.slice(0, gameHistory.currentMoveIndex + 1)]);
        if (repetitionCheck.isRepetition) {
          setGameStatus('draw');
          setShowEndGameModal(true);
          setIsAiThinking(false);
          return;
        }
        
        // Проверяем шах/мат для белых после хода ИИ
        const isCheck = isKingInCheck(newBoard, 'white');
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

  // Эффект для автоматического запуска таймера после первого хода
  useEffect(() => {
    if (gameStarted && gameHistory.moves.length > 0 && !timerActive) {
      setTimerActive(true);
    }
  }, [gameStarted, gameHistory.moves.length, timerActive]);

  // Таймеры игроков
  useEffect(() => {
    if (!timerActive || (gameStatus !== 'playing' && gameStatus !== 'check')) return;

    // Определяем реального текущего игрока (чей ход в актуальной партии)
    const realCurrentPlayer = gameHistory.moves.length % 2 === 0 ? 'white' : 'black';

    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = { ...prev };
        if (realCurrentPlayer === 'white') {
          newTimers.white = Math.max(0, prev.white - 1);
          if (newTimers.white === 0) {
            setGameStatus('checkmate');
          }
        } else {
          newTimers.black = Math.max(0, prev.black - 1);
          if (newTimers.black === 0) {
            setGameStatus('checkmate');
          }
        }
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, gameStatus, gameHistory.moves.length]);

  const handleSquareClick = (row: number, col: number) => {
    if (isAiThinking || (gameMode === 'human-vs-ai' && currentPlayer === 'black')) return;
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'draw') return;
    
    // Проверяем, находимся ли мы на последнем ходе в истории
    const isAtLatestMove = gameHistory.moves.length === 0 || 
                          gameHistory.currentMoveIndex === gameHistory.moves.length - 1;
    if (!isAtLatestMove) {
      // Если мы просматриваем историю, не позволяем делать ходы
      return;
    }

    const piece = board[row][col];

    if (selectedSquare && possibleMoves.some(move => move.row === row && move.col === col)) {
      const movingPiece = board[selectedSquare.row][selectedSquare.col];
      if (movingPiece) {
        const capturedPiece = board[row][col];
        const newBoard = board.map(r => [...r]);
        newBoard[selectedSquare.row][selectedSquare.col] = null;
        newBoard[row][col] = movingPiece;
        
        // Обработка рокировки
        if (movingPiece.type === 'king' && Math.abs(col - selectedSquare.col) === 2) {
          const kingRow = movingPiece.color === 'white' ? 7 : 0;
          
          if (col === 6) { // Короткая рокировка
            // Перемещаем ладью с h на f
            const rook = newBoard[kingRow][7];
            if (rook && rook.type === 'rook') {
              newBoard[kingRow][7] = null;
              newBoard[kingRow][5] = rook;
            }
          } else if (col === 2) { // Длинная рокировка
            // Перемещаем ладью с a на d
            const rook = newBoard[kingRow][0];
            if (rook && rook.type === 'rook') {
              newBoard[kingRow][0] = null;
              newBoard[kingRow][3] = rook;
            }
          }
        }
        
        // Обновляем права на рокировку
        if (movingPiece.type === 'king') {
          setCastlingRights(prev => ({
            ...prev,
            ...(movingPiece.color === 'white' 
              ? { whiteKingSide: false, whiteQueenSide: false }
              : { blackKingSide: false, blackQueenSide: false })
          }));
        } else if (movingPiece.type === 'rook') {
          const rookStartRow = movingPiece.color === 'white' ? 7 : 0;
          if (selectedSquare.row === rookStartRow) {
            if (selectedSquare.col === 0) { // Длинная ладья
              setCastlingRights(prev => ({
                ...prev,
                ...(movingPiece.color === 'white' 
                  ? { whiteQueenSide: false }
                  : { blackQueenSide: false })
              }));
            } else if (selectedSquare.col === 7) { // Короткая ладья
              setCastlingRights(prev => ({
                ...prev,
                ...(movingPiece.color === 'white' 
                  ? { whiteKingSide: false }
                  : { blackKingSide: false })
              }));
            }
          }
        }
        
        // Проверяем превращение пешки
        if (movingPiece.type === 'pawn' && 
            ((movingPiece.color === 'white' && row === 0) || 
             (movingPiece.color === 'black' && row === 7))) {
          setBoard(newBoard);
          setPawnPromotion({
            position: { row, col },
            color: movingPiece.color
          });
          setSelectedSquare(null);
          setPossibleMoves([]);
          return;
        }
        
        // Проверяем взятие на проходе
        let isEnPassant = false;
        let actualCapturedPiece = capturedPiece;
        
        if (movingPiece.type === 'pawn' && !capturedPiece && col !== selectedSquare.col) {
          // Это взятие на проходе
          isEnPassant = true;
          const enemyPawnRow = movingPiece.color === 'white' ? row + 1 : row - 1;
          actualCapturedPiece = newBoard[enemyPawnRow][col];
          newBoard[enemyPawnRow][col] = null; // Убираем взятую пешку
        }
        
        // Проверяем двойной ход пешки
        const isPawnDoubleMove = movingPiece.type === 'pawn' && 
          Math.abs(row - selectedSquare.row) === 2;
        
        const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
        
        // Специальная нотация для рокировки и взятия на проходе
        let notation: string;
        if (movingPiece.type === 'king' && Math.abs(col - selectedSquare.col) === 2) {
          notation = col === 6 ? 'O-O' : 'O-O-O'; // Короткая или длинная рокировка
        } else if (isEnPassant) {
          const files = 'abcdefgh';
          notation = `${files[selectedSquare.col]}x${files[col]}${8 - row} e.p.`;
        } else {
          notation = createMoveNotation(movingPiece, selectedSquare, { row, col }, actualCapturedPiece);
        }
        
        const gameMove: GameMove = {
          from: selectedSquare,
          to: { row, col },
          piece: movingPiece,
          capturedPiece: actualCapturedPiece,
          notation,
          boardAfterMove: newBoard.map(r => [...r]),
          isEnPassant,
          isPawnDoubleMove
        };
        
        setBoard(newBoard);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setCurrentPlayer(nextPlayer);
        setGameHistory(prev => ({
          moves: [...prev.moves.slice(0, prev.currentMoveIndex + 1), gameMove],
          currentMoveIndex: prev.currentMoveIndex + 1
        }));
        
        if (nextPlayer === 'black') {
          setMoveNumber(prev => prev + 1);
        }
        
        // Проверяем шах/мат
        const isCheck = isKingInCheck(newBoard, nextPlayer);
        setIsInCheck(prev => ({
          ...prev,
          [nextPlayer]: isCheck
        }));
        
        // Проверяем трёхкратное повторение позиции
        const repetitionCheck = checkThreefoldRepetition(newBoard, [...gameHistory.moves.slice(0, gameHistory.currentMoveIndex + 1)]);
        if (repetitionCheck.isRepetition) {
          setGameStatus('draw');
          setShowEndGameModal(true);
          return;
        }
        
        // Проверяем есть ли доступные ходы у следующего игрока
        const availableMoves = ChessAI.getAllMoves(newBoard, nextPlayer);
        
        if (availableMoves.length === 0) {
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
    } else if (piece && piece.color === currentPlayer) {
      setSelectedSquare({ row, col });
      setPossibleMoves(getPossibleMoves(board, row, col));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const goToMove = (moveIndex: number) => {
    if (moveIndex < 0) {
      setBoard(initializeBoard());
      setCurrentPlayer('white');
      setMoveNumber(1);
    } else if (moveIndex < gameHistory.moves.length) {
      const targetMove = gameHistory.moves[moveIndex];
      setBoard(targetMove.boardAfterMove.map(r => [...r]));
      setCurrentPlayer(moveIndex % 2 === 0 ? 'black' : 'white');
      setMoveNumber(Math.floor(moveIndex / 2) + 1);
    }
    
    setGameHistory(prev => ({ ...prev, currentMoveIndex: moveIndex }));
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const completePawnPromotion = (pieceType: 'queen' | 'rook' | 'bishop' | 'knight') => {
    if (!pawnPromotion) return;
    
    const symbols = {
      queen: pawnPromotion.color === 'white' ? '♕' : '♛',
      rook: pawnPromotion.color === 'white' ? '♖' : '♜',
      bishop: pawnPromotion.color === 'white' ? '♗' : '♝',
      knight: pawnPromotion.color === 'white' ? '♘' : '♞'
    };
    
    const newBoard = board.map(row => [...row]);
    newBoard[pawnPromotion.position.row][pawnPromotion.position.col] = {
      type: pieceType,
      color: pawnPromotion.color,
      symbol: symbols[pieceType]
    };
    
    setBoard(newBoard);
    setPawnPromotion(null);
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-8">
        
        {/* Кнопка начать игру */}
        {!gameStarted && gameHistory.moves.length === 0 && (
          <div className="w-full lg:w-80 flex flex-col items-center justify-center" style={{height: '640px'}}>
            <div className="text-center space-y-6">
              <div className="text-8xl mb-4">♟️</div>
              <h1 className="text-4xl font-bold text-primary mb-2">Шахматы</h1>
              <p className="text-gray-600 mb-8">Интеллектуальная игра для двоих</p>
              <button
                onClick={() => setShowModeSelector(true)}
                className="px-8 py-4 bg-primary hover:bg-gold-600 text-black rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
              >
                🎮 Начать игру
              </button>
            </div>
          </div>
        )}
        
        <GameModeSelector
          gameMode={gameMode}
          aiDifficulty={aiDifficulty}
          gameStarted={gameStarted}
          gameHistoryLength={gameHistory.moves.length}
          showModeSelector={showModeSelector}
          onGameModeSelect={setGameMode}
          onAiDifficultySelect={setAiDifficulty}
          onStartGame={() => setGameStarted(true)}
          onCloseModeSelector={() => setShowModeSelector(false)}
        />

        {/* Основная игровая область - показывается только если игра начата */}
        {gameStarted && (
          <div className="flex flex-col items-center space-y-6">
          
          {/* Всплывающее окно с результатом игры */}
          {(gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'draw') && showEndGameModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-4 text-center border-4 border-primary transform animate-scaleIn">
                <div className="mb-6">
                  {gameStatus === 'checkmate' ? (
                    <>
                      <div className="text-7xl mb-4 animate-bounce">
                        {currentPlayer === 'white' ? '👑' : gameMode === 'human-vs-ai' ? '🤖' : '👑'}
                      </div>
                      <h2 className="text-4xl font-bold text-primary mb-3">
                        {currentPlayer === 'white' ? 'ЧЕРНЫЕ ПОБЕДИЛИ!' : 
                         gameMode === 'human-vs-ai' ? 'ВЫ ВЫИГРАЛИ!' : 'БЕЛЫЕ ПОБЕДИЛИ!'}
                      </h2>
                      <div className="bg-red-100 rounded-lg p-4 mb-4">
                        <div className="text-3xl mb-2">♔</div>
                        <p className="text-lg font-semibold text-red-800">
                          Шах и мат!
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          Король под атакой и не может спастись
                        </p>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Количество ходов: <span className="font-bold">{gameHistory.moves.length}</span></p>
                        <p>Время партии: <span className="font-bold">
                          {Math.floor((900 - Math.min(timers.white, timers.black)) / 60)}:
                          {((900 - Math.min(timers.white, timers.black)) % 60).toString().padStart(2, '0')}
                        </span></p>
                      </div>
                    </>
                  ) : gameStatus === 'draw' ? (
                    <>
                      <div className="text-7xl mb-4 animate-pulse">🔄</div>
                      <h2 className="text-4xl font-bold text-primary mb-3">НИЧЬЯ ОБЪЯВЛЕНА!</h2>
                      <div className="bg-blue-100 rounded-lg p-4 mb-4">
                        <div className="text-3xl mb-2">🔄</div>
                        <p className="text-lg font-semibold text-blue-800">
                          Трёхкратное повторение позиции
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                          Одинаковая позиция повторилась 3 раза подряд
                        </p>
                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          <p className="font-semibold">🏛️ Шахматное правило:</p>
                          <p>Если одна и та же позиция возникает трижды, автоматически объявляется ничья</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="text-sm text-gray-700 space-y-1">
                          <p>📍 <span className="font-semibold">Ничья на ходу:</span> 
                            <span className="font-bold text-primary ml-1">
                              {Math.ceil(gameHistory.moves.length / 2)}
                            </span>
                          </p>
                          <p>🔢 <span className="font-semibold">Всего ходов:</span> 
                            <span className="font-bold">{gameHistory.moves.length}</span>
                          </p>
                          <p>⏱️ <span className="font-semibold">Время партии:</span> 
                            <span className="font-bold">
                              {Math.floor((900 - Math.min(timers.white, timers.black)) / 60)}:
                              {((900 - Math.min(timers.white, timers.black)) % 60).toString().padStart(2, '0')}
                            </span>
                          </p>
                          <p>⚖️ <span className="font-semibold">Результат:</span> 
                            <span className="font-bold text-blue-600">½ - ½</span>
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-7xl mb-4 animate-pulse">🤝</div>
                      <h2 className="text-4xl font-bold text-primary mb-3">НИЧЬЯ!</h2>
                      <div className="bg-yellow-100 rounded-lg p-4 mb-4">
                        <div className="text-3xl mb-2">⚖️</div>
                        <p className="text-lg font-semibold text-yellow-800">
                          Пат - тупиковая позиция
                        </p>
                        <p className="text-sm text-yellow-600 mt-1">
                          Нет доступных ходов, но король не под угрозой
                        </p>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Количество ходов: <span className="font-bold">{gameHistory.moves.length}</span></p>
                        <p>Время партии: <span className="font-bold">
                          {Math.floor((900 - Math.min(timers.white, timers.black)) / 60)}:
                          {((900 - Math.min(timers.white, timers.black)) % 60).toString().padStart(2, '0')}
                        </span></p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowEndGameModal(false)}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                  >
                    🔍 Анализировать партию
                  </button>
                  <button
                    onClick={resetGame}
                    className="w-full px-6 py-3 bg-primary hover:bg-gold-600 text-black rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                  >
                    🔄 Новая игра
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Модальное окно превращения пешки */}
          {pawnPromotion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center border-4 border-primary">
                <h3 className="text-2xl font-bold mb-6">Превращение пешки</h3>
                <p className="text-gray-600 mb-6">Выберите фигуру для превращения:</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => completePawnPromotion('queen')}
                    className="flex flex-col items-center p-4 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-bold text-lg transition-colors"
                  >
                    <span className="text-4xl mb-2">
                      {pawnPromotion.color === 'white' ? '♕' : '♛'}
                    </span>
                    Ферзь
                  </button>
                  <button
                    onClick={() => completePawnPromotion('rook')}
                    className="flex flex-col items-center p-4 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-bold text-lg transition-colors"
                  >
                    <span className="text-4xl mb-2">
                      {pawnPromotion.color === 'white' ? '♖' : '♜'}
                    </span>
                    Ладья
                  </button>
                  <button
                    onClick={() => completePawnPromotion('bishop')}
                    className="flex flex-col items-center p-4 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-bold text-lg transition-colors"
                  >
                    <span className="text-4xl mb-2">
                      {pawnPromotion.color === 'white' ? '♗' : '♝'}
                    </span>
                    Слон
                  </button>
                  <button
                    onClick={() => completePawnPromotion('knight')}
                    className="flex flex-col items-center p-4 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-bold text-lg transition-colors"
                  >
                    <span className="text-4xl mb-2">
                      {pawnPromotion.color === 'white' ? '♘' : '♞'}
                    </span>
                    Конь
                  </button>
                </div>
              </div>
            </div>
          )}

          <ChessBoard
            board={board}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            isInCheck={isInCheck}
            showEndGameModal={showEndGameModal}
            onSquareClick={handleSquareClick}
          />

          {/* Индикация просмотра истории */}
          {gameHistory.moves.length > 0 && gameHistory.currentMoveIndex !== gameHistory.moves.length - 1 && (
            <div className="text-center bg-blue-100 border border-blue-300 rounded-lg p-3 max-w-md">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Icon name="Clock" size={16} />
                <span className="font-semibold">Просмотр истории</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Перейдите к последнему ходу, чтобы продолжить игру
              </p>
            </div>
          )}

          {/* Инструкция */}
          {(gameHistory.moves.length === 0 || gameHistory.currentMoveIndex === gameHistory.moves.length - 1) && (
            <div className="text-center text-sm text-gray-600 max-w-md">
              <p>Кликните на фигуру чтобы выбрать её, затем кликните на подсвеченную клетку чтобы сделать ход.</p>
            </div>
          )}
        </div>
        )}

        {/* Правая панель с таймерами и историей - показывается только если игра начата */}
        {gameStarted && (
          <div className="w-full lg:w-80 flex flex-col" style={{height: '640px'}}>
          
          {/* Таймер черных (сверху) */}
          <div className={`bg-white rounded-2xl shadow-2xl p-4 mb-4 border-2 ${currentPlayer === 'black' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                {gameMode === 'human-vs-ai' ? '🤖 Компьютер' : 'Черные'}
                {gameMode === 'human-vs-ai' && isAiThinking && (
                  <span className="ml-2 text-blue-600 animate-pulse">думает...</span>
                )}
              </div>
              <div className={`text-xl font-mono font-bold ${timers.black < 60 ? 'text-red-600' : 'text-black'}`}>
                {Math.floor(timers.black / 60)}:{(timers.black % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
          
          <MoveHistory
            gameHistory={gameHistory}
            onGoToMove={goToMove}
          />
          
          {/* Таймер белых (снизу) */}
          <div className={`bg-white rounded-2xl shadow-2xl p-4 border-2 ${currentPlayer === 'white' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Белые</div>
              <div className={`text-xl font-mono font-bold ${timers.white < 60 ? 'text-red-600' : 'text-black'}`}>
                {Math.floor(timers.white / 60)}:{(timers.white % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveChessBoard;