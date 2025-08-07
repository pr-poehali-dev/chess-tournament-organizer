import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Match } from './types';

interface CurrentMatchesProps {
  matches: Match[];
}

const formatUsername = (fullName: string) => {
  if (fullName === 'Администратор') return fullName;
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`; // Фамилия Имя
  }
  return fullName; // Если меньше 2 частей, возвращаем как есть
};

const CurrentMatches: React.FC<CurrentMatchesProps> = ({ matches }) => {
  return (
    <Card className="lg:col-span-1 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <Icon name="Clock" size={20} className="text-primary" />
          Текущий тур
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">Тур {match.round}</div>
                <Badge
                  variant={match.status === 'in_progress' ? 'default' : 'secondary'}
                  className={`text-xs ${
                    match.status === 'in_progress' ? 'bg-primary text-black' : ''
                  }`}
                >
                  {match.status === 'in_progress' ? 'Играют' : 
                   match.status === 'finished' ? 'Завершено' : 'Ожидание'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-900 text-sm">
                  <div>{formatUsername(match.player1)}</div>
                  <div className="text-gray-500">vs</div>
                  <div>{formatUsername(match.player2)}</div>
                </div>
                <div className="text-right">
                  {match.result ? (
                    <div className="text-gray-900 font-medium">{match.result}</div>
                  ) : (
                    <div className="text-primary text-sm animate-pulse">В игре...</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentMatches;