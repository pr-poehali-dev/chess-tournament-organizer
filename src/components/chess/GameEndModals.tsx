import React from 'react';
import Icon from '@/components/ui/icon';

interface GameEndModalsProps {
  gameStatus: string;
  showEndGameModal: boolean;
  currentPlayer: 'white' | 'black';
  gameMode: string;
  gameHistory: { moves: any[] };
  timers: { white: number; black: number };
  pawnPromotion: { position: { row: number; col: number }; color: 'white' | 'black' } | null;
  onCloseEndGameModal: () => void;
  onResetGame: () => void;
  onCompletePawnPromotion: (pieceType: 'queen' | 'rook' | 'bishop' | 'knight') => void;
}

const GameEndModals: React.FC<GameEndModalsProps> = ({
  gameStatus,
  showEndGameModal,
  currentPlayer,
  gameMode,
  gameHistory,
  timers,
  pawnPromotion,
  onCloseEndGameModal,
  onResetGame,
  onCompletePawnPromotion
}) => {
  return (
    <>
      {/* Всплывающее окно с результатом игры */}
      {(gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'draw') && showEndGameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-4 text-center border-4 border-primary transform animate-scaleIn">
            <div className="mb-6">
              {gameStatus === 'checkmate' ? (
                <>
                  <div className="text-7xl mb-4 animate-bounce">
                    {currentPlayer === 'white' ? '👑' : gameMode === 'human-vs-ai' ? '🤖' : '👑'}
                  </div>
                  <h2 className="text-4xl font-bold text-primary mb-3">
                    {currentPlayer === 'white' ? 'ЧЕРНЫЕ ПОБЕДИЛИ!' : 
                     gameMode === 'human-vs-ai' ? 'ВЫ ВЫИГРАЛИ!' : 'БЕЛЫЕ ПОБЕДИЛИ!'}
                  </h2>
                  <div className="bg-red-100 rounded-lg p-4 mb-4">
                    <div className="text-3xl mb-2">♔</div>
                    <p className="text-lg font-semibold text-red-800">
                      Шах и мат!
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      Король под атакой и не может спастись
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Количество ходов: <span className="font-bold">{gameHistory.moves.length}</span></p>
                    <p>Время партии: <span className="font-bold">
                      {Math.floor((900 - Math.min(timers.white, timers.black)) / 60)}:
                      {((900 - Math.min(timers.white, timers.black)) % 60).toString().padStart(2, '0')}
                    </span></p>
                  </div>
                </>
              ) : gameStatus === 'draw' ? (
                <>
                  <div className="text-7xl mb-4 animate-pulse">🔄</div>
                  <h2 className="text-4xl font-bold text-primary mb-3">НИЧЬЯ ОБЪЯВЛЕНА!</h2>
                  <div className="bg-blue-100 rounded-lg p-4 mb-4">
                    <div className="text-3xl mb-2">🔄</div>
                    <p className="text-lg font-semibold text-blue-800">
                      Трёхкратное повторение позиции
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      Одинаковая позиция повторилась 3 раза подряд
                    </p>
                    <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      <p className="font-semibold">🏛️ Шахматное правило:</p>
                      <p>Если одна и та же позиция возникает трижды, автоматически объявляется ничья</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>📍 <span className="font-semibold">Ничья на ходу:</span> 
                        <span className="font-bold text-primary ml-1">
                          {Math.ceil(gameHistory.moves.length / 2)}
                        </span>
                      </p>
                      <p>🔢 <span className="font-semibold">Всего ходов:</span> 
                        <span className="font-bold">{gameHistory.moves.length}</span>
                      </p>
                      <p>⏱️ <span className="font-semibold">Время партии:</span> 
                        <span className="font-bold">
                          {Math.floor((900 - Math.min(timers.white, timers.black)) / 60)}:
                          {((900 - Math.min(timers.white, timers.black)) % 60).toString().padStart(2, '0')}
                        </span>
                      </p>
                      <p>⚖️ <span className="font-semibold">Результат:</span> 
                        <span className="font-bold text-blue-600">½ - ½</span>
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-7xl mb-4 animate-pulse">🤝</div>
                  <h2 className="text-4xl font-bold text-primary mb-3">НИЧЬЯ!</h2>
                  <div className="bg-yellow-100 rounded-lg p-4 mb-4">
                    <div className="text-3xl mb-2">⚖️</div>
                    <p className="text-lg font-semibold text-yellow-800">
                      Пат - тупиковая позиция
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Нет доступных ходов, но король не под угрозой
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Количество ходов: <span className="font-bold">{gameHistory.moves.length}</span></p>
                    <p>Время партии: <span className="font-bold">
                      {Math.floor((900 - Math.min(timers.white, timers.black)) / 60)}:
                      {((900 - Math.min(timers.white, timers.black)) % 60).toString().padStart(2, '0')}
                    </span></p>
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={onCloseEndGameModal}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              >
                🔍 Анализировать партию
              </button>
              <button
                onClick={onResetGame}
                className="w-full px-6 py-3 bg-primary hover:bg-gold-600 text-black rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              >
                🔄 Новая игра
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно превращения пешки */}
      {pawnPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center border-4 border-primary">
            <h3 className="text-2xl font-bold mb-6">Превращение пешки</h3>
            <p className="text-gray-600 mb-6">Выберите фигуру для превращения:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onCompletePawnPromotion('queen')}
                className="flex flex-col items-center p-4 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-bold text-lg transition-colors"
              >
                <span className="text-4xl mb-2">
                  {pawnPromotion.color === 'white' ? '♕' : '♛'}
                </span>
                Ферзь
              </button>
              <button
                onClick={() => onCompletePawnPromotion('rook')}
                className="flex flex-col items-center p-4 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-bold text-lg transition-colors"
              >
                <span className="text-4xl mb-2">
                  {pawnPromotion.color === 'white' ? '♖' : '♜'}
                </span>
                Ладья
              </button>
              <button
                onClick={() => onCompletePawnPromotion('bishop')}
                className="flex flex-col items-center p-4 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-bold text-lg transition-colors"
              >
                <span className="text-4xl mb-2">
                  {pawnPromotion.color === 'white' ? '♗' : '♝'}
                </span>
                Слон
              </button>
              <button
                onClick={() => onCompletePawnPromotion('knight')}
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
    </>
  );
};

export default GameEndModals;