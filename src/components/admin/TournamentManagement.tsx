import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tournament, CreateTournamentData } from './types';
import TournamentForm from './TournamentForm';

interface TournamentManagementProps {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  isEditingTournament: boolean;
  isCreatingTournament: boolean;
  loading: boolean;
  getStatusBadgeColor: (status: string) => string;
  setSelectedTournament: (tournament: Tournament | null) => void;
  setIsEditingTournament: (editing: boolean) => void;
  setIsCreatingTournament: (creating: boolean) => void;
  createTournament: (data: CreateTournamentData) => Promise<void>;
  updateTournament: (data: CreateTournamentData & { id: number }) => Promise<void>;
}

const TournamentManagement: React.FC<TournamentManagementProps> = ({
  tournaments,
  selectedTournament,
  isEditingTournament,
  isCreatingTournament,
  loading,
  getStatusBadgeColor,
  setSelectedTournament,
  setIsEditingTournament,
  setIsCreatingTournament,
  createTournament,
  updateTournament
}) => {
  return (
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
                <div key={tournament.id} className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{tournament.name}</h3>
                        <Badge className={getStatusBadgeColor(tournament.status)}>
                          {tournament.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          ID: {tournament.id}
                        </Badge>
                      </div>
                      {tournament.description && (
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          {tournament.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTournament(tournament);
                        setIsEditingTournament(true);
                      }}
                      className="ml-4"
                    >
                      <Icon name="Edit" size={16} className="mr-1" />
                      Редактировать
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        Дата и время
                      </h4>
                      <div className="text-gray-600 space-y-1">
                        <p><strong>Дата:</strong> {new Date(tournament.start_date).toLocaleDateString('ru-RU', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                        <p><strong>Время:</strong> {tournament.start_time_msk} МСК</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-1">
                        <Icon name="Settings" size={14} />
                        Формат игры
                      </h4>
                      <div className="text-gray-600 space-y-1">
                        <p><strong>Тип:</strong> {tournament.tournament_type === 'swiss' ? 'Швейцарская система' : 
                                                   tournament.tournament_type === 'round_robin' ? 'Круговая система' :
                                                   tournament.tournament_type === 'knockout' ? 'На выбывание' :
                                                   tournament.tournament_type === 'arena' ? 'Арена' : tournament.tournament_type}</p>
                        <p><strong>Контроль времени:</strong> {tournament.time_control}</p>
                        <p><strong>Количество туров:</strong> {tournament.rounds}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-1">
                        <Icon name="Users" size={14} />
                        Участники
                      </h4>
                      <div className="text-gray-600 space-y-1">
                        <p><strong>Максимум:</strong> {tournament.max_participants} человек</p>
                        <p><strong>Возрастная категория:</strong> {tournament.age_category}</p>
                        <p><strong>Взнос:</strong> {tournament.entry_fee > 0 ? `${tournament.entry_fee} руб.` : 'Бесплатно'}</p>
                      </div>
                    </div>
                  </div>
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
            await updateTournament({
              ...data,
              id: selectedTournament.id
            });
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
  );
};

export default TournamentManagement;