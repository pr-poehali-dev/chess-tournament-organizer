import Icon from '../ui/icon';

const AuthFixNotice = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Icon name="CheckCircle" className="text-green-500 mr-3 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-green-800 mb-2">
            ✅ Кнопка "Войти" исправлена!
          </h3>
          <div className="text-green-700 text-sm space-y-1">
            <p>• <strong>Теперь:</strong> Кнопка "Войти" ведет в раздел "Регистрация" с новой формой авторизации</p>
            <p>• <strong>Было:</strong> Открывалась старая форма авторизации по логину</p>
            <p>• <strong>Авторизация:</strong> Только через email/пароль с сохранением в базе данных</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFixNotice;