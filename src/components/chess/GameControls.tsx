import React from 'react';
import Icon from '@/components/ui/icon';

interface GameControlsProps {
  gameStarted: boolean;
  gameHistory: { moves: any[]; currentMoveIndex: number };
  onShowModeSelector: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameStarted,
  gameHistory,
  onShowModeSelector
}) => {
  return (
    <>
      {/* Кнопка начать игру */}
      {!gameStarted && gameHistory.moves.length === 0 && (
        <div className="w-full lg:w-80 flex flex-col items-center justify-center" style={{height: '640px'}}>
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4">♟️</div>
            <h1 className="text-4xl font-bold text-primary mb-2">Шахматы</h1>
            <p className="text-gray-600 mb-8">Интеллектуальная игра для двоих</p>
            <button
              onClick={onShowModeSelector}
              className="px-8 py-4 bg-primary hover:bg-gold-600 text-black rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🎮 Начать игру
            </button>
          </div>
        </div>
      )}

      {/* Индикация просмотра истории */}
      {gameStarted && gameHistory.moves.length > 0 && gameHistory.currentMoveIndex !== gameHistory.moves.length - 1 && (
        <div className="text-center bg-blue-100 border border-blue-300 rounded-lg p-3 max-w-md">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <Icon name="Clock" size={16} />
            <span className="font-semibold">Просмотр истории</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Перейдите к последнему ходу, чтобы продолжить игру
          </p>
        </div>
      )}

      {/* Инструкция */}
      {gameStarted && (gameHistory.moves.length === 0 || gameHistory.currentMoveIndex === gameHistory.moves.length - 1) && (
        <div className="text-center text-sm text-gray-600 max-w-md">
          <p>Кликните на фигуру чтобы выбрать её, затем кликните на подсвеченную клетку чтобы сделать ход.</p>
        </div>
      )}
    </>
  );
};

export default GameControls;