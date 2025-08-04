import Icon from '@/components/ui/icon';
import { GameHistory, Position } from './types';

interface MoveHistoryProps {
  gameHistory: GameHistory;
  onGoToMove: (moveIndex: number) => void;
}

const MoveHistory = ({ gameHistory, onGoToMove }: MoveHistoryProps) => {
  const positionToNotation = (pos: Position): string => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return `${files[pos.col]}${ranks[pos.row]}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 flex-1 mb-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-heading font-bold">История партии</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onGoToMove(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="К началу"
          >
            <Icon name="ChevronsLeft" size={16} />
          </button>
          <button
            onClick={() => onGoToMove(Math.max(-1, gameHistory.currentMoveIndex - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Предыдущий ход"
          >
            <Icon name="ChevronLeft" size={16} />
          </button>
          <button
            onClick={() => onGoToMove(Math.min(gameHistory.moves.length - 1, gameHistory.currentMoveIndex + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Следующий ход"
          >
            <Icon name="ChevronRight" size={16} />
          </button>
          <button
            onClick={() => onGoToMove(gameHistory.moves.length - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="К концу"
          >
            <Icon name="ChevronsRight" size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {gameHistory.moves.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <Icon name="Clock" size={48} className="mx-auto mb-2 opacity-50" />
            <p>Партия еще не началась</p>
          </div>
        ) : (
          <div className="space-y-1">
            <button
              onClick={() => onGoToMove(-1)}
              className={`w-full text-left p-2 rounded-lg transition-colors ${
                gameHistory.currentMoveIndex === -1 
                  ? 'bg-primary text-black font-semibold' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-sm text-gray-600">Начальная позиция</span>
            </button>

            {Array.from({ length: Math.ceil(gameHistory.moves.length / 2) }, (_, pairIndex) => {
              const moveNum = pairIndex + 1;
              const whiteMove = gameHistory.moves[pairIndex * 2];
              const blackMove = gameHistory.moves[pairIndex * 2 + 1];
              
              return (
                <div key={pairIndex} className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-gray-500 w-6 text-right">{moveNum}.</span>
                  
                  <button
                    onClick={() => onGoToMove(pairIndex * 2)}
                    className={`px-2 py-1 rounded text-sm transition-colors flex-1 text-left ${
                      gameHistory.currentMoveIndex === pairIndex * 2
                        ? 'bg-primary text-black font-semibold' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {whiteMove?.notation || ''}
                  </button>
                  
                  {blackMove && (
                    <button
                      onClick={() => onGoToMove(pairIndex * 2 + 1)}
                      className={`px-2 py-1 rounded text-sm transition-colors flex-1 text-left ${
                        gameHistory.currentMoveIndex === pairIndex * 2 + 1
                          ? 'bg-primary text-black font-semibold' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {blackMove.notation}
                    </button>
                  )}
                  
                  {!blackMove && <div className="flex-1"></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;