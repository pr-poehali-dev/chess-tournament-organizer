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
  onDateChange: (date: Date | undefined) => void;
  onTournamentRegistration: (tournament: Tournament) => void;
  onEnterTournamentRoom: (tournamentId: string) => void;
}

const TournamentsPage: React.FC<TournamentsPageProps> = ({
  upcomingTournaments,
  selectedDate,
  userRole,
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
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingTournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-heading">{tournament.title}</CardTitle>
                    <Badge 
                      variant={tournament.status === 'upcoming' ? 'default' : 'secondary'}
                      className={tournament.status === 'upcoming' ? 'bg-primary text-black' : ''}
                    >
                      {tournament.status === 'upcoming' ? 'Открыт' : 
                       tournament.status === 'active' ? 'Идёт' : 'Завершён'}
                    </Badge>
                  </div>
                  <CardDescription className="font-body">
                    {tournament.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Icon name="Calendar" size={14} className="mr-1" />
                        {tournament.date}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Icon name="Clock" size={14} className="mr-1" />
                        {tournament.timeControl}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Icon name="Users" size={14} className="mr-1" />
                        {tournament.participants}/{tournament.maxParticipants}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Icon name="Trophy" size={14} className="mr-1" />
                        {tournament.prizePool}₽
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Взнос:</span>
                        <span className="font-semibold text-primary">{tournament.entryFee}₽</span>
                      </div>
                      
                      {tournament.status === 'active' ? (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => onEnterTournamentRoom(tournament.id)}
                        >
                          <Icon name="Play" size={16} className="mr-2" />
                          Войти в турнир
                        </Button>
                      ) : tournament.status === 'upcoming' ? (
                        <Button 
                          className="w-full bg-primary hover:bg-gold-600 text-black"
                          onClick={() => onTournamentRegistration(tournament)}
                        >
                          <Icon name="UserPlus" size={16} className="mr-2" />
                          Зарегистрироваться
                        </Button>
                      ) : (
                        <Button className="w-full" disabled>
                          Турнир завершён
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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