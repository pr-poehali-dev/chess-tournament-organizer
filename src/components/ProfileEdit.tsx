import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { authService, type User } from '@/services/authApi';

interface ProfileEditProps {
  userId?: number; // Для админов - можно редактировать любого пользователя
  isAdminMode?: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ 
  userId, 
  isAdminMode = false, 
  onCancel, 
  onSave 
}) => {
  const { user: currentUser } = useAuth();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    birthDate: '',
    fsrId: '',
    coach: '',
    educationalInstitution: '',
    userType: 'child' as 'child' | 'parent' | 'trainer' | 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [age, setAge] = useState<number | null>(null);

  // Загружаем данные пользователя для редактирования
  useEffect(() => {
    if (isAdminMode && userId) {
      // Загрузка данных другого пользователя (для админа)
      loadUserData(userId);
    } else if (currentUser) {
      // Редактирование собственного профиля
      setEditUser(currentUser);
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        username: currentUser.username || '',
        birthDate: currentUser.birthDate || '',
        fsrId: currentUser.fsrId || '',
        coach: currentUser.coach || '',
        educationalInstitution: currentUser.educationalInstitution || '',
        userType: currentUser.userType || 'child'
      });
    }
  }, [userId, isAdminMode, currentUser]);

  // Вычисляем возраст при изменении даты рождения
  useEffect(() => {
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      setAge(calculatedAge >= 0 ? calculatedAge : null);
    } else {
      setAge(null);
    }
  }, [formData.birthDate]);

  const loadUserData = async (id: number) => {
    try {
      setLoading(true);
      // В реальном приложении здесь будет вызов API для получения данных пользователя
      // const userData = await authService.getUserById(id);
      // setEditUser(userData);
      setError('Загрузка данных пользователя пока не реализована');
    } catch (err) {
      setError('Ошибка загрузки данных пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      // Валидация
      if (!formData.fullName.trim()) {
        setError('Имя обязательно для заполнения');
        return;
      }
      if (!formData.email.trim()) {
        setError('Email обязателен для заполнения');
        return;
      }

      if (isAdminMode && userId) {
        // Админ редактирует другого пользователя
        const result = await authService.updateUserById(userId, formData);
        if (!result.success) {
          setError(result.error || 'Ошибка обновления данных пользователя');
          return;
        }
      } else {
        // Пользователь редактирует свой профиль
        const result = await authService.updateProfile(formData);
        if (!result.success) {
          setError(result.error || 'Ошибка обновления профиля');
          return;
        }
      }
      
      onSave();
    } catch (err) {
      setError('Ошибка сохранения данных');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.userType === 'admin';
  const canEditUserType = isAdmin && isAdminMode;

  if (loading && !editUser) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Icon name="Loader2" className="animate-spin mr-2" />
          Загрузка данных...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Edit" size={20} />
              {isAdminMode ? 'Редактирование пользователя' : 'Редактирование профиля'}
            </CardTitle>
            <CardDescription>
              {isAdminMode 
                ? 'Изменение данных пользователя (режим администратора)'
                : 'Обновите свои личные данные'
              }
            </CardDescription>
          </div>
          {isAdminMode && (
            <Badge variant="destructive">
              <Icon name="Shield" size={12} className="mr-1" />
              Админ
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <Icon name="AlertCircle" size={16} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Полное имя *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Введите полное имя"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Логин *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Введите логин"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Введите email"
            />
          </div>

          {canEditUserType && (
            <div className="space-y-2">
              <Label htmlFor="userType">Тип пользователя</Label>
              <Select 
                value={formData.userType} 
                onValueChange={(value) => handleInputChange('userType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="child">Ребенок</SelectItem>
                  <SelectItem value="parent">Родитель</SelectItem>
                  <SelectItem value="trainer">Тренер</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="birthDate">Дата рождения</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
            />
            {age !== null && (
              <p className="text-sm text-muted-foreground">
                Возраст: <span className="font-medium text-primary">{age} лет</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fsrId">ID ФШР</Label>
            <Input
              id="fsrId"
              value={formData.fsrId}
              onChange={(e) => handleInputChange('fsrId', e.target.value)}
              placeholder="Введите ID Федерации шахмат России"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coach">Тренер</Label>
            <Input
              id="coach"
              value={formData.coach}
              onChange={(e) => handleInputChange('coach', e.target.value)}
              placeholder="ФИО тренера"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="educationalInstitution">Учебное заведение</Label>
            <Input
              id="educationalInstitution"
              value={formData.educationalInstitution}
              onChange={(e) => handleInputChange('educationalInstitution', e.target.value)}
              placeholder="Название учебного заведения"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                Сохранение...
              </>
            ) : (
              <>
                <Icon name="Save" className="mr-2" size={16} />
                Сохранить
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
          >
            <Icon name="X" className="mr-2" size={16} />
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEdit;