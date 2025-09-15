import ChessPiece from './ChessPiece';
import { ChessPiece as ChessPieceType, Position } from './types';
import { useState } from 'react';

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
  const [draggedPiece, setDraggedPiece] = useState<{piece: ChessPieceType, from: Position} | null>(null);
  const [dragOverSquare, setDragOverSquare] = useState<Position | null>(null);
  
  const isLightSquare = (row: number, col: number) =>  (row + col) % 2 === 0;

  const isSquareSelected = (row: number, col: number) =>
    selectedSquare?.row === row && selectedSquare?.col === col;

  const isPossibleMove = (row: number, col: number) =>
    possibleMoves.some(move => move.row === row && move.col === col);

  const handleDragStart = (e: React.DragEvent, piece: ChessPieceType, row: number, col: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedPiece({ piece, from: { row, col } });
    // Автоматически выбираем клетку при начале перетаскивания
    onSquareClick(row, col);
  };

  const handleDragOver = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSquare({ row, col });
  };

  const handleDragLeave = () => {
    setDragOverSquare(null);
  };

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    setDragOverSquare(null);
    
    if (draggedPiece) {
      // Совершаем ход, если это возможный ход
      if (isPossibleMove(row, col)) {
        onSquareClick(row, col);
      }
      setDraggedPiece(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
    setDragOverSquare(null);
  };

  // Буквы для колонок (a-h)
  const columnLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  // Цифры для рядов (8-1, так как ряд 0 это 8-й ряд)
  const rowLabels = ['8', '7', '6', '5', '4', '3', '2', '1'];

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6">
      <div className="relative">
        {/* Верхние буквы колонок */}
        <div className="flex justify-center mb-2">
          <div className="grid grid-cols-8 gap-0 w-fit">
            {columnLabels.map((label, index) => (
              <div key={`top-${index}`} className="w-16 h-6 flex items-center justify-center text-sm font-semibold text-gray-700">
                {label}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center">
          {/* Левые цифры рядов */}
          <div className="flex flex-col mr-2">
            {rowLabels.map((label, index) => (
              <div key={`left-${index}`} className="w-6 h-16 flex items-center justify-center text-sm font-semibold text-gray-700">
                {label}
              </div>
            ))}
          </div>
          
          {/* Шахматная доска */}
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
          const isDragOver = dragOverSquare?.row === row && dragOverSquare?.col === col;
          const isDraggedSquare = draggedPiece?.from.row === row && draggedPiece?.from.col === col;

          return (
            <div
              key={i}
              onClick={() => onSquareClick(row, col)}
              onDragOver={(e) => handleDragOver(e, row, col)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, row, col)}
              className={`
                aspect-square w-16 h-16 flex items-center justify-center text-4xl font-bold cursor-pointer
                transition-all duration-200 relative
                ${isLight ? 'bg-chess-light' : 'bg-chess-dark'}
                ${isSelected ? 'ring-4 ring-primary ring-inset' : ''}
                ${isPossible ? 'ring-2 ring-green-500 ring-inset' : ''}
                ${isKingInCheckSquare ? 'ring-4 ring-red-500 ring-inset bg-red-100' : ''}
                ${isDragOver && isPossible ? 'bg-green-200 ring-2 ring-green-600' : ''}
                ${isDragOver && !isPossible ? 'bg-red-200' : ''}
                ${isDraggedSquare ? 'opacity-50' : ''}
                hover:brightness-110
              `}
            >
              {piece && (
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, piece, row, col)}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <ChessPiece piece={piece} />
                </div>
              )}
              
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
          
          {/* Правые цифры рядов */}
          <div className="flex flex-col ml-2">
            {rowLabels.map((label, index) => (
              <div key={`right-${index}`} className="w-6 h-16 flex items-center justify-center text-sm font-semibold text-gray-700">
                {label}
              </div>
            ))}
          </div>
        </div>
        
        {/* Нижние буквы колонок */}
        <div className="flex justify-center mt-2">
          <div className="grid grid-cols-8 gap-0 w-fit">
            {columnLabels.map((label, index) => (
              <div key={`bottom-${index}`} className="w-16 h-6 flex items-center justify-center text-sm font-semibold text-gray-700">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;