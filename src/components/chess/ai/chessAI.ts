import { ChessPiece, Position } from '../types';

// Позиционные таблицы для оценки
const pieceSquareTables = {
  pawn: {
    white: [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5,  5, 10, 25, 25, 10,  5,  5],
      [0,  0,  0, 20, 20,  0,  0,  0],
      [5, -5,-10,  0,  0,-10, -5,  5],
      [5, 10, 10,-20,-20, 10, 10,  5],
      [0,  0,  0,  0,  0,  0,  0,  0]
    ],
    black: []
  },
  knight: {
    white: [
      [-50,-40,-30,-30,-30,-30,-40,-50],
      [-40,-20,  0,  0,  0,  0,-20,-40],
      [-30,  0, 10, 15, 15, 10,  0,-30],
      [-30,  5, 15, 20, 20, 15,  5,-30],
      [-30,  0, 15, 20, 20, 15,  0,-30],
      [-30,  5, 10, 15, 15, 10,  5,-30],
      [-40,-20,  0,  5,  5,  0,-20,-40],
      [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    black: []
  },
  bishop: {
    white: [
      [-20,-10,-10,-10,-10,-10,-10,-20],
      [-10,  0,  0,  0,  0,  0,  0,-10],
      [-10,  0,  5, 10, 10,  5,  0,-10],
      [-10,  5,  5, 10, 10,  5,  5,-10],
      [-10,  0, 10, 10, 10, 10,  0,-10],
      [-10, 10, 10, 10, 10, 10, 10,-10],
      [-10,  5,  0,  0,  0,  0,  5,-10],
      [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    black: []
  },
  rook: {
    white: [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [5, 10, 10, 10, 10, 10, 10,  5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [-5,  0,  0,  0,  0,  0,  0, -5],
      [0,  0,  0,  5,  5,  0,  0,  0]
    ],
    black: []
  },
  queen: {
    white: [
      [-20,-10,-10, -5, -5,-10,-10,-20],
      [-10,  0,  0,  0,  0,  0,  0,-10],
      [-10,  0,  5,  5,  5,  5,  0,-10],
      [-5,  0,  5,  5,  5,  5,  0, -5],
      [0,  0,  5,  5,  5,  5,  0, -5],
      [-10,  5,  5,  5,  5,  5,  0,-10],
      [-10,  0,  5,  0,  0,  0,  0,-10],
      [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    black: []
  },
  king: {
    white: [
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-20,-30,-30,-40,-40,-30,-30,-20],
      [-10,-20,-20,-20,-20,-20,-20,-10],
      [20, 20,  0,  0,  0,  0, 20, 20],
      [20, 30, 10,  0,  0, 10, 30, 20]
    ],
    black: []
  }
};

// Инициализация черных таблиц (зеркальное отражение белых)
Object.keys(pieceSquareTables).forEach(pieceType => {
  const whiteTable = pieceSquareTables[pieceType as keyof typeof pieceSquareTables].white;
  pieceSquareTables[pieceType as keyof typeof pieceSquareTables].black = 
    [...whiteTable].reverse().map(row => [...row]);
});

export class ChessAI {
  private static readonly PIECE_VALUES = {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000
  };

  private static readonly MAX_DEPTH = 4;
  private static readonly CHECKMATE_VALUE = 9999;
  private static readonly STALEMATE_VALUE = 0;

  static evaluateBoard(board: (ChessPiece | null)[][]): number {
    let score = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const pieceValue = this.PIECE_VALUES[piece.type];
          const positionValue = pieceSquareTables[piece.type][piece.color][row][col];
          
          const totalValue = pieceValue + positionValue;
          
          if (piece.color === 'white') {
            score += totalValue;
          } else {
            score -= totalValue;
          }
        }
      }
    }

    return score;
  }

  static isKingInCheck(board: (ChessPiece | null)[][], color: 'white' | 'black'): boolean {
    const kingPos = this.findKing(board, color);
    if (!kingPos) return false;

    const enemyColor = color === 'white' ? 'black' : 'white';
    return this.isSquareAttacked(board, kingPos.row, kingPos.col, enemyColor);
  }

  static findKing(board: (ChessPiece | null)[][], color: 'white' | 'black'): Position | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  static isSquareAttacked(board: (ChessPiece | null)[][], targetRow: number, targetCol: number, byColor: 'white' | 'black'): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === byColor) {
          const moves = this.getPieceAttackMoves(board, row, col, piece);
          if (moves.some(move => move.row === targetRow && move.col === targetCol)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  static getPieceAttackMoves(board: (ChessPiece | null)[][], row: number, col: number, piece: ChessPiece): Position[] {
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
  }

  static getRawMoves(board: (ChessPiece | null)[][], row: number, col: number): Position[] {
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
  }

  static isMoveLegal(board: (ChessPiece | null)[][], fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const testBoard = board.map(row => [...row]);
    const piece = testBoard[fromRow][fromCol];
    if (!piece) return false;

    testBoard[fromRow][fromCol] = null;
    testBoard[toRow][toCol] = piece;

    return !this.isKingInCheck(testBoard, piece.color);
  }

  static getPossibleMoves(board: (ChessPiece | null)[][], row: number, col: number): Position[] {
    const rawMoves = this.getRawMoves(board, row, col);
    return rawMoves.filter(move => this.isMoveLegal(board, row, col, move.row, move.col));
  }

  static getAllMoves(board: (ChessPiece | null)[][], color: 'white' | 'black'): Array<{from: Position, to: Position, piece: ChessPiece}> {
    const moves: Array<{from: Position, to: Position, piece: ChessPiece}> = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const possibleMoves = this.getPossibleMoves(board, row, col);
          possibleMoves.forEach(move => {
            moves.push({
              from: { row, col },
              to: move,
              piece
            });
          });
        }
      }
    }
    
    return moves;
  }

  static minimax(
    board: (ChessPiece | null)[][],
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean
  ): number {
    if (depth === 0) {
      return this.evaluateBoard(board);
    }

    const color = maximizingPlayer ? 'white' : 'black';
    const moves = this.getAllMoves(board, color);

    if (moves.length === 0) {
      if (this.isKingInCheck(board, color)) {
        return maximizingPlayer ? -this.CHECKMATE_VALUE : this.CHECKMATE_VALUE;
      } else {
        return this.STALEMATE_VALUE;
      }
    }

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const testBoard = board.map(row => [...row]);
        testBoard[move.from.row][move.from.col] = null;
        testBoard[move.to.row][move.to.col] = move.piece;

        const evaluation = this.minimax(testBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) {
          break; // Альфа-бета отсечение
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const testBoard = board.map(row => [...row]);
        testBoard[move.from.row][move.from.col] = null;
        testBoard[move.to.row][move.to.col] = move.piece;

        const evaluation = this.minimax(testBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) {
          break; // Альфа-бета отсечение
        }
      }
      return minEval;
    }
  }

  static getBestMove(board: (ChessPiece | null)[][], difficulty: 'easy' | 'medium' | 'hard' = 'medium'): {from: Position, to: Position, piece: ChessPiece} | null {
    const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
    const moves = this.getAllMoves(board, 'black');
    
    console.log(`ИИ: найдено ${moves.length} возможных ходов`);
    
    if (moves.length === 0) {
      console.log('ИИ: нет доступных ходов - мат или пат');
      return null;
    }

    // Сортируем ходы для лучшего альфа-бета отсечения
    moves.sort((a, b) => {
      const captureA = board[a.to.row][a.to.col] ? this.PIECE_VALUES[board[a.to.row][a.to.col]!.type] : 0;
      const captureB = board[b.to.row][b.to.col] ? this.PIECE_VALUES[board[b.to.row][b.to.col]!.type] : 0;
      return captureB - captureA;
    });

    let bestMove = moves[0];
    let bestValue = Infinity;

    for (const move of moves) {
      const testBoard = board.map(row => [...row]);
      testBoard[move.from.row][move.from.col] = null;
      testBoard[move.to.row][move.to.col] = move.piece;

      const moveValue = this.minimax(testBoard, depth - 1, -Infinity, Infinity, true);
      
      if (moveValue < bestValue) {
        bestValue = moveValue;
        bestMove = move;
      }
    }

    return bestMove;
  }
}