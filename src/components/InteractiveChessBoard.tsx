import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface ChessPiece {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
  symbol: string;
}

interface Position {
  row: number;
  col: number;
}

interface GameMove {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece: ChessPiece | null;
  notation: string;
  boardAfterMove: (ChessPiece | null)[][];
}

interface GameHistory {
  moves: GameMove[];
  currentMoveIndex: number;
}

const InteractiveChessBoard = () => {
  // Состояние для отслеживания возможности рокировки
  const [castlingRights, setCastlingRights] = useState({
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
  });

  // Состояние для превращения пешки
  const [pawnPromotion, setPawnPromotion] = useState<{
    position: Position;
    color: 'white' | 'black';
  } | null>(null);

  // Таймеры игроков (в секундах)
  const [timers, setTimers] = useState({ white: 600, black: 600 }); // 10 минут
  const [timerActive, setTimerActive] = useState(false);
  
  // История игры
  const [gameHistory, setGameHistory] = useState<GameHistory>({
    moves: [],
    currentMoveIndex: -1
  });
  
  // Номер хода
  const [moveNumber, setMoveNumber] = useState(1);

  // Компонент для отображения фигуры
  const PieceComponent = ({ piece }: { piece: ChessPiece }) => {
    if (piece.color === 'black') {
      const blackPieceImages = {
        king: 'https://cdn.poehali.dev/files/fe54b442-0d50-4c62-9a3a-9162fe8ff9be.png',
        queen: 'https://cdn.poehali.dev/files/34a80d57-c305-4b04-a070-59ec331610e3.png',
        rook: 'https://cdn.poehali.dev/files/b16c7ce5-1bad-42e7-9ea1-956848e58cfa.png',
        bishop: 'https://cdn.poehali.dev/files/1f78a355-4edb-4b25-b35e-77e5f1a1c8eb.png',
        knight: 'https://cdn.poehali.dev/files/bca5e378-708d-4a2f-873b-30fc7a6939ea.png',
        pawn: 'https://cdn.poehali.dev/files/74183975-8697-42ab-b6b4-a44e37f2dd1c.png'
      };
      
      const imageUrl = blackPieceImages[piece.type];
      
      return (
        <img 
          src={imageUrl} 
          alt={`Черный ${piece.type}`}
          className="object-contain drop-shadow-lg transition-transform hover:scale-110"
          style={{
            width: '54px',
            height: '54px',
            filter: 'drop-shadow(1px 1px 2px rgba(255,255,255,0.3))'
          }}
        />
      );
    } else {
      // Белые фигуры остаются символами
      return (
        <span 
          className="text-white text-4xl drop-shadow-lg transition-transform hover:scale-110"
          style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}
        >
          {piece.symbol}
        </span>
      );
    }
  };

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

  // Эффект для работы таймеров
  useEffect(() => {
    if (!timerActive || gameStatus === 'checkmate' || gameStatus === 'stalemate') return;

    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = {
          ...prev,
          [currentPlayer]: Math.max(0, prev[currentPlayer] - 1)
        };
        
        // Проверяем окончание времени
        if (newTimers[currentPlayer] === 0) {
          setGameStatus('checkmate');
          setTimerActive(false);
        }
        
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, currentPlayer, gameStatus]);

  // Функция для форматирования времени
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Функция для конвертации позиции в шахматную нотацию
  const positionToNotation = (pos: Position): string => {
    const files = 'abcdefgh';
    return files[pos.col] + (8 - pos.row);
  };

  // Функция для создания записи хода
  const createMoveNotation = (
    piece: ChessPiece, 
    from: Position, 
    to: Position, 
    capturedPiece: ChessPiece | null,
    isCheck: boolean,
    isCheckmate: boolean
  ): string => {
    let notation = '';
    
    // Тип фигуры (кроме пешки)
    if (piece.type !== 'pawn') {
      const pieceSymbols = {
        king: 'K', queen: 'Q', rook: 'R', 
        bishop: 'B', knight: 'N'
      };
      notation += pieceSymbols[piece.type as keyof typeof pieceSymbols];
    }
    
    // Взятие
    if (capturedPiece) {
      if (piece.type === 'pawn') {
        notation += positionToNotation(from)[0]; // файл пешки
      }
      notation += 'x';
    }
    
    // Конечная позиция
    notation += positionToNotation(to);
    
    // Шах или мат
    if (isCheckmate) {
      notation += '#';
    } else if (isCheck) {
      notation += '+';
    }
    
    return notation;
  };

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

  // Получить сырые ходы для фигуры на указанной доске
  const getRawMovesOnBoard = (board: (ChessPiece | null)[][], row: number, col: number): Position[] => {
    const piece = board[row][col];
    if (!piece) return [];

    const moves: Position[] = [];

    switch (piece.type) {
      case 'pawn':
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
        
        // Рокировка (только если король на начальной позиции)
        if ((piece.color === 'white' && row === 7 && col === 4) || 
            (piece.color === 'black' && row === 0 && col === 4)) {
          // Короткая рокировка
          if (canCastle(piece.color, 'king')) {
            moves.push({ row, col: 6 });
          }
          // Длинная рокировка  
          if (canCastle(piece.color, 'queen')) {
            moves.push({ row, col: 2 });
          }
        }
        break;
    }

    return moves;
  };

  // Проверить возможность рокировки
  const canCastle = (color: 'white' | 'black', side: 'king' | 'queen'): boolean => {
    const row = color === 'white' ? 7 : 0;
    const kingCol = 4;
    const rookCol = side === 'king' ? 7 : 0;
    
    // Проверяем права на рокировку
    const rights = side === 'king' 
      ? (color === 'white' ? castlingRights.whiteKingSide : castlingRights.blackKingSide)
      : (color === 'white' ? castlingRights.whiteQueenSide : castlingRights.blackQueenSide);
    
    if (!rights) return false;
    
    // Проверяем, что король и ладья на месте
    const king = board[row][kingCol];
    const rook = board[row][rookCol];
    
    if (!king || king.type !== 'king' || king.color !== color) return false;
    if (!rook || rook.type !== 'rook' || rook.color !== color) return false;
    
    // Проверяем, что между королем и ладьей нет фигур
    const start = Math.min(kingCol, rookCol) + 1;
    const end = Math.max(kingCol, rookCol);
    
    for (let col = start; col < end; col++) {
      if (board[row][col]) return false;
    }
    
    // Проверяем, что король не под шахом
    if (isKingInCheck(board, color)) return false;
    
    // Проверяем, что король не проходит через битое поле
    const kingDirection = side === 'king' ? 1 : -1;
    for (let i = 1; i <= 2; i++) {
      const testCol = kingCol + kingDirection * i;
      if (testCol >= 0 && testCol < 8) {
        const testBoard = board.map(row => [...row]);
        testBoard[row][kingCol] = null;
        testBoard[row][testCol] = king;
        
        if (isKingInCheck(testBoard, color)) return false;
      }
    }
    
    return true;
  };

  // Выполнить рокировку
  const performCastle = (color: 'white' | 'black', side: 'king' | 'queen'): (ChessPiece | null)[][] => {
    const newBoard = board.map(row => [...row]);
    const row = color === 'white' ? 7 : 0;
    const kingCol = 4;
    const rookCol = side === 'king' ? 7 : 0;
    const newKingCol = side === 'king' ? 6 : 2;
    const newRookCol = side === 'king' ? 5 : 3;
    
    const king = newBoard[row][kingCol];
    const rook = newBoard[row][rookCol];
    
    // Перемещаем короля и ладью
    newBoard[row][kingCol] = null;
    newBoard[row][rookCol] = null;
    newBoard[row][newKingCol] = king;
    newBoard[row][newRookCol] = rook;
    
    return newBoard;
  };

  // Проверить легальность хода на указанной доске
  const isMoveLegalOnBoard = (board: (ChessPiece | null)[][], fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const testBoard = board.map(row => [...row]);
    const piece = testBoard[fromRow][fromCol];
    if (!piece) return false;

    testBoard[fromRow][fromCol] = null;
    testBoard[toRow][toCol] = piece;

    return !isKingInCheck(testBoard, piece.color);
  };

  // Получить все возможные ходы для игрока на указанной доске
  const getAllPossibleMovesForPlayerOnBoard = (board: (ChessPiece | null)[][], color: 'white' | 'black'): Array<{from: Position, to: Position}> => {
    const allMoves: Array<{from: Position, to: Position}> = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const rawMoves = getRawMovesOnBoard(board, row, col);
          const legalMoves = rawMoves.filter(move => isMoveLegalOnBoard(board, row, col, move.row, move.col));
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

  // Получить все возможные ходы для игрока (учитывая шах)
  const getAllPossibleMovesForPlayer = (color: 'white' | 'black'): Array<{from: Position, to: Position}> => {
    return getAllPossibleMovesForPlayerOnBoard(board, color);
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
      const movingPiece = board[selectedSquare.row][selectedSquare.col];
      let newBoard = board.map(r => [...r]);
      
      // Проверяем рокировку
      if (movingPiece?.type === 'king' && Math.abs(col - selectedSquare.col) === 2) {
        // Это рокировка
        const side = col > selectedSquare.col ? 'king' : 'queen';
        newBoard = performCastle(currentPlayer, side);
        
        // Обновляем права на рокировку
        const newCastlingRights = {...castlingRights};
        if (currentPlayer === 'white') {
          newCastlingRights.whiteKingSide = false;
          newCastlingRights.whiteQueenSide = false;
        } else {
          newCastlingRights.blackKingSide = false;
          newCastlingRights.blackQueenSide = false;
        }
        setCastlingRights(newCastlingRights);
      } else {
        // Обычный ход
        newBoard[selectedSquare.row][selectedSquare.col] = null;
        newBoard[row][col] = movingPiece;
        
        // Обновляем права на рокировку при движении короля или ладьи
        if (movingPiece?.type === 'king' || movingPiece?.type === 'rook') {
          const newCastlingRights = {...castlingRights};
          
          if (movingPiece.type === 'king') {
            if (movingPiece.color === 'white') {
              newCastlingRights.whiteKingSide = false;
              newCastlingRights.whiteQueenSide = false;
            } else {
              newCastlingRights.blackKingSide = false;
              newCastlingRights.blackQueenSide = false;
            }
          } else if (movingPiece.type === 'rook') {
            // Проверяем какая ладья двигается
            if (movingPiece.color === 'white' && selectedSquare.row === 7) {
              if (selectedSquare.col === 0) newCastlingRights.whiteQueenSide = false;
              if (selectedSquare.col === 7) newCastlingRights.whiteKingSide = false;
            } else if (movingPiece.color === 'black' && selectedSquare.row === 0) {
              if (selectedSquare.col === 0) newCastlingRights.blackQueenSide = false;
              if (selectedSquare.col === 7) newCastlingRights.blackKingSide = false;
            }
          }
          
          setCastlingRights(newCastlingRights);
        }
        
        // Проверяем превращение пешки
        if (movingPiece?.type === 'pawn' && 
            ((movingPiece.color === 'white' && row === 0) || 
             (movingPiece.color === 'black' && row === 7))) {
          // Открываем окно выбора фигуры для превращения
          setPawnPromotion({
            position: { row, col },
            color: movingPiece.color
          });
          // Пока не показываем результат хода - ждем выбора фигуры
          setBoard(newBoard);
          setSelectedSquare(null);
          setPossibleMoves([]);
          return;
        }
      }

      // Проверяем шах после хода
      const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
      const isNextPlayerInCheck = isKingInCheck(newBoard, nextPlayer);
      
      // Проверяем, есть ли у следующего игрока легальные ходы (используем новую доску)
      const nextPlayerMoves = getAllPossibleMovesForPlayerOnBoard(newBoard, nextPlayer);
      
      // Создаем запись хода
      if (movingPiece) {
        const capturedPiece = board[row][col];
        const isCheckmate = isNextPlayerInCheck && nextPlayerMoves.length === 0;
        const notation = createMoveNotation(movingPiece, selectedSquare, { row, col }, capturedPiece, isNextPlayerInCheck, isCheckmate);
        
        const newMove: GameMove = {
          from: selectedSquare,
          to: { row, col },
          piece: movingPiece,
          capturedPiece,
          notation,
          boardAfterMove: newBoard.map(r => [...r])
        };
        
        // Добавляем ход в историю
        setGameHistory(prev => {
          const newHistory = {
            moves: [...prev.moves.slice(0, prev.currentMoveIndex + 1), newMove],
            currentMoveIndex: prev.currentMoveIndex + 1
          };
          return newHistory;
        });
        
        // Увеличиваем номер хода для белых
        if (currentPlayer === 'black') {
          setMoveNumber(prev => prev + 1);
        }
        
        // Запускаем таймер после первого хода
        if (!timerActive) {
          setTimerActive(true);
        }
      }
      
      setBoard(newBoard);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setCurrentPlayer(nextPlayer);
      
      // Обновляем статус игры
      if (isNextPlayerInCheck) {
        if (nextPlayerMoves.length === 0) {
          console.log('Checkmate detected! Player:', nextPlayer, 'Moves:', nextPlayerMoves.length);
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
          console.log('Stalemate detected! Player:', nextPlayer, 'Moves:', nextPlayerMoves.length);
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

  // Завершить превращение пешки
  const completePawnPromotion = (pieceType: 'queen' | 'rook' | 'bishop' | 'knight') => {
    if (!pawnPromotion) return;
    
    const newBoard = board.map(row => [...row]);
    const symbols = {
      queen: pawnPromotion.color === 'white' ? '♕' : '♛',
      rook: pawnPromotion.color === 'white' ? '♖' : '♜', 
      bishop: pawnPromotion.color === 'white' ? '♗' : '♝',
      knight: pawnPromotion.color === 'white' ? '♘' : '♞'
    };
    
    newBoard[pawnPromotion.position.row][pawnPromotion.position.col] = {
      type: pieceType,
      color: pawnPromotion.color,
      symbol: symbols[pieceType]
    };
    
    // Проверяем шах после превращения
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
    const isNextPlayerInCheck = isKingInCheck(newBoard, nextPlayer);
    
    // Проверяем, есть ли у следующего игрока легальные ходы
    const nextPlayerMoves = getAllPossibleMovesForPlayerOnBoard(newBoard, nextPlayer);
    
    setBoard(newBoard);
    setCurrentPlayer(nextPlayer);
    setPawnPromotion(null);
    
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
  };

  // Функция для перехода к определенному ходу
  const goToMove = (moveIndex: number) => {
    if (moveIndex < 0) {
      // Возвращаемся к начальной позиции
      setBoard(initializeBoard());
      setCurrentPlayer('white');
      setGameHistory(prev => ({ ...prev, currentMoveIndex: -1 }));
      setMoveNumber(1);
    } else if (moveIndex < gameHistory.moves.length) {
      const targetMove = gameHistory.moves[moveIndex];
      setBoard(targetMove.boardAfterMove.map(r => [...r]));
      setCurrentPlayer(moveIndex % 2 === 0 ? 'black' : 'white');
      setGameHistory(prev => ({ ...prev, currentMoveIndex: moveIndex }));
      setMoveNumber(Math.floor(moveIndex / 2) + 1);
    }
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  // Сброс игры
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
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-8 p-4">
      {/* Основная игровая область */}
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

      {/* Модальное окно превращения пешки */}
      {pawnPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center border-4 border-primary">
            <div className="mb-6">
              <div className="text-6xl mb-4">👑</div>
              <h2 className="text-3xl font-bold text-primary mb-2">ПРЕВРАЩЕНИЕ!</h2>
              <p className="text-xl text-gray-700">
                Выберите фигуру для превращения пешки
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => completePawnPromotion('queen')}
                className="flex flex-col items-center p-4 bg-primary hover:bg-gold-600 text-black rounded-lg font-bold text-lg transition-colors"
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

      {/* Таймеры игроков */}
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <div className={`p-4 rounded-lg border-2 ${currentPlayer === 'black' ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Черные</div>
            <div className={`text-2xl font-mono font-bold ${timers.black < 60 ? 'text-red-600' : 'text-black'}`}>
              {formatTime(timers.black)}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center mx-4">
          <div className="text-lg font-semibold">Ход {moveNumber}</div>
          <div className="text-sm text-gray-600">
            {gameHistory.moves.length} ходов
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border-2 ${currentPlayer === 'white' ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Белые</div>
            <div className={`text-2xl font-mono font-bold ${timers.white < 60 ? 'text-red-600' : 'text-black'}`}>
              {formatTime(timers.white)}
            </div>
          </div>
        </div>
      </div>

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
                {piece && <PieceComponent piece={piece} />}
                
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

    {/* Панель истории ходов */}
    <div className="w-full lg:w-80 bg-white rounded-2xl shadow-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-heading font-bold">История партии</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToMove(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="К началу"
          >
            <Icon name="ChevronsLeft" size={16} />
          </button>
          <button
            onClick={() => goToMove(Math.max(-1, gameHistory.currentMoveIndex - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Предыдущий ход"
          >
            <Icon name="ChevronLeft" size={16} />
          </button>
          <button
            onClick={() => goToMove(Math.min(gameHistory.moves.length - 1, gameHistory.currentMoveIndex + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Следующий ход"
          >
            <Icon name="ChevronRight" size={16} />
          </button>
          <button
            onClick={() => goToMove(gameHistory.moves.length - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="К концу"
          >
            <Icon name="ChevronsRight" size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {gameHistory.moves.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <Icon name="Clock" size={48} className="mx-auto mb-2 opacity-50" />
            <p>Партия еще не началась</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Кнопка для начальной позиции */}
            <button
              onClick={() => goToMove(-1)}
              className={`w-full text-left p-2 rounded-lg transition-colors ${
                gameHistory.currentMoveIndex === -1 
                  ? 'bg-primary text-black font-semibold' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-sm text-gray-600">Начальная позиция</span>
            </button>

            {/* Список ходов */}
            {gameHistory.moves.map((move, index) => {
              const moveNum = Math.floor(index / 2) + 1;
              const isWhiteMove = index % 2 === 0;
              const isCurrentMove = index === gameHistory.currentMoveIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => goToMove(index)}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    isCurrentMove 
                      ? 'bg-primary text-black font-semibold' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>
                      {isWhiteMove && `${moveNum}. `}
                      {!isWhiteMove && moveNum === 1 && '1... '}
                      {!isWhiteMove && moveNum > 1 && ''}
                      {move.notation}
                    </span>
                    <span className="text-xs text-gray-500">
                      {positionToNotation(move.from)}-{positionToNotation(move.to)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default InteractiveChessBoard;