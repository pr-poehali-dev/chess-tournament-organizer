import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import AuthDemo from '../auth/AuthDemo';
import ProfilePage from '../ProfilePage';
import ProfileEdit from '../ProfileEdit';
import AdminPanel from '../admin/AdminPanel';

const AuthPage = () => {
  const { login, register, user, logout, isLoggedIn, isLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'profile' | 'edit' | 'admin'>('profile');

  // Состояние для входа
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Состояние для регистрации
  const [registrationData, setRegistrationData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    dateOfBirth: '',
    birthDate: '', // Новое поле для даты рождения
    gender: 'male' as 'male' | 'female',
    fcrId: '',
    fsrId: '', // Новое поле ID ФШР
    educationalInstitution: '',
    trainerName: '',
    coach: '', // Новое поле тренер
    representativeEmail: '',
    representativePhone: '',
    userType: 'child' as 'child' | 'parent' | 'trainer'
  });

  // Функция для вычисления возраста
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(loginData.email, loginData.password);
      if (!success) {
        setError('Неверный email или пароль');
      }
    } catch (err) {
      setError('Ошибка при входе в систему');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!registrationData.username || !registrationData.email || !registrationData.password || !registrationData.fullName) {
      setError('Заполните все обязательные поля');
      setLoading(false);
      return;
    }

    if (registrationData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      setLoading(false);
      return;
    }

    try {
      const success = await register(registrationData);
      if (!success) {
        setError('Ошибка при регистрации');
      }
    } catch (err) {
      setError('Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (isLoggedIn && user) {
    // Проверяем режим отображения
    if (viewMode === 'edit') {
      return (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <ProfileEdit
            onCancel={() => setViewMode('profile')}
            onSave={() => setViewMode('profile')}
          />
        </div>
      );
    }

    if (viewMode === 'admin' && user.userType === 'admin') {
      return <AdminPanel />;
    }

    // Личный кабинет авторизованного пользователя
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Личный кабинет
          </h1>
          <div className="flex gap-2">
            {user.userType === 'admin' && (
              <Button onClick={() => setViewMode('admin')} variant="secondary">
                <Icon name="Shield" className="mr-2" size={16} />
                Админ-панель
              </Button>
            )}
            <Button onClick={() => setViewMode('edit')} variant="outline">
              <Icon name="Edit" className="mr-2" size={16} />
              Редактировать
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <Icon name="LogOut" className="mr-2" size={16} />
              Выйти
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Информация о пользователе */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="User" className="mr-2" size={20} />
                Информация о пользователе
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Полное имя</Label>
                  <div className="text-lg font-semibold">{user.fullName}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Имя пользователя</Label>
                  <div className="text-lg">{user.username}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <div className="text-lg">{user.email}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Тип пользователя</Label>
                  <div className="text-lg capitalize">{user.userType}</div>
                </div>
                {user.birthDate && (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Дата рождения</Label>
                      <div className="text-lg">{new Date(user.birthDate).toLocaleDateString('ru-RU')}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Возраст</Label>
                      <div className="text-lg font-semibold text-primary">{calculateAge(user.birthDate)} лет</div>
                    </div>
                  </>
                )}
                {user.fsrId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">ID ФШР</Label>
                    <div className="text-lg font-mono">{user.fsrId}</div>
                  </div>
                )}
                {user.coach && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Тренер</Label>
                    <div className="text-lg">{user.coach}</div>
                  </div>
                )}
                {user.educationalInstitution && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Учебное заведение</Label>
                    <div className="text-lg">{user.educationalInstitution}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="BarChart3" className="mr-2" size={20} />
                Игровая статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Icon name="Trophy" className="mx-auto mb-4 text-gray-400" size={48} />
                <p>Статистика появится после первых игр</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Форма входа/регистрации
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <AuthDemo />
      
      <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isRegistering ? 'Регистрация' : 'Вход в систему'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {isRegistering ? (
            // Форма регистрации
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="username">Имя пользователя *</Label>
                <Input
                  id="username"
                  type="text"
                  value={registrationData.username}
                  onChange={(e) => setRegistrationData(prev => ({...prev, username: e.target.value}))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fullName">Полное имя *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={registrationData.fullName}
                  onChange={(e) => setRegistrationData(prev => ({...prev, fullName: e.target.value}))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => setRegistrationData(prev => ({...prev, email: e.target.value}))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={registrationData.password}
                  onChange={(e) => setRegistrationData(prev => ({...prev, password: e.target.value}))}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Дата рождения (старый формат)</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={registrationData.dateOfBirth}
                  onChange={(e) => setRegistrationData(prev => ({...prev, dateOfBirth: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Дата рождения *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={registrationData.birthDate}
                  onChange={(e) => setRegistrationData(prev => ({...prev, birthDate: e.target.value}))}
                />
                {registrationData.birthDate && (
                  <div className="text-sm text-gray-600 mt-1">
                    Возраст: {calculateAge(registrationData.birthDate)} лет
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="fsrId">ID ФШР (Федерация шахмат России)</Label>
                <Input
                  id="fsrId"
                  type="text"
                  placeholder="Введите ваш ID ФШР"
                  value={registrationData.fsrId}
                  onChange={(e) => setRegistrationData(prev => ({...prev, fsrId: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="coach">Тренер</Label>
                <Input
                  id="coach"
                  type="text"
                  placeholder="ФИО тренера"
                  value={registrationData.coach}
                  onChange={(e) => setRegistrationData(prev => ({...prev, coach: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="educationalInstitution">Учебное заведение</Label>
                <Input
                  id="educationalInstitution"
                  type="text"
                  placeholder="Название школы, университета, секции"
                  value={registrationData.educationalInstitution}
                  onChange={(e) => setRegistrationData(prev => ({...prev, educationalInstitution: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="gender">Пол</Label>
                <Select 
                  value={registrationData.gender} 
                  onValueChange={(value: 'male' | 'female') => setRegistrationData(prev => ({...prev, gender: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужской</SelectItem>
                    <SelectItem value="female">Женский</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="userType">Тип пользователя</Label>
                <Select 
                  value={registrationData.userType} 
                  onValueChange={(value: 'child' | 'parent' | 'trainer') => setRegistrationData(prev => ({...prev, userType: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child">Ребенок</SelectItem>
                    <SelectItem value="parent">Родитель</SelectItem>
                    <SelectItem value="trainer">Тренер</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsRegistering(false)}
              >
                Уже есть аккаунт? Войти
              </Button>
            </form>
          ) : (
            // Форма входа
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="loginEmail">Email</Label>
                <Input
                  id="loginEmail"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({...prev, email: e.target.value}))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="loginPassword">Пароль</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => setIsRegistering(true)}
              >
                Нет аккаунта? Зарегистрироваться
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AuthPage;