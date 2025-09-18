import { useState } from 'react';
import { chessApi } from '../../services/chessApi';
import Icon from '../ui/icon';

const DatabaseDemo = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createDemoData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const players = [
        { name: 'Александр Петров', email: 'petrov@example.com' },
        { name: 'Мария Иванова', email: 'ivanova@example.com' },
        { name: 'Дмитрий Сидоров', email: 'sidorov@example.com' },
        { name: 'Елена Козлова', email: 'kozlova@example.com' },
        { name: 'Андрей Волков', email: 'volkov@example.com' }
      ];

      for (const playerData of players) {
        await chessApi.createPlayer(playerData.name, playerData.email);
      }

      setMessage('✅ Тестовые игроки успешно созданы!');
    } catch (error) {
      setMessage(`❌ Ошибка: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Icon name="Database" className="mr-2 text-blue-500" size={24} />
            База данных подключена!
          </h3>
          <p className="text-gray-600 mt-1">
            Создайте тестовых игроков для демонстрации статистики
          </p>
        </div>
        
        <button
          onClick={createDemoData}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Создание...
            </>
          ) : (
            <>
              <Icon name="UserPlus" className="mr-2" size={16} />
              Создать тестовых игроков
            </>
          )}
        </button>
      </div>
      
      {message && (
        <div className="mt-4 p-3 bg-white rounded-lg border">
          {message}
        </div>
      )}
    </div>
  );
};

export default DatabaseDemo;