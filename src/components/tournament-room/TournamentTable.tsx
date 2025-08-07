import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { TournamentStanding } from './types';

interface TournamentTableProps {
  standings: TournamentStanding[];
  currentUser: string;
}

const formatUsernameShort = (fullName: string) => {
  if (fullName === 'Администратор') return fullName;
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 3) {
    return `${parts[0]} ${parts[1][0]}.${parts[2][0]}.`; // Фамилия И.О.
  } else if (parts.length >= 2) {
    return `${parts[0]} ${parts[1][0]}.`; // Фамилия И.
  }
  return fullName;
};

const TournamentTable: React.FC<TournamentTableProps> = ({ standings, currentUser }) => {
  return (
    <Card className="lg:col-span-3 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <Icon name="BarChart3" size={20} className="text-primary" />
          Турнирная таблица
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Место</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Игрок</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Очки</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">1</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">2</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">3</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">4</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">5</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Рейтинг</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Перф.</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((player, index) => (
                  <tr
                    key={player.playerId}
                    className={`border-b hover:bg-gray-50 ${
                      player.playerId === currentUser ? 'bg-primary/10' : ''
                    } ${index < 3 ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {index < 3 && (
                        <Icon 
                          name={index === 0 ? "Crown" : index === 1 ? "Medal" : "Award"} 
                          size={16} 
                          className={`inline mr-2 ${
                            index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-400' : 
                            'text-orange-600'
                          }`}
                        />
                      )}
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                      {formatUsernameShort(player.playerName)}
                      {player.playerId === currentUser && (
                        <Badge className="ml-2 text-xs bg-primary text-black">Вы</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-gray-900">
                      {player.points.toFixed(1)}
                    </td>
                    {player.roundResults && player.roundResults.map((result, roundIndex) => (
                      <td key={roundIndex} className="py-3 px-4 text-center">
                        {result === '1' && (
                          <span className="inline-block w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold">
                            1
                          </span>
                        )}
                        {result === '0' && (
                          <span className="inline-block w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-xs font-bold">
                            0
                          </span>
                        )}
                        {result === '0.5' && (
                          <span className="inline-block w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center text-xs font-bold">
                            ½
                          </span>
                        )}
                        {result === '-' && (
                          <span className="text-gray-400 text-lg">-</span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-center text-gray-600">1650</td>
                    <td className="py-3 px-4 text-center text-gray-600">{player.performance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentTable;