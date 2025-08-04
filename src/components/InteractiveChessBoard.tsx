import { useEffect } from 'react';
import { useChessGame } from './chess/hooks/useChessGame';
import ChessBoard from './chess/ChessBoard';
import GameModeSelector from './chess/GameModeSelector';
import PlayerTimers from './chess/PlayerTimers';
import MoveHistory from './chess/MoveHistory';
import Icon from '@/components/ui/icon';

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

  // Простые игровые функции (сокращенные версии)
  const handleSquareClick = async (row: number, col: number) => {
    if (isAiThinking || (gameMode === 'human-vs-ai' && currentPlayer === 'black')) return;
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;

    const piece = board[row][col];

    if (selectedSquare && possibleMoves.some(move => move.row === row && move.col === col)) {
      // Выполняем ход (упрощенная версия)
      const movingPiece = board[selectedSquare.row][selectedSquare.col];
      if (movingPiece) {
        const newBoard = board.map(r => [...r]);
        newBoard[selectedSquare.row][selectedSquare.col] = null;
        newBoard[row][col] = movingPiece;
        
        setBoard(newBoard);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        
        // Добавляем в историю (упрощенно)
        const newMove = {
          from: selectedSquare,
          to: { row, col },
          piece: movingPiece,
          capturedPiece: board[row][col],
          notation: `${movingPiece.symbol}${String.fromCharCode(97 + col)}${8 - row}`,
          boardAfterMove: newBoard.map(r => [...r])
        };
        
        setGameHistory(prev => ({
          moves: [...prev.moves.slice(0, prev.currentMoveIndex + 1), newMove],
          currentMoveIndex: prev.currentMoveIndex + 1
        }));
      }
    } else if (piece && piece.color === currentPlayer) {
      // Простая генерация ходов
      const moves = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (!board[r][c] || board[r][c]?.color !== currentPlayer) {
            moves.push({ row: r, col: c });
          }
        }
      }
      
      setSelectedSquare({ row, col });
      setPossibleMoves(moves.slice(0, 8)); // Ограничиваем для простоты
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
          
          <PlayerTimers
            timers={timers}
            currentPlayer={currentPlayer}
            gameMode={gameMode}
            isAiThinking={isAiThinking}
          />
          
          <MoveHistory
            gameHistory={gameHistory}
            onGoToMove={goToMove}
          />
          
          <PlayerTimers
            timers={timers}
            currentPlayer={currentPlayer}
            gameMode={gameMode}
            isAiThinking={isAiThinking}
          />
        </div>
      </div>
    </div>
  );
};

export default InteractiveChessBoard;