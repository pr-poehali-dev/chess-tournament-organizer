import { useState } from 'react';

interface ChessPiece {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
  symbol: string;
}

interface Position {
  row: number;
  col: number;
}

const InteractiveChessBoard = () => {
  // Инициализация доски
  const initializeBoard = (): (ChessPiece | null)[][] => {
    const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Черные фигуры
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
    
    // Белые фигуры
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
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [isInCheck, setIsInCheck] = useState<{ white: boolean; black: boolean }>({ white: false, black: false });
  const [gameStatus, setGameStatus] = useState<'playing' | 'check' | 'checkmate' | 'stalemate'>('playing');

  // Проверка, является ли клетка светлой
  const isLightSquare = (row: number, col: number): boolean => {
    return (row + col) % 2 === 0;
  };

  // Найти позицию короля
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

  // Проверить, атакована ли клетка противником
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

  // Получить атакующие ходы фигуры (для проверки шаха)
  const getPieceAttackMoves = (board: (ChessPiece | null)[][], row: number, col: number, piece: ChessPiece): Position[] => {
    const moves: Position[] = [];

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        // Пешка атакует только по диагонали
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
            if (board[newRow][newCol]) break; // Остановиться, если встретили фигуру
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

  // Проверить, находится ли король в шахе
  const isKingInCheck = (board: (ChessPiece | null)[][], color: 'white' | 'black'): boolean => {
    const kingPos = findKing(board, color);
    if (!kingPos) return false;

    const enemyColor = color === 'white' ? 'black' : 'white';
    return isSquareAttacked(board, kingPos.row, kingPos.col, enemyColor);
  };

  // Проверить, является ли ход легальным (не оставляет короля под шахом)
  const isMoveLegal = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    // Создаем копию доски и делаем пробный ход
    const testBoard = board.map(row => [...row]);
    const piece = testBoard[fromRow][fromCol];
    if (!piece) return false;

    testBoard[fromRow][fromCol] = null;
    testBoard[toRow][toCol] = piece;

    // Проверяем, не остался ли наш король под шахом
    return !isKingInCheck(testBoard, piece.color);
  };

  // Получить сырые ходы без проверки на легальность (для внутренних проверок)
  const getRawMoves = (row: number, col: number): Position[] => {
    const piece = board[row][col];
    if (!piece) return [];

    const moves: Position[] = [];

    switch (piece.type) {
      case 'pawn':
        return getPawnMoves(row, col, piece);
        
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

  // Получить все возможные ходы для игрока (учитывая шах)
  const getAllPossibleMovesForPlayer = (color: 'white' | 'black'): Array<{from: Position, to: Position}> => {
    const allMoves: Array<{from: Position, to: Position}> = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const rawMoves = getRawMoves(row, col);
          // Фильтруем только легальные ходы
          const legalMoves = rawMoves.filter(move => isMoveLegal(row, col, move.row, move.col));
          legalMoves.forEach(move => {
            allMoves.push({
              from: { row, col },
              to: move
            });
          });
        }
      }
    }
    
    return allMoves;
  };

  // Проверка возможных ходов для пешки
  const getPawnMoves = (row: number, col: number, piece: ChessPiece): Position[] => {
    const moves: Position[] = [];
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;

    // Ход вперед
    if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
      moves.push({ row: row + direction, col });
      
      // Двойной ход с начальной позиции
      if (row === startRow && !board[row + 2 * direction][col]) {
        moves.push({ row: row + 2 * direction, col });
      }
    }

    // Взятие по диагонали
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

    return moves;
  };

  // Получить возможные ходы для фигуры
  const getPossibleMoves = (row: number, col: number): Position[] => {
    const rawMoves = getRawMoves(row, col);
    // Фильтруем только легальные ходы (не оставляющие короля под шахом)
    return rawMoves.filter(move => isMoveLegal(row, col, move.row, move.col));
  };

  // Обработка клика по клетке
  const handleSquareClick = (row: number, col: number) => {
    // Блокируем ходы при мате или пате
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate') {
      return;
    }
    
    const piece = board[row][col];

    // Если выбрана фигура и кликаем на возможный ход
    if (selectedSquare && possibleMoves.some(move => move.row === row && move.col === col)) {
      // Выполнить ход
      const newBoard = board.map(r => [...r]);
      const movingPiece = newBoard[selectedSquare.row][selectedSquare.col];
      newBoard[selectedSquare.row][selectedSquare.col] = null;
      newBoard[row][col] = movingPiece;

      // Проверяем шах после хода
      const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
      const isNextPlayerInCheck = isKingInCheck(newBoard, nextPlayer);
      
      setBoard(newBoard);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setCurrentPlayer(nextPlayer);
      
      // Проверяем, есть ли у следующего игрока легальные ходы
      const nextPlayerMoves = getAllPossibleMovesForPlayer(nextPlayer);
      
      // Обновляем статус игры
      if (isNextPlayerInCheck) {
        if (nextPlayerMoves.length === 0) {
          setGameStatus('checkmate');
        } else {
          setGameStatus('check');
        }
        setIsInCheck({
          white: nextPlayer === 'white',
          black: nextPlayer === 'black'
        });
      } else {
        if (nextPlayerMoves.length === 0) {
          setGameStatus('stalemate');
        } else {
          setGameStatus('playing');
        }
        setIsInCheck({ white: false, black: false });
      }
      
      return;
    }

    // Если кликаем на свою фигуру
    if (piece && piece.color === currentPlayer) {
      setSelectedSquare({ row, col });
      setPossibleMoves(getPossibleMoves(row, col));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  // Проверка, является ли клетка выделенной
  const isSquareSelected = (row: number, col: number): boolean => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  // Проверка, является ли клетка возможным ходом
  const isPossibleMove = (row: number, col: number): boolean => {
    return possibleMoves.some(move => move.row === row && move.col === col);
  };

  // Сброс игры
  const resetGame = () => {
    setBoard(initializeBoard());
    setSelectedSquare(null);
    setPossibleMoves([]);
    setCurrentPlayer('white');
    setIsInCheck({ white: false, black: false });
    setGameStatus('playing');
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Всплывающее окно с результатом игры */}
      {(gameStatus === 'checkmate' || gameStatus === 'stalemate') && (
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
                onClick={resetGame}
                className="w-full px-6 py-3 bg-primary hover:bg-gold-600 text-black rounded-lg font-bold text-lg transition-colors"
              >
                Играть снова
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Информация о игре */}
      <div className="text-center">
        <h3 className="text-2xl font-heading font-bold mb-2">Интерактивные шахматы</h3>
        
        {/* Статус игры */}
        {gameStatus === 'check' && (
          <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 font-semibold">
              ⚠️ ШАХ! Король {currentPlayer === 'white' ? 'белых' : 'черных'} под угрозой!
            </p>
          </div>
        )}
        
        {gameStatus === 'checkmate' && (
          <div className="mb-3 p-3 bg-red-200 border border-red-400 rounded-lg">
            <p className="text-red-800 font-bold text-lg">
              🏁 МАТ! {currentPlayer === 'white' ? 'Черные' : 'Белые'} победили!
            </p>
          </div>
        )}
        
        {gameStatus === 'stalemate' && (
          <div className="mb-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-800 font-bold text-lg">
              🤝 ПАТ! Ничья!
            </p>
          </div>
        )}
        
        {(gameStatus === 'checkmate' || gameStatus === 'stalemate') ? null : (
          <p className="text-lg font-body">
            Ход: <span className={`font-semibold ${gameStatus === 'check' ? 'text-red-600' : 'text-primary'}`}>
              {currentPlayer === 'white' ? 'Белых' : 'Черных'}
            </span>
          </p>
        )}
        
        <button
          onClick={resetGame}
          className="mt-2 px-4 py-2 bg-primary hover:bg-gold-600 text-black rounded-lg font-medium transition-colors"
        >
          Новая игра
        </button>
      </div>

      {/* Шахматная доска */}
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <div className="grid grid-cols-8 gap-0 border-2 border-gray-800">
          {Array.from({ length: 64 }, (_, i) => {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const piece = board[row][col];
            const isLight = isLightSquare(row, col);
            const isSelected = isSquareSelected(row, col);
            const isPossible = isPossibleMove(row, col);
            const isKingInCheckSquare = piece && piece.type === 'king' && 
              ((piece.color === 'white' && isInCheck.white) || (piece.color === 'black' && isInCheck.black));

            return (
              <div
                key={i}
                onClick={() => handleSquareClick(row, col)}
                className={`
                  aspect-square w-16 h-16 flex items-center justify-center text-4xl font-bold cursor-pointer
                  transition-all duration-200 relative
                  ${isLight ? 'bg-chess-light' : 'bg-chess-dark'}
                  ${isSelected ? 'ring-4 ring-primary ring-inset' : ''}
                  ${isPossible ? 'ring-2 ring-green-500 ring-inset' : ''}
                  ${isKingInCheckSquare ? 'ring-4 ring-red-500 ring-inset bg-red-100' : ''}
                  hover:brightness-110
                `}
              >
                {piece && (
                  <span 
                    className={`${
                      piece.color === 'black' ? 'text-black' : 'text-white'
                    } drop-shadow-lg transition-transform hover:scale-110`}
                    style={{
                      textShadow: piece.color === 'black' 
                        ? '1px 1px 2px rgba(255,255,255,0.3)' 
                        : '1px 1px 2px rgba(0,0,0,0.8)'
                    }}
                  >
                    {piece.symbol}
                  </span>
                )}
                
                {/* Индикатор возможного хода */}
                {isPossible && !piece && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full opacity-70"></div>
                  </div>
                )}
                
                {/* Индикатор возможного взятия */}
                {isPossible && piece && (
                  <div className="absolute inset-0 ring-2 ring-red-500 ring-inset rounded"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Инструкция */}
      <div className="text-center text-sm text-gray-600 max-w-md">
        <p>Кликните на фигуру чтобы выбрать её, затем кликните на подсвеченную клетку чтобы сделать ход.</p>
      </div>
    </div>
  );
};

export default InteractiveChessBoard;