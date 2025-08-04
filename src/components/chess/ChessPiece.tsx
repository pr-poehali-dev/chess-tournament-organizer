import { ChessPiece as ChessPieceType } from './types';

interface ChessPieceProps {
  piece: ChessPieceType;
}

const ChessPiece = ({ piece }: ChessPieceProps) => {
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

export default ChessPiece;