import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Tournament } from './types';
import SwissTournamentDemo from '@/components/SwissTournamentDemo';
import { useAuth } from '@/contexts/AuthContext';

interface TournamentsPageProps {
  upcomingTournaments: Tournament[];
  selectedDate: Date | undefined;
  userRole: string;
  loading?: boolean;
  onDateChange: (date: Date | undefined) => void;
  onTournamentRegistration: (tournament: Tournament) => void;
  onEnterTournamentRoom: (tournamentId: string) => void;
}

const TournamentsPage: React.FC<TournamentsPageProps> = ({
  upcomingTournaments,
  selectedDate,
  userRole,
  loading = false,
  onDateChange,
  onTournamentRegistration,
  onEnterTournamentRoom
}) => {
  const { isLoggedIn } = useAuth();
  const [showSwissDemo, setShowSwissDemo] = useState(false);
  const { isAdmin } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-6">
          Турниры
        </h1>
        <p className="text-xl text-gray-600 font-body">
          Участвуйте в захватывающих шахматных соревнованиях
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-8">
              <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Загружаем турниры...</p>
            </div>
          ) : upcomingTournaments.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Trophy" size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Турниры не найдены</h3>
              <p className="text-gray-500">В настоящее время нет доступных турниров</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingTournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl font-heading text-gray-900">{tournament.title}</CardTitle>
                        <Badge 
                          variant={tournament.status === 'upcoming' ? 'default' : 'secondary'}
                          className={tournament.status === 'upcoming' ? 'bg-primary text-black' : 
                                   tournament.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {tournament.status === 'upcoming' ? 'Регистрация открыта' : 
                           tournament.status === 'active' ? 'Турнир идёт' : 'Завершён'}
                        </Badge>
                      </div>
                      {tournament.description && (
                        <CardDescription className="font-body text-gray-600 leading-relaxed">
                          {tournament.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Дата и время */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Icon name="Calendar" size={16} className="text-primary" />
                        Дата и время
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Icon name="CalendarDays" size={14} />
                          <span><strong>Дата:</strong> {tournament.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Clock" size={14} />
                          <span><strong>Время:</strong> {tournament.time}</span>
                        </div>
                        {tournament.registrationDeadline && (
                          <div className="flex items-center gap-2">
                            <Icon name="AlertCircle" size={14} />
                            <span><strong>Регистрация до:</strong> {tournament.registrationDeadline}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Формат и правила */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Icon name="Settings" size={16} className="text-primary" />
                        Формат турнира
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Icon name="Gamepad2" size={14} />
                          <span><strong>Система:</strong> {tournament.format || tournament.tournamentType || 'Швейцарская'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Timer" size={14} />
                          <span><strong>Контроль времени:</strong> {tournament.timeControl}</span>
                        </div>
                        {tournament.rounds && (
                          <div className="flex items-center gap-2">
                            <Icon name="RotateCcw" size={14} />
                            <span><strong>Количество туров:</strong> {tournament.rounds}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Участники и категории */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Icon name="Users" size={16} className="text-primary" />
                        Участники
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Icon name="UserCheck" size={14} />
                          <div className="flex items-center gap-2">
                            <span><strong>Зарегистрировано:</strong></span>
                            <Badge variant="secondary" className="text-xs">
                              {tournament.participants}/{tournament.maxParticipants}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Baby" size={14} />
                          <span><strong>Возрастная категория:</strong> {tournament.ageCategory}</span>
                        </div>
                        {tournament.location && (
                          <div className="flex items-center gap-2">
                            <Icon name="MapPin" size={14} />
                            <span><strong>Место:</strong> {tournament.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Заполненность турнира */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Заполненность турнира</span>
                      <span className="text-sm text-gray-600">
                        {Math.round((tournament.participants / tournament.maxParticipants) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{
                          width: `${Math.min(100, (tournament.participants / tournament.maxParticipants) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Финансовая информация и действия */}
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Взнос:</span>
                        <span className="font-semibold text-lg text-primary">
                          {tournament.entryFee > 0 ? `${tournament.entryFee}₽` : 'Бесплатно'}
                        </span>
                      </div>
                      {tournament.prizePool && tournament.prizePool > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Призовой фонд:</span>
                          <span className="font-semibold text-green-600">{tournament.prizePool.toLocaleString('ru-RU')}₽</span>
                        </div>
                      )}
                      {tournament.organizer && (
                        <div className="text-xs text-gray-500">
                          <strong>Организатор:</strong> {tournament.organizer}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-end">
                      {tournament.status === 'active' ? (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => onEnterTournamentRoom(tournament.id)}
                        >
                          <Icon name="Play" size={16} className="mr-2" />
                          Войти в турнир
                        </Button>
                      ) : tournament.status === 'upcoming' ? (
                        <>
                          {tournament.participants >= tournament.maxParticipants ? (
                            <Button className="w-full" disabled>
                              <Icon name="UserX" size={16} className="mr-2" />
                              Мест нет
                            </Button>
                          ) : (
                            <Button 
                              className="w-full bg-primary hover:bg-gold-600 text-black"
                              onClick={() => onTournamentRegistration(tournament)}
                            >
                              <Icon name="UserPlus" size={16} className="mr-2" />
                              Зарегистрироваться
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button className="w-full" disabled>
                          <Icon name="Trophy" size={16} className="mr-2" />
                          Турнир завершён
                        </Button>
                      )}
                      
                      {tournament.participants < 8 && tournament.status === 'upcoming' && (
                        <p className="text-xs text-orange-600 mt-2 text-center">
                          ⚠️ Нужно минимум 8 участников для проведения турнира
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Дополнительная информация */}
                  {(tournament.rules || tournament.contactInfo) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <details className="group">
                        <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-primary">
                          <Icon name="Info" size={14} />
                          Дополнительная информация
                          <Icon name="ChevronDown" size={14} className="group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="mt-3 space-y-2 text-sm text-gray-600">
                          {tournament.rules && (
                            <div>
                              <strong>Правила:</strong> {tournament.rules}
                            </div>
                          )}
                          {tournament.contactInfo && (
                            <div>
                              <strong>Контакты:</strong> {tournament.contactInfo}
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Calendar" size={20} className="text-primary" />
                Календарь турниров
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={onDateChange}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Швейцарская система</CardTitle>
              <CardDescription>
                Изучите принципы проведения турниров
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showSwissDemo} onOpenChange={setShowSwissDemo}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-primary hover:bg-gold-600 text-black">
                    <Icon name="BookOpen" size={16} className="mr-2" />
                    Демо швейцарской системы
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Швейцарская система проведения турниров</DialogTitle>
                    <DialogDescription>
                      Интерактивная демонстрация с реальным турниром
                    </DialogDescription>
                  </DialogHeader>
                  <SwissTournamentDemo />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Управление турнирами</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Создать турнир
                </Button>
                <Button className="w-full" variant="outline">
                  <Icon name="Settings" size={16} className="mr-2" />
                  Управление
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentsPage;