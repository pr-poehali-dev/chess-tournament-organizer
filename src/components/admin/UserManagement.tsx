import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { type User } from '@/services/authApi';

interface UserManagementProps {
  users: User[];
  selectedUser: User | null;
  isEditingUser: boolean;
  loading: boolean;
  calculateAge: (birthDate: string) => number | null;
  getRoleBadgeColor: (role: string) => string;
  setSelectedUser: (user: User | null) => void;
  setIsEditingUser: (editing: boolean) => void;
  updateUser: (user: User) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  selectedUser,
  isEditingUser,
  loading,
  calculateAge,
  getRoleBadgeColor,
  setSelectedUser,
  setIsEditingUser,
  updateUser
}) => {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={20} />
            Список пользователей ({users.length})
          </CardTitle>
          <CardDescription>
            Просмотр и редактирование данных пользователей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{user.fullName}</h3>
                    <Badge className={getRoleBadgeColor(user.role || 'player')}>
                      {user.role || 'player'}
                    </Badge>
                    <Badge variant="outline">
                      {user.userType}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {user.email} | 
                    <strong> Логин:</strong> {user.username} |
                    <strong> Тип:</strong> {user.userType}
                    {user.birthDate && <><strong> | Возраст:</strong> {calculateAge(user.birthDate)} лет</>}
                    {user.fsrId && <><strong> | ФШР ID:</strong> {user.fsrId}</>}
                  </p>
                  {(user.coach || user.educationalInstitution) && (
                    <p className="text-sm text-gray-500">
                      {user.coach && <><strong>Тренер:</strong> {user.coach}</>}
                      {user.coach && user.educationalInstitution && ' | '}
                      {user.educationalInstitution && <><strong>Учреждение:</strong> {user.educationalInstitution}</>}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    ID: {user.id} | Роль в системе: {user.role || 'Игрок'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsEditingUser(true);
                  }}
                >
                  <Icon name="Edit" size={16} className="mr-1" />
                  Редактировать
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Форма редактирования пользователя */}
      {isEditingUser && selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>Редактирование пользователя</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Полное имя</Label>
                <Input
                  id="fullName"
                  value={selectedUser.fullName}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    fullName: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    email: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    username: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Дата рождения</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={selectedUser.birthDate || ''}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    birthDate: e.target.value
                  })}
                />
                {selectedUser.birthDate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Возраст: {calculateAge(selectedUser.birthDate)} лет
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="fsrId">ID ФШР</Label>
                <Input
                  id="fsrId"
                  value={selectedUser.fsrId || ''}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    fsrId: e.target.value
                  })}
                  placeholder="Введите ID Федерации шахмат России"
                />
              </div>
              <div>
                <Label htmlFor="coach">Тренер</Label>
                <Input
                  id="coach"
                  value={selectedUser.coach || ''}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    coach: e.target.value
                  })}
                  placeholder="ФИО тренера"
                />
              </div>
              <div>
                <Label htmlFor="educationalInstitution">Учебное заведение</Label>
                <Input
                  id="educationalInstitution"
                  value={selectedUser.educationalInstitution || ''}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    educationalInstitution: e.target.value
                  })}
                  placeholder="Название учебного заведения"
                />
              </div>
              <div>
                <Label htmlFor="role">Роль</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value) => setSelectedUser({
                    ...selectedUser,
                    role: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Игрок</SelectItem>
                    <SelectItem value="moderator">Модератор</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="userType">Тип пользователя</Label>
                <Select
                  value={selectedUser.userType}
                  onValueChange={(value) => setSelectedUser({
                    ...selectedUser,
                    userType: value as 'child' | 'parent' | 'trainer' | 'admin'
                  })}
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
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={() => updateUser(selectedUser)} disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditingUser(false);
                  setSelectedUser(null);
                }}
                disabled={loading}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;