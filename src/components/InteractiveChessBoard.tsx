import { useEffect, useState } from 'react';
import { useChessGame } from './chess/hooks/useChessGame';
import ChessBoard from './chess/ChessBoard';
import GameModeSelector from './chess/GameModeSelector';
import MoveHistory from './chess/MoveHistory';
import GameEndModals from './chess/GameEndModals';
import GameControls from './chess/GameControls';
import { useAIGameLogic } from './chess/AIGameLogic';
import { ChessGameLogic } from './chess/ChessGameLogic';
import { ChessAI } from './chess/ai/chessAI';
import { ChessPiece, Position, GameMove } from './chess/types';

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

  // Используем хук для ИИ логики
  useAIGameLogic({
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
  });

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
          notation = ChessGameLogic.createMoveNotation(movingPiece, selectedSquare, { row, col }, actualCapturedPiece);
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
        const isCheck = ChessGameLogic.isKingInCheck(newBoard, nextPlayer);
        setIsInCheck(prev => ({
          ...prev,
          [nextPlayer]: isCheck
        }));
        
        // Проверяем трёхкратное повторение позиции
        const repetitionCheck = ChessGameLogic.checkThreefoldRepetition(newBoard, [...gameHistory.moves.slice(0, gameHistory.currentMoveIndex + 1)]);
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
      setPossibleMoves(ChessGameLogic.getPossibleMoves(board, row, col, gameHistory, castlingRights));
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
        
        <GameControls
          gameStarted={gameStarted}
          gameHistory={gameHistory}
          onShowModeSelector={() => setShowModeSelector(true)}
        />
        
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
          
          <GameEndModals
            gameStatus={gameStatus}
            showEndGameModal={showEndGameModal}
            currentPlayer={currentPlayer}
            gameMode={gameMode}
            gameHistory={gameHistory}
            timers={timers}
            pawnPromotion={pawnPromotion}
            onCloseEndGameModal={() => setShowEndGameModal(false)}
            onResetGame={resetGame}
            onCompletePawnPromotion={completePawnPromotion}
          />

          <ChessBoard
            board={board}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            isInCheck={isInCheck}
            showEndGameModal={showEndGameModal}
            onSquareClick={handleSquareClick}
          />

          <GameControls
            gameStarted={gameStarted}
            gameHistory={gameHistory}
            onShowModeSelector={() => setShowModeSelector(true)}
          />
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