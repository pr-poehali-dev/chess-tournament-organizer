import { useState, useEffect } from 'react';
import { authService, type User } from '@/services/authApi';
import { adminApiService } from '@/services/adminApi';
import { useToast } from '@/components/ui/use-toast';
import { Tournament, CreateTournamentData } from './types';

export const useAdminData = () => {
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

  // Обновление турнира
  const updateTournament = async (tournamentData: CreateTournamentData & { id: number }) => {
    try {
      setLoading(true);
      const updated = await adminApiService.updateTournament(tournamentData);
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

  return {
    // State
    users,
    tournaments,
    selectedUser,
    selectedTournament,
    isEditingUser,
    isEditingTournament,
    isCreatingTournament,
    loading,
    
    // Setters
    setUsers,
    setTournaments,
    setSelectedUser,
    setSelectedTournament,
    setIsEditingUser,
    setIsEditingTournament,
    setIsCreatingTournament,
    setLoading,
    
    // Functions
    calculateAge,
    loadUsers,
    loadTournaments,
    updateUser,
    createTournament,
    updateTournament,
    getRoleBadgeColor,
    getStatusBadgeColor
  };
};