import { useState, useEffect } from 'react';
import { chessApi, Player } from '../../services/chessApi';
import Icon from '../ui/icon';
import DatabaseDemo from './DatabaseDemo';

const PlayerStats = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const playersData = await chessApi.getPlayers();
      setPlayers(playersData);
    } catch (error) {
      console.error('Ошибка загрузки игроков:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    try {
      await chessApi.createPlayer(newPlayerName, newPlayerEmail || undefined);
      setNewPlayerName('');
      setNewPlayerEmail('');
      setShowAddPlayer(false);
      loadPlayers();
    } catch (error) {
      console.error('Ошибка создания игрока:', error);
    }
  };

  const getWinRate = (player: Player) => {
    if (player.games_played === 0) return 0;
    return Math.round((player.games_won / player.games_played) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Загрузка статистики...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <DatabaseDemo />
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Icon name="Trophy" className="mr-2 text-yellow-500" size={28} />
          Статистика игроков
        </h2>
        <button
          onClick={() => setShowAddPlayer(!showAddPlayer)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center"
        >
          <Icon name="UserPlus" className="mr-2" size={16} />
          Добавить игрока
        </button>
      </div>

      {showAddPlayer && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleAddPlayer} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Имя игрока"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="email"
              placeholder="Email (необязательно)"
              value={newPlayerEmail}
              onChange={(e) => setNewPlayerEmail(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Создать
              </button>
              <button
                type="button"
                onClick={() => setShowAddPlayer(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {players.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Icon name="Users" className="mx-auto mb-4 text-gray-400" size={48} />
          <p>Пока нет зарегистрированных игроков</p>
          <p className="text-sm">Добавьте первого игрока для начала</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Место</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Игрок</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Рейтинг</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Партии</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Победы</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Поражения</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Ничьи</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">% побед</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {index < 3 ? (
                        <Icon 
                          name="Medal" 
                          className={`
                            mr-2 ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 
                              'text-yellow-600'
                            }
                          `} 
                          size={20} 
                        />
                      ) : (
                        <span className="mr-2 w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{player.name}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-primary">{player.rating}</span>
                  </td>
                  <td className="py-3 px-4 text-center">{player.games_played}</td>
                  <td className="py-3 px-4 text-center text-green-600 font-medium">{player.games_won}</td>
                  <td className="py-3 px-4 text-center text-red-600 font-medium">{player.games_lost}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{player.games_drawn}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-medium ${getWinRate(player) >= 70 ? 'text-green-600' : getWinRate(player) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {getWinRate(player)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default PlayerStats;