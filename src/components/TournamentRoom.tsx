import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import TournamentInfo from './tournament-room/TournamentInfo';
import TournamentChat from './tournament-room/TournamentChat';
import TournamentTable from './tournament-room/TournamentTable';
import CurrentMatches from './tournament-room/CurrentMatches';
import { useTournamentData } from './tournament-room/useTournamentData';
import { TournamentRoomProps } from './tournament-room/types';

const TournamentRoom: React.FC<TournamentRoomProps> = ({
  tournamentId,
  currentUser,
  onBack
}) => {
  const {
    tournament,
    standings,
    matches,
    chatMessages,
    currentRound,
    isAuthorized,
    sendMessage
  } = useTournamentData(tournamentId, currentUser);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <Icon name="Lock" size={48} className="mx-auto mb-4 text-red-500" />
            <CardTitle className="text-xl text-gray-900">Доступ запрещён</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Вы не являетесь участником этого турнира
            </p>
            <Button onClick={onBack} variant="outline" className="w-full">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Вернуться к турнирам
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4 text-primary" />
          <p>Загружаем турнирный зал...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="text-gray-700 hover:bg-gray-50"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          К турнирам
        </Button>
        <div className="flex items-center gap-2 text-gray-600">
          <Icon name="Users" size={20} />
          <span className="text-sm">{tournament.participants.length} участников</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Левая колонка: Информация о турнире + Чат (20%) */}
        <div className="lg:col-span-1 space-y-6">
          <TournamentInfo tournament={tournament} currentRound={currentRound} />
          <TournamentChat 
            chatMessages={chatMessages} 
            currentUser={currentUser} 
            onSendMessage={sendMessage} 
          />
        </div>

        {/* Турнирная таблица (60%) */}
        <TournamentTable standings={standings} currentUser={currentUser} />

        {/* Правая колонка: Текущие матчи (20%) */}
        <CurrentMatches matches={matches} />
      </div>
    </div>
  );
};

export default TournamentRoom;