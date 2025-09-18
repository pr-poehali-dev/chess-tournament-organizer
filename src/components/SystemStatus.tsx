import Icon from './ui/icon';

const SystemStatus = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Icon name="CheckCircle" className="mr-2 text-green-500" size={24} />
        Система авторизации обновлена!
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">✅ Что работает:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Регистрация через email/пароль</li>
            <li>• Авторизация с сессиями</li>
            <li>• Безопасное хранение в PostgreSQL</li>
            <li>• Автоматическое создание профиля игрока</li>
            <li>• Проверка авторизации при загрузке</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">🗑️ Что удалено:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Старая авторизация по логину</li>
            <li>• Локальное хранение пользователей</li>
            <li>• Дублирующие типы и интерфейсы</li>
            <li>• Неиспользуемые компоненты</li>
            <li>• Устаревший ProfilePage</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Как попробовать:</strong> Перейдите в раздел "Регистрация" → создайте тестового пользователя → войдите в систему
        </p>
      </div>
    </div>
  );
};

export default SystemStatus;