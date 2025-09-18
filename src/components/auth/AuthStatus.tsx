import { useAuth } from '@/contexts/AuthContext';
import Icon from '../ui/icon';

const AuthStatus = () => {
  const { isLoggedIn, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-blue-700">Проверка авторизации...</span>
        </div>
      </div>
    );
  }

  if (isLoggedIn && user) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Icon name="CheckCircle" className="text-green-500 mr-2" size={20} />
          <div>
            <div className="text-green-800 font-medium">
              Добро пожаловать, {user.fullName}!
            </div>
            <div className="text-green-600 text-sm">
              Вы авторизованы как {user.userType} ({user.email})
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <Icon name="AlertCircle" className="text-orange-500 mr-2" size={20} />
        <div>
          <div className="text-orange-800 font-medium">Вы не авторизованы</div>
          <div className="text-orange-600 text-sm">
            Войдите в систему для участия в турнирах
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthStatus;