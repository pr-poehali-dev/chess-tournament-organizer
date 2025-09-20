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