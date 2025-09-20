import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminData } from './useAdminData';
import UserManagement from './UserManagement';
import TournamentManagement from './TournamentManagement';

const AdminPanel = () => {
  const {
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
    setSelectedUser,
    setSelectedTournament,
    setIsEditingUser,
    setIsEditingTournament,
    setIsCreatingTournament,
    
    // Functions
    calculateAge,
    updateUser,
    createTournament,
    updateTournament,
    getRoleBadgeColor,
    getStatusBadgeColor
  } = useAdminData();

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
          <UserManagement
            users={users}
            selectedUser={selectedUser}
            isEditingUser={isEditingUser}
            loading={loading}
            calculateAge={calculateAge}
            getRoleBadgeColor={getRoleBadgeColor}
            setSelectedUser={setSelectedUser}
            setIsEditingUser={setIsEditingUser}
            updateUser={updateUser}
          />
        </TabsContent>

        {/* Управление турнирами */}
        <TabsContent value="tournaments" className="space-y-6">
          <TournamentManagement
            tournaments={tournaments}
            selectedTournament={selectedTournament}
            isEditingTournament={isEditingTournament}
            isCreatingTournament={isCreatingTournament}
            loading={loading}
            getStatusBadgeColor={getStatusBadgeColor}
            setSelectedTournament={setSelectedTournament}
            setIsEditingTournament={setIsEditingTournament}
            setIsCreatingTournament={setIsCreatingTournament}
            createTournament={createTournament}
            updateTournament={updateTournament}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;