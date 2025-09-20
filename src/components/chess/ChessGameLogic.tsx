import { ChessPiece, Position, GameMove } from './types';

export class ChessGameLogic {
  // Поиск короля на доске
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

  // Функция для проверки трёхкратного повторения позиции
  static checkThreefoldRepetition(newBoard: (ChessPiece | null)[][], currentHistory: GameMove[]): { isRepetition: boolean; moveNumber?: number; totalMoves?: number } {
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

  static isKingInCheck(board: (ChessPiece | null)[][], color: 'white' | 'black'): boolean {
    const kingPos = this.findKing(board, color);
    if (!kingPos) return false;

    const enemyColor = color === 'white' ? 'black' : 'white';
    return this.isSquareAttacked(board, kingPos.row, kingPos.col, enemyColor);
  }

  static isMoveLegal(board: (ChessPiece | null)[][], fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const testBoard = board.map(row => [...row]);
    const piece = testBoard[fromRow][fromCol];
    if (!piece) return false;

    testBoard[fromRow][fromCol] = null;
    testBoard[toRow][toCol] = piece;

    return !this.isKingInCheck(testBoard, piece.color);
  }

  static getRawMoves(board: (ChessPiece | null)[][], row: number, col: number, gameHistory: { moves: GameMove[] }, castlingRights: any): Position[] {
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
        if (!this.isKingInCheck(board, piece.color)) {
          const kingRow = piece.color === 'white' ? 7 : 0;
          
          // Короткая рокировка (король на e1->g1 или e8->g8)
          if (piece.color === 'white' && castlingRights.whiteKingSide || 
              piece.color === 'black' && castlingRights.blackKingSide) {
            if (row === kingRow && col === 4 && // Король на начальной позиции
                !board[kingRow][5] && !board[kingRow][6] && // Поля f и g свободны
                board[kingRow][7]?.type === 'rook' && board[kingRow][7]?.color === piece.color && // Ладья на h
                !this.isSquareAttacked(board, kingRow, 5, piece.color === 'white' ? 'black' : 'white') && // f не под боем
                !this.isSquareAttacked(board, kingRow, 6, piece.color === 'white' ? 'black' : 'white')) { // g не под боем
              moves.push({ row: kingRow, col: 6 }); // Короткая рокировка
            }
          }
          
          // Длинная рокировка (король на e1->c1 или e8->c8)
          if (piece.color === 'white' && castlingRights.whiteQueenSide || 
              piece.color === 'black' && castlingRights.blackQueenSide) {
            if (row === kingRow && col === 4 && // Король на начальной позиции
                !board[kingRow][3] && !board[kingRow][2] && !board[kingRow][1] && // Поля d, c, b свободны
                board[kingRow][0]?.type === 'rook' && board[kingRow][0]?.color === piece.color && // Ладья на a
                !this.isSquareAttacked(board, kingRow, 3, piece.color === 'white' ? 'black' : 'white') && // d не под боем
                !this.isSquareAttacked(board, kingRow, 2, piece.color === 'white' ? 'black' : 'white')) { // c не под боем
              moves.push({ row: kingRow, col: 2 }); // Длинная рокировка
            }
          }
        }
        break;
    }

    return moves;
  }

  static getPossibleMoves(board: (ChessPiece | null)[][], row: number, col: number, gameHistory: { moves: GameMove[] }, castlingRights: any): Position[] {
    const rawMoves = this.getRawMoves(board, row, col, gameHistory, castlingRights);
    return rawMoves.filter(move => this.isMoveLegal(board, row, col, move.row, move.col));
  }

  static createMoveNotation(piece: ChessPiece, from: Position, to: Position, capturedPiece: ChessPiece | null): string {
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
  }
}