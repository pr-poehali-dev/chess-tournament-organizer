import React, { useEffect } from 'react';

interface GameTimersProps {
  currentPlayer: 'white' | 'black';
  gameMode: string;
  gameStatus: string;
  isAiThinking: boolean;
  timerActive: boolean;
  timers: { white: number; black: number };
  gameHistory: { moves: any[] };
  setTimers: (updater: (prev: any) => any) => void;
  setGameStatus: (status: string) => void;
}

const GameTimers: React.FC<GameTimersProps> = ({
  currentPlayer,
  gameMode,
  gameStatus,
  isAiThinking,
  timerActive,
  timers,
  gameHistory,
  setTimers,
  setGameStatus
}) => {
  // Таймеры игроков
  useEffect(() => {
    if (!timerActive || (gameStatus !== 'playing' && gameStatus !== 'check')) return;

    // Определяем реального текущего игрока (чей ход в актуальной партии)
    const realCurrentPlayer = gameHistory.moves.length % 2 === 0 ? 'white' : 'black';

    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = { ...prev };
        if (realCurrentPlayer === 'white') {
          newTimers.white = Math.max(0, prev.white - 1);
          if (newTimers.white === 0) {
            setGameStatus('checkmate');
          }
        } else {
          newTimers.black = Math.max(0, prev.black - 1);
          if (newTimers.black === 0) {
            setGameStatus('checkmate');
          }
        }
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, gameStatus, gameHistory.moves.length]);

  return (
    <div className="w-full lg:w-80 flex flex-col" style={{height: '640px'}}>
      
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
            {Math.floor(timers.black / 60)}:{(timers.black % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>
      
      {/* Пространство для истории ходов - будет заполнено в основном компоненте */}
      <div className="flex-1 mb-4">
        {/* История ходов будет вставлена здесь из основного компонента */}
      </div>
      
      {/* Таймер белых (снизу) */}
      <div className={`bg-white rounded-2xl shadow-2xl p-4 border-2 ${currentPlayer === 'white' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Белые</div>
          <div className={`text-xl font-mono font-bold ${timers.white < 60 ? 'text-red-600' : 'text-black'}`}>
            {Math.floor(timers.white / 60)}:{(timers.white % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTimers;