import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { UserData } from '@/types/user';
import { RegistrationData } from './types';

interface ProfilePageProps {
  isLoggedIn: boolean;
  currentUser: UserData | null;
  registrationData: RegistrationData;
  onLogin: (userData: UserData) => void;
  onRegistrationDataChange: (data: RegistrationData) => void;
  onRegister: () => void;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  isLoggedIn,
  currentUser,
  registrationData,
  onLogin,
  onRegistrationDataChange,
  onRegister,
  onLogout
}) => {
  const testUser: UserData = {
    id: '1',
    fullName: 'Иванов Максим Андреевич',
    dateOfBirth: '2015-03-15',
    gender: 'male',
    fcrId: '12345678',
    educationalInstitution: 'МБОУ СОШ №1',
    trainerName: 'Петров Сергей Владимирович',
    representativeEmail: 'ivanova@email.com',
    representativePhone: '+7 (999) 123-45-67',
    userType: 'child',
    registrationDate: '2024-01-15'
  };

  if (isLoggedIn && currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            Личный кабинет
          </h1>
          <Button onClick={onLogout} variant="outline">
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={32} className="text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{currentUser.fullName}</h3>
                  <Badge variant="secondary">
                    {currentUser.userType === 'child' ? 'Участник' : 'Родитель'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Дата рождения:</span>
                  <p className="font-medium">{currentUser.dateOfBirth}</p>
                </div>
                <div>
                  <span className="text-gray-500">ID ФШР:</span>
                  <p className="font-medium">{currentUser.fcrId}</p>
                </div>
                <div>
                  <span className="text-gray-500">Школа:</span>
                  <p className="font-medium">{currentUser.educationalInstitution}</p>
                </div>
                <div>
                  <span className="text-gray-500">Тренер:</span>
                  <p className="font-medium">{currentUser.trainerName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Статистика турниров</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-gray-600">Турниров сыграно</div>
                </div>
                <div className="p-4 bg-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-sm text-gray-600">Призовых мест</div>
                </div>
                <div className="p-4 bg-yellow-100 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">1125
</div>
                  <div className="text-sm text-gray-600">Рейтинг</div>
                </div>
                <div className="p-4 bg-purple-100 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <div className="text-sm text-gray-600">Посещаемость</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Последние турниры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Весенний турнир', date: '2024-03-15', place: 2, points: 4.5 },
                { name: 'Кубок школьников', date: '2024-02-20', place: 5, points: 3.5 },
                { name: 'Зимний чемпионат', date: '2024-01-10', place: 1, points: 5.0 }
              ].map((tournament, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold">{tournament.name}</div>
                    <div className="text-sm text-gray-600">{tournament.date}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={tournament.place <= 3 ? 'default' : 'secondary'}>
                      {tournament.place} место
                    </Badge>
                    <div className="text-sm text-gray-600">{tournament.points} очков</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
          Вход и регистрация
        </h1>
        <p className="text-lg text-gray-600">
          Войдите в аккаунт или зарегистрируйтесь для участия в турнирах
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Быстрый вход (тестовый)</CardTitle>
            <CardDescription>
              Используйте для демонстрации функций сайта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-primary hover:bg-gold-600 text-black"
              onClick={() => onLogin(testUser)}
            >
              <Icon name="User" size={16} className="mr-2" />
              Войти как {testUser.fullName}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Регистрация нового участника</CardTitle>
            <CardDescription>
              Заполните форму для создания аккаунта
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Полное имя *</Label>
              <Input
                id="fullName"
                value={registrationData.fullName}
                onChange={(e) => onRegistrationDataChange({
                  ...registrationData,
                  fullName: e.target.value
                })}
                placeholder="Фамилия Имя Отчество"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Дата рождения *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={registrationData.dateOfBirth}
                  onChange={(e) => onRegistrationDataChange({
                    ...registrationData,
                    dateOfBirth: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="gender">Пол *</Label>
                <Select
                  value={registrationData.gender}
                  onValueChange={(value: 'male' | 'female') => 
                    onRegistrationDataChange({
                      ...registrationData,
                      gender: value
                    })
                  }
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
            </div>

            <div>
              <Label htmlFor="fcrId">ID ФШР (если есть)</Label>
              <Input
                id="fcrId"
                value={registrationData.fcrId}
                onChange={(e) => onRegistrationDataChange({
                  ...registrationData,
                  fcrId: e.target.value
                })}
                placeholder="Номер в системе ФШР"
              />
            </div>

            <Button 
              onClick={onRegister}
              className="w-full bg-primary hover:bg-gold-600 text-black"
              disabled={!registrationData.fullName || !registrationData.dateOfBirth}
            >
              <Icon name="UserPlus" size={16} className="mr-2" />
              Зарегистрироваться
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;