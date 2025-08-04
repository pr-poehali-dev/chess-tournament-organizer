import { GameMode } from './types';

interface PlayerTimersProps {
  timers: { white: number; black: number };
  currentPlayer: 'white' | 'black';
  gameMode: GameMode;
  isAiThinking: boolean;
}

const PlayerTimers = ({ timers, currentPlayer, gameMode, isAiThinking }: PlayerTimersProps) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Таймер черных (сверху) */}
      <div className={`bg-white rounded-2xl shadow-2xl p-4 mb-4 border-2 ${currentPlayer === 'black' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">
            {gameMode === 'human-vs-ai' ? '🤖 Компьютер' : 'Черные'}
            {gameMode === 'human-vs-ai' && isAiThinking && (
              <span className="ml-2 text-blue-600 animate-pulse">думает...</span>
            )}
          </div>
          <div className={`text-xl font-mono font-bold ${timers.black < 60 ? 'text-red-600' : 'text-black'}`}>
            {formatTime(timers.black)}
          </div>
        </div>
      </div>

      {/* Таймер белых (снизу) */}
      <div className={`bg-white rounded-2xl shadow-2xl p-4 border-2 ${currentPlayer === 'white' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Белые</div>
          <div className={`text-xl font-mono font-bold ${timers.white < 60 ? 'text-red-600' : 'text-black'}`}>
            {formatTime(timers.white)}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerTimers;