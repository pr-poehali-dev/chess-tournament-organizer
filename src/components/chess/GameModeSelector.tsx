import { GameMode, AiDifficulty } from './types';

interface GameModeSelectorProps {
  gameMode: GameMode;
  aiDifficulty: AiDifficulty;
  gameStarted: boolean;
  gameHistoryLength: number;
  onGameModeSelect: (mode: GameMode) => void;
  onAiDifficultySelect: (difficulty: AiDifficulty) => void;
  onStartGame: () => void;
}

const GameModeSelector = ({
  gameMode,
  aiDifficulty,
  gameStarted,
  gameHistoryLength,
  onGameModeSelect,
  onAiDifficultySelect,
  onStartGame
}: GameModeSelectorProps) => {
  if (gameStarted || gameHistoryLength > 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center border-4 border-primary">
        <div className="mb-6">
          <div className="text-6xl mb-4">♟️</div>
          <h2 className="text-3xl font-bold text-primary mb-2">Шахматы онлайн</h2>
          <p className="text-gray-600">Выберите режим игры</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              onGameModeSelect('human-vs-human');
              onStartGame();
            }}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-2xl">👥</span>
            Два игрока
          </button>
          
          <button
            onClick={() => {
              onGameModeSelect('human-vs-ai');
              onStartGame();
            }}
            className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🤖</span>
            Против компьютера
          </button>
          
          {gameMode === 'human-vs-ai' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">Уровень сложности:</p>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => onAiDifficultySelect(level)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      aiDifficulty === level
                        ? 'bg-primary text-black'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {level === 'easy' ? 'Легко' : level === 'medium' ? 'Средне' : 'Сложно'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameModeSelector;