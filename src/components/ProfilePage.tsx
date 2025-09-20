import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import ProfileEdit from './ProfileEdit';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Пользователь не найден</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Вычисляем возраст
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  };

  const age = calculateAge(user.birthDate);

  const getUserTypeLabel = (userType: string) => {
    const types = {
      child: 'Ребенок',
      parent: 'Родитель', 
      trainer: 'Тренер',
      admin: 'Администратор'
    };
    return types[userType as keyof typeof types] || userType;
  };

  const getUserTypeBadgeVariant = (userType: string) => {
    switch (userType) {
      case 'admin': return 'destructive';
      case 'trainer': return 'default';
      case 'parent': return 'secondary';
      default: return 'outline';
    }
  };

  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProfileEdit
          onCancel={() => setIsEditing(false)}
          onSave={() => {
            setIsEditing(false);
            // Здесь можно добавить перезагрузку данных пользователя
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Заголовок профиля */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={32} className="text-black" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                  <CardDescription className="text-lg">@{user.username}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getUserTypeBadgeVariant(user.userType)}>
                      {getUserTypeLabel(user.userType)}
                    </Badge>
                    {user.userType === 'admin' && (
                      <Badge variant="secondary" className="bg-gold-100 text-gold-800 border-gold-200">
                        <Icon name="Crown" size={12} className="mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Icon name="Edit" size={16} />
                Редактировать
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Основная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Личные данные */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" size={20} />
                Личные данные
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                
                {user.birthDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Дата рождения</p>
                    <p className="font-medium">
                      {new Date(user.birthDate).toLocaleDateString('ru-RU')}
                      {age !== null && (
                        <span className="text-primary ml-2">({age} лет)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {user.fsrId && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID Федерации шахмат России</p>
                  <p className="font-medium font-mono">{user.fsrId}</p>
                </div>
              )}

              {user.coach && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Тренер</p>
                  <p className="font-medium">{user.coach}</p>
                </div>
              )}

              {user.educationalInstitution && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Учебное заведение</p>
                  <p className="font-medium">{user.educationalInstitution}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Статистика и активность */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BarChart3" size={20} />
                Активность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Игр сыграно</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-muted-foreground">Побед</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">1200</p>
                  <p className="text-sm text-muted-foreground">Рейтинг</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-muted-foreground">Турниров</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Уровень активности</span>
                  <Badge variant="outline">Новичок</Badge>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Сыграйте больше игр, чтобы повысить уровень
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Дополнительная информация для админов */}
        {user.userType === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Shield" size={20} />
                Административная информация
              </CardTitle>
              <CardDescription>
                Информация, доступная только администраторам
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID пользователя</p>
                  <p className="font-medium font-mono">{user.id}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Роль в системе</p>
                  <p className="font-medium">{user.role || 'Не указана'}</p>
                </div>
                
                {user.playerId && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID игрока</p>
                    <p className="font-medium font-mono">{user.playerId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Действия */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" size={20} />
              Настройки аккаунта
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Icon name="Key" size={16} />
                Сменить пароль
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Icon name="Bell" size={16} />
                Уведомления
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Icon name="Download" size={16} />
                Экспорт данных
              </Button>
              
              <Button variant="destructive" className="flex items-center gap-2">
                <Icon name="Trash2" size={16} />
                Удалить аккаунт
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;