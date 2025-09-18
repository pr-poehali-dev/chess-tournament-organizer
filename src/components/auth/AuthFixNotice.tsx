import Icon from '../ui/icon';

const AuthFixNotice = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Icon name="CheckCircle" className="text-green-500 mr-3 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-green-800 mb-2">
            ✅ Создана администратор-панель!
          </h3>
          <div className="text-green-700 text-sm space-y-1">
            <p>• <strong>Администратор:</strong> логин "admin", пароль "7gp7yfwx"</p>
            <p>• <strong>Панель администратора:</strong> управление пользователями и турнирами</p>
            <p>• <strong>Роли:</strong> admin (администратор), moderator (модератор), player (игрок)</p>
            <p>• <strong>Доступ:</strong> кнопка "Админ" появляется только у администраторов</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFixNotice;