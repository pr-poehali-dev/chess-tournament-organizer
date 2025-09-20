import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { authService, type User } from '@/services/authApi';
import { adminApiService, type CreateTournamentData } from '@/services/adminApi';
import { useToast } from '@/components/ui/use-toast';

// Создаем локальные типы для турниров  
interface Tournament {
  id: number;
  name: string;
  description: string;
  start_date: string;
  max_participants: number;
  entry_fee: number;
  tournament_type: string;
  time_control: string;
  age_category: string;
  start_time_msk: string;
  rounds: number;
  status: string;
}

interface CreateTournamentData {
  name: string;
  description?: string;
  start_date: string;
  max_participants?: number;
  entry_fee?: number;
  tournament_type?: string;
  time_control?: string;
  age_category?: string;
  start_time_msk?: string;
  rounds?: number;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingTournament, setIsEditingTournament] = useState(false);
  const [isCreatingTournament, setIsCreatingTournament] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Вычисление возраста
  const calculateAge = (birthDate: string) => {
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

  // Загрузка пользователей
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await authService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список пользователей',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Загрузка турниров
  const loadTournaments = async () => {
    try {
      setLoading(true);
      const tournamentsData = await adminApiService.getTournaments();
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Ошибка загрузки турниров:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список турниров',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadTournaments();
  }, []);

  // Обновление пользователя
  const updateUser = async (updatedUser: User) => {
    try {
      setLoading(true);
      const result = await authService.updateUserById(updatedUser.id, updatedUser);
      if (result.success && result.user) {
        setUsers(users.map(u => u.id === result.user!.id ? result.user! : u));
        setIsEditingUser(false);
        setSelectedUser(null);
        toast({
          title: 'Успех',
          description: 'Пользователь успешно обновлен'
        });
      } else {
        throw new Error(result.error || 'Ошибка обновления');
      }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить пользователя',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Создание турнира
  const createTournament = async (tournamentData: CreateTournamentData) => {
    try {
      setLoading(true);
      const newTournament = await adminApiService.createTournament(tournamentData);
      setTournaments([newTournament, ...tournaments]);
      setIsCreatingTournament(false);
      toast({
        title: 'Успех',
        description: 'Турнир успешно создан'
      });
    } catch (error) {
      console.error('Ошибка создания турнира:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать турнир',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'registration': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Панель администратора
        </h1>
        <p className="text-gray-600">
          Управление пользователями и турнирами
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="tournaments">Турниры</TabsTrigger>
        </TabsList>

        {/* Управление пользователями */}
        <TabsContent value="users" className="space-y-6">
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
        </TabsContent>

        {/* Управление турнирами */}
        <TabsContent value="tournaments" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Trophy" size={20} />
                      Список турниров ({tournaments.length})
                    </CardTitle>
                    <CardDescription>
                      Управление турнирами и соревнованиями
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsCreatingTournament(true)}>
                    <Icon name="Plus" size={16} className="mr-1" />
                    Создать турнир
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tournaments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="Trophy" size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Турниры не созданы</p>
                    <p className="text-sm">Нажмите "Создать турнир" для добавления нового турнира</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tournaments.map((tournament) => (
                      <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{tournament.name}</h3>
                            <Badge className={getStatusBadgeColor(tournament.status)}>
                              {tournament.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {tournament.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            <strong>Дата:</strong> {new Date(tournament.start_date).toLocaleDateString('ru-RU')} в {tournament.start_time_msk} МСК |
                            <strong> Контроль времени:</strong> {tournament.time_control} |
                            <strong> Возраст:</strong> {tournament.age_category}
                          </p>
                          <p className="text-xs text-gray-500">
                            <strong>Участники:</strong> {tournament.max_participants} |
                            <strong> Туры:</strong> {tournament.rounds} |
                            <strong> Взнос:</strong> {tournament.entry_fee} руб.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTournament(tournament);
                            setIsEditingTournament(true);
                          }}
                        >
                          <Icon name="Edit" size={16} className="mr-1" />
                          Редактировать
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Форма создания турнира */}
            {isCreatingTournament && (
              <TournamentForm
                onSubmit={createTournament}
                onCancel={() => setIsCreatingTournament(false)}
                title="Создание нового турнира"
                loading={loading}
              />
            )}

            {/* Форма редактирования турнира */}
            {isEditingTournament && selectedTournament && (
              <TournamentForm
                tournament={selectedTournament}
                onSubmit={async (data) => {
                  try {
                    setLoading(true);
                    const updated = await adminApiService.updateTournament({
                      ...data,
                      id: selectedTournament.id
                    });
                    setTournaments(tournaments.map(t => 
                      t.id === updated.id ? updated : t
                    ));
                    setIsEditingTournament(false);
                    setSelectedTournament(null);
                    toast({
                      title: 'Успех',
                      description: 'Турнир успешно обновлен'
                    });
                  } catch (error) {
                    console.error('Ошибка обновления турнира:', error);
                    toast({
                      title: 'Ошибка',
                      description: 'Не удалось обновить турнир',
                      variant: 'destructive'
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                onCancel={() => {
                  setIsEditingTournament(false);
                  setSelectedTournament(null);
                }}
                title="Редактирование турнира"
                loading={loading}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Компонент формы турнира
interface TournamentFormProps {
  tournament?: Tournament;
  onSubmit: (data: CreateTournamentData) => void | Promise<void>;
  onCancel: () => void;
  title: string;
  loading?: boolean;
}

const TournamentForm: React.FC<TournamentFormProps> = ({ tournament, onSubmit, onCancel, title, loading = false }) => {
  const [formData, setFormData] = useState({
    name: tournament?.name || '',
    description: tournament?.description || '',
    start_date: tournament?.start_date || '',
    max_participants: tournament?.max_participants || 100,
    tournament_type: tournament?.tournament_type || 'swiss',
    time_control: tournament?.time_control || '90+30',
    age_category: tournament?.age_category || 'до 12 лет',
    start_time_msk: tournament?.start_time_msk || '10:00',
    rounds: tournament?.rounds || 9,
    entry_fee: tournament?.entry_fee || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Название турнира</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="start_date">Дата начала</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="start_time_msk">Время начала (МСК)</Label>
              <Input
                id="start_time_msk"
                type="time"
                value={formData.start_time_msk}
                onChange={(e) => setFormData({ ...formData, start_time_msk: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="time_control">Контроль времени</Label>
              <Select
                value={formData.time_control}
                onValueChange={(value) => setFormData({ ...formData, time_control: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90+30">90 мин + 30 сек/ход</SelectItem>
                  <SelectItem value="60+10">60 мин + 10 сек/ход</SelectItem>
                  <SelectItem value="30+5">30 мин + 5 сек/ход</SelectItem>
                  <SelectItem value="15+10">15 мин + 10 сек/ход</SelectItem>
                  <SelectItem value="10+5">10 мин + 5 сек/ход</SelectItem>
                  <SelectItem value="5+3">5 мин + 3 сек/ход</SelectItem>
                  <SelectItem value="3+2">3 мин + 2 сек/ход</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="max_participants">Макс. участников</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="tournament_type">Тип турнира</Label>
              <Select
                value={formData.tournament_type}
                onValueChange={(value) => setFormData({ ...formData, tournament_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="swiss">Швейцарская система</SelectItem>
                  <SelectItem value="round_robin">Круговая система</SelectItem>
                  <SelectItem value="knockout">На выбывание</SelectItem>
                  <SelectItem value="arena">Арена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rounds">Количество туров</Label>
              <Input
                id="rounds"
                type="number"
                value={formData.rounds}
                onChange={(e) => setFormData({ ...formData, rounds: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="entry_fee">Взнос (руб.)</Label>
              <Input
                id="entry_fee"
                type="number"
                step="0.01"
                value={formData.entry_fee}
                onChange={(e) => setFormData({ ...formData, entry_fee: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="age_category">Возрастная категория</Label>
              <Select
                value={formData.age_category}
                onValueChange={(value) => setFormData({ ...formData, age_category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="до 8 лет">до 8 лет</SelectItem>
                  <SelectItem value="до 10 лет">до 10 лет</SelectItem>
                  <SelectItem value="до 12 лет">до 12 лет</SelectItem>
                  <SelectItem value="до 14 лет">до 14 лет</SelectItem>
                  <SelectItem value="до 16 лет">до 16 лет</SelectItem>
                  <SelectItem value="до 18 лет">до 18 лет</SelectItem>
                  <SelectItem value="взрослые">взрослые</SelectItem>
                  <SelectItem value="открытая">открытая</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Обработка...' : (tournament ? 'Сохранить изменения' : 'Создать турнир')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;