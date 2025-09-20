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
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <Icon name="Trophy" size={20} />
                Список турниров ({tournaments.length})
              </CardTitle>
              <CardDescription className="mb-3">
                Управление турнирами и соревнованиями
              </CardDescription>
              
              {/* Общая статистика */}
              {tournaments.length > 0 && (
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Play" size={14} className="text-green-600" />
                    <span className="text-gray-600">
                      Активных: <strong>{tournaments.filter(t => t.status === 'active').length}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="UserPlus" size={14} className="text-blue-600" />
                    <span className="text-gray-600">
                      Регистрация: <strong>{tournaments.filter(t => t.status === 'registration').length}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle" size={14} className="text-purple-600" />
                    <span className="text-gray-600">
                      Завершено: <strong>{tournaments.filter(t => t.status === 'completed').length}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={14} className="text-orange-600" />
                    <span className="text-gray-600">
                      Всего участников: <strong>
                        {tournaments.reduce((sum, t) => sum + (t.registered_count || 0), 0)}
                      </strong>
                    </span>
                  </div>
                  {tournaments.some(t => t.entry_fee > 0) && (
                    <div className="flex items-center gap-2">
                      <Icon name="DollarSign" size={14} className="text-green-600" />
                      <span className="text-gray-600">
                        Общий сбор: <strong>
                          {tournaments.reduce((sum, t) => sum + ((t.entry_fee || 0) * (t.registered_count || 0)), 0).toLocaleString('ru-RU')} руб.
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
                        {tournament.created_at && (
                          <p className="text-xs text-gray-500">
                            <strong>Создан:</strong> {new Date(tournament.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        )}
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
                        <p><strong>Туров:</strong> {tournament.completed_rounds !== undefined ? 
                          `${tournament.completed_rounds}/${tournament.rounds}` : tournament.rounds}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-1">
                        <Icon name="Users" size={14} />
                        Участники
                      </h4>
                      <div className="text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <span><strong>Зарегистрировано:</strong></span>
                          <Badge variant="secondary" className="text-xs">
                            {tournament.registered_count || 0}/{tournament.max_participants}
                          </Badge>
                        </div>
                        {tournament.participants_count !== undefined && (
                          <p><strong>Участвуют:</strong> {tournament.participants_count} человек</p>
                        )}
                        <p><strong>Возраст:</strong> {tournament.age_category}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-1">
                        <Icon name="DollarSign" size={14} />
                        Финансы и статистика
                      </h4>
                      <div className="text-gray-600 space-y-1">
                        <p><strong>Взнос:</strong> {tournament.entry_fee > 0 ? `${tournament.entry_fee} руб.` : 'Бесплатно'}</p>
                        {tournament.entry_fee > 0 && tournament.registered_count && (
                          <p className="text-green-600">
                            <strong>Сбор:</strong> {(tournament.entry_fee * tournament.registered_count).toLocaleString('ru-RU')} руб.
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span><strong>Заполненность:</strong></span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all" 
                              style={{
                                width: `${Math.min(100, ((tournament.registered_count || 0) / tournament.max_participants) * 100)}%`
                              }}
                            />
                          </div>
                          <span className="text-xs">
                            {Math.round(((tournament.registered_count || 0) / tournament.max_participants) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Быстрые действия */}
                  {tournament.status === 'registration' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Icon name="Clock" size={12} />
                          <span>Регистрация открыта</span>
                        </div>
                        {tournament.registered_count && tournament.registered_count >= tournament.max_participants && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Icon name="AlertTriangle" size={12} />
                            <span>Мест нет</span>
                          </div>
                        )}
                        {tournament.registered_count && tournament.registered_count < 8 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <Icon name="Users" size={12} />
                            <span>Мало участников</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {tournament.status === 'active' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1 text-green-600">
                          <Icon name="Play" size={12} />
                          <span>Турнир идет</span>
                        </div>
                        {tournament.completed_rounds !== undefined && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Icon name="Target" size={12} />
                            <span>Тур {tournament.completed_rounds + 1} из {tournament.rounds}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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