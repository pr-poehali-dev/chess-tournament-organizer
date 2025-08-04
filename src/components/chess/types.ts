export interface ChessPiece {
  type: 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  color: 'white' | 'black';
  symbol: string;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameMove {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece: ChessPiece | null;
  notation: string;
  boardAfterMove: (ChessPiece | null)[][];
  isEnPassant?: boolean;
  isPawnDoubleMove?: boolean;
}

export interface GameHistory {
  moves: GameMove[];
  currentMoveIndex: number;
}

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

export interface PawnPromotion {
  position: Position;
  color: 'white' | 'black';
}

export type GameMode = 'human-vs-human' | 'human-vs-ai';
export type AiDifficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';