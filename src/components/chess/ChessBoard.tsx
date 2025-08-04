import ChessPiece from './ChessPiece';
import { ChessPiece as ChessPieceType, Position } from './types';

interface ChessBoardProps {
  board: (ChessPieceType | null)[][];
  selectedSquare: Position | null;
  possibleMoves: Position[];
  isInCheck: { white: boolean; black: boolean };
  showEndGameModal: boolean;
  onSquareClick: (row: number, col: number) => void;
}

const ChessBoard = ({ 
  board, 
  selectedSquare, 
  possibleMoves, 
  isInCheck, 
  showEndGameModal, 
  onSquareClick 
}: ChessBoardProps) => {
  const isLightSquare = (row: number, col: number) =>  (row + col) % 2 === 0;

  const isSquareSelected = (row: number, col: number) =>
    selectedSquare?.row === row && selectedSquare?.col === col;

  const isPossibleMove = (row: number, col: number) =>
    possibleMoves.some(move => move.row === row && move.col === col);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6">
      <div className="grid grid-cols-8 gap-0 border-2 border-gray-800">
        {Array.from({ length: 64 }, (_, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          const piece = board[row][col];
          const isLight = isLightSquare(row, col);
          const isSelected = isSquareSelected(row, col);
          const isPossible = isPossibleMove(row, col);
          const isKingInCheckSquare = piece && piece.type === 'king' && showEndGameModal &&
            ((piece.color === 'white' && isInCheck.white) || (piece.color === 'black' && isInCheck.black));

          return (
            <div
              key={i}
              onClick={() => onSquareClick(row, col)}
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
              {piece && <ChessPiece piece={piece} />}
              
              {isPossible && !piece && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full opacity-70"></div>
                </div>
              )}
              
              {isPossible && piece && (
                <div className="absolute inset-0 ring-2 ring-red-500 ring-inset rounded"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChessBoard;