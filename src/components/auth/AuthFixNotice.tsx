import Icon from '../ui/icon';

const AuthFixNotice = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Icon name="CheckCircle" className="text-green-500 mr-3 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-green-800 mb-2">
            ✅ Backend API для админ-панели готов!
          </h3>
          <div className="text-green-700 text-sm space-y-1">
            <p>• <strong>Администратор:</strong> логин "admin", пароль "7gp7yfwx"</p>
            <p>• <strong>API пользователей:</strong> просмотр, редактирование, деактивация</p>
            <p>• <strong>API турниров:</strong> создание, редактирование, отмена турниров</p>
            <p>• <strong>Безопасность:</strong> проверка токена сессии и прав администратора</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFixNotice;