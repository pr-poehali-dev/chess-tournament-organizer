import { useState } from 'react';
import { authService } from '../../services/authApi';
import Icon from '../ui/icon';

const AuthDemo = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createTestUser = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await authService.register({
        username: 'demo_user',
        email: 'demo@example.com',
        password: 'demo123',
        fullName: 'Демо Пользователь',
        userType: 'child'
      });

      setMessage('✅ Тестовый пользователь создан! Email: demo@example.com, Пароль: demo123');
    } catch (error) {
      setMessage(`❌ Ошибка: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <Icon name="Shield" className="mr-2 text-green-500" size={24} />
            Система авторизации готова!
          </h3>
          <p className="text-gray-600 mt-1">
            Создайте тестового пользователя для проверки регистрации и входа
          </p>
        </div>
        
        <button
          onClick={createTestUser}
          disabled={loading}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Создание...
            </>
          ) : (
            <>
              <Icon name="UserPlus" className="mr-2" size={16} />
              Создать тестового пользователя
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

export default AuthDemo;