import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tournament } from './types';

interface TournamentInfoProps {
  tournament: Tournament;
  currentRound: number;
}

const getStatusBadge = (status: Tournament['status']) => {
  const statusMap = {
    waiting: { label: 'Ожидание', variant: 'secondary' as const, className: '' },
    active: { label: 'Активный', variant: 'default' as const, className: 'bg-primary text-black' },
    finished: { label: 'Завершён', variant: 'outline' as const, className: '' }
  };
  return statusMap[status];
};

const TournamentInfo: React.FC<TournamentInfoProps> = ({ tournament, currentRound }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
            <Icon name="Trophy" size={24} className="text-primary" />
            {tournament.name}
          </CardTitle>
          <Badge 
            variant={getStatusBadge(tournament.status).variant}
            className={getStatusBadge(tournament.status).className}
          >
            {getStatusBadge(tournament.status).label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{tournament.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Формат:</span>
            <p className="text-gray-900 font-medium">
              {tournament.format === 'round_robin' ? 'Круговая система' : 
               tournament.format === 'swiss' ? 'Швейцарская система' : 'На выбывание'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Контроль времени:</span>
            <p className="text-gray-900 font-medium">{tournament.timeControl}</p>
          </div>
          <div>
            <span className="text-gray-500">Тур:</span>
            <p className="text-gray-900 font-medium">{currentRound}</p>
          </div>
          <div>
            <span className="text-gray-500">Участников:</span>
            <p className="text-gray-900 font-medium">{tournament.participants.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentInfo;