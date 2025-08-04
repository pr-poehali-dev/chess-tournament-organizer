import { useEffect } from 'react';
import { useChessGame } from './chess/hooks/useChessGame';
import ChessBoard from './chess/ChessBoard';
import GameModeSelector from './chess/GameModeSelector';
import PlayerTimers from './chess/PlayerTimers';
import MoveHistory from './chess/MoveHistory';
import Icon from '@/components/ui/icon';
import { ChessPiece, Position, GameMove } from './chess/types';

const InteractiveChessBoard = () => {
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

  // ИИ логика
  const makeAiMove = () => {
    setIsAiThinking(true);
    
    setTimeout(() => {
      const allMoves: { from: Position; to: Position; piece: ChessPiece; score: number }[] = [];
      
      // Собираем все возможные ходы для черных
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (piece && piece.color === 'black') {
            const moves = getPossibleMoves(board, row, col);
            moves.forEach(move => {
              // Проверяем что ход действительно легален
              if (isMoveLegal(board, row, col, move.row, move.col)) {
                // Создаем тестовую доску для оценки хода
                const testBoard = board.map(r => [...r]);
                testBoard[row][col] = null;
                testBoard[move.row][move.col] = piece;
                
                let score = 0;
                
                // Высший приоритет: защита от шаха
                const isCurrentlyInCheck = isKingInCheck(board, 'black');
                const willBeInCheck = isKingInCheck(testBoard, 'black');
                
                if (isCurrentlyInCheck && !willBeInCheck) {
                  score += 1000; // Очень высокий приоритет для защиты от шаха
                } else if (isCurrentlyInCheck && willBeInCheck) {
                  score -= 1000; // Избегаем ходов, которые не спасают от шаха
                }
                
                // Бонус за взятие фигур
                const capturedPiece = board[move.row][move.col];
                if (capturedPiece) {
                  const pieceValues = {
                    pawn: 1, knight: 3, bishop: 3, 
                    rook: 5, queen: 9, king: 0
                  };
                  score += pieceValues[capturedPiece.type] * 10;
                }
                
                // Небольшой случайный фактор для разнообразия
                score += Math.random() * 2;
                
                allMoves.push({
                  from: { row, col },
                  to: move,
                  piece,
                  score
                });
              }
            });
          }
        }
      }
      
      if (allMoves.length > 0) {
        // Сортируем ходы по оценке (лучшие первыми)
        allMoves.sort((a, b) => b.score - a.score);
        
        // Выбираем один из 3 лучших ходов для разнообразия
        const topMoves = allMoves.slice(0, Math.min(3, allMoves.length));
        const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
        
        const capturedPiece = board[selectedMove.to.row][selectedMove.to.col];
        const newBoard = board.map(r => [...r]);
        newBoard[selectedMove.from.row][selectedMove.from.col] = null;
        newBoard[selectedMove.to.row][selectedMove.to.col] = selectedMove.piece;
        
        // Проверяем превращение пешки
        if (selectedMove.piece.type === 'pawn' && selectedMove.to.row === 7) {
          newBoard[selectedMove.to.row][selectedMove.to.col] = {
            type: 'queen',
            color: 'black',
            symbol: '♛'
          };
        }
        
        const notation = createMoveNotation(selectedMove.piece, selectedMove.from, selectedMove.to, capturedPiece);
        
        const gameMove: GameMove = {
          from: selectedMove.from,
          to: selectedMove.to,
          piece: selectedMove.piece,
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
        
        // Проверяем шах/мат
        const isCheck = isKingInCheck(newBoard, 'white');
        setIsInCheck(prev => ({
          ...prev,
          white: isCheck
        }));
        
        if (isCheck) {
          setGameStatus('check');
        } else {
          setGameStatus('playing');
        }
      }
      
      setIsAiThinking(false);
    }, 1500); // Задержка для имитации "размышлений"
  };

  // Эффект для ходов ИИ
  useEffect(() => {
    if (gameMode === 'human-vs-ai' && currentPlayer === 'black' && gameStatus === 'playing' && !isAiThinking) {
      makeAiMove();
    }
  }, [currentPlayer, gameMode, gameStatus]);

  // Эффект для автоматического запуска таймера после выбора режима игры
  useEffect(() => {
    if (gameStarted && gameHistory.moves.length === 0) {
      setTimerActive(true);
    }
  }, [gameStarted, gameHistory.moves.length]);

  // Таймеры игроков
  useEffect(() => {
    if (!timerActive || gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = { ...prev };
        if (currentPlayer === 'white') {
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
  }, [timerActive, currentPlayer, gameStatus]);

  const handleSquareClick = (row: number, col: number) => {
    if (isAiThinking || (gameMode === 'human-vs-ai' && currentPlayer === 'black')) return;
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;

    const piece = board[row][col];

    if (selectedSquare && possibleMoves.some(move => move.row === row && move.col === col)) {
      const movingPiece = board[selectedSquare.row][selectedSquare.col];
      if (movingPiece) {
        const capturedPiece = board[row][col];
        const newBoard = board.map(r => [...r]);
        newBoard[selectedSquare.row][selectedSquare.col] = null;
        newBoard[row][col] = movingPiece;
        
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
        
        const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
        const notation = createMoveNotation(movingPiece, selectedSquare, { row, col }, capturedPiece);
        
        const gameMove: GameMove = {
          from: selectedSquare,
          to: { row, col },
          piece: movingPiece,
          capturedPiece,
          notation,
          boardAfterMove: newBoard.map(r => [...r])
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
        
        if (isCheck) {
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
        
        <GameModeSelector
          gameMode={gameMode}
          aiDifficulty={aiDifficulty}
          gameStarted={gameStarted}
          gameHistoryLength={gameHistory.moves.length}
          onGameModeSelect={setGameMode}
          onAiDifficultySelect={setAiDifficulty}
          onStartGame={() => setGameStarted(true)}
        />

        {/* Основная игровая область */}
        <div className="flex flex-col items-center space-y-6">
          
          {/* Всплывающее окно с результатом игры */}
          {(gameStatus === 'checkmate' || gameStatus === 'stalemate') && showEndGameModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center border-4 border-primary">
                <div className="mb-6">
                  {gameStatus === 'checkmate' ? (
                    <>
                      <div className="text-6xl mb-4">🏆</div>
                      <h2 className="text-3xl font-bold text-primary mb-2">ПОБЕДА!</h2>
                      <p className="text-xl text-gray-700">
                        Выиграли <span className="font-bold text-primary">
                          {currentPlayer === 'white' ? 'Черные' : 'Белые'}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500 mt-2">Мат</p>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">🤝</div>
                      <h2 className="text-3xl font-bold text-primary mb-2">НИЧЬЯ!</h2>
                      <p className="text-xl text-gray-700">
                        Пат - нет доступных ходов
                      </p>
                    </>
                  )}
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setShowEndGameModal(false)}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors"
                  >
                    🔍 Анализировать партию
                  </button>
                  <button
                    onClick={resetGame}
                    className="w-full px-6 py-3 bg-primary hover:bg-gold-600 text-black rounded-lg font-bold text-lg transition-colors"
                  >
                    Играть снова
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

          {/* Инструкция */}
          <div className="text-center text-sm text-gray-600 max-w-md">
            <p>Кликните на фигуру чтобы выбрать её, затем кликните на подсвеченную клетку чтобы сделать ход.</p>
          </div>
        </div>

        {/* Правая панель с таймерами и историей */}
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
      </div>
    </div>
  );
};

export default InteractiveChessBoard;