import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ResultsPageProps {
  selectedTournament: any;
  onTournamentSelect: (tournament: any) => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  selectedTournament,
  onTournamentSelect
}) => {
  // Мок данные турниров для результатов
  const availableTournaments = [
    { id: '1', name: 'Весенний турнир 2024', date: '2024-03-15', status: 'finished' },
    { id: '2', name: 'Летний чемпионат', date: '2024-06-20', status: 'finished' },
    { id: '3', name: 'Осенний кубок', date: '2024-09-10', status: 'active' }
  ];

  // Мок результаты
  const mockResults = [
    { place: 1, name: 'Иванов Максим', points: 4.5, rating: 1650, performance: 1720 },
    { place: 2, name: 'Петрова Анна', points: 4.0, rating: 1580, performance: 1680 },
    { place: 3, name: 'Сидоров Олег', points: 3.5, rating: 1520, performance: 1590 },
    { place: 4, name: 'Козлова Мария', points: 3.0, rating: 1480, performance: 1520 },
    { place: 5, name: 'Морозов Игорь', points: 2.5, rating: 1420, performance: 1480 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-6">
          Результаты турниров
        </h1>
        <p className="text-xl text-gray-600 font-body">
          Просматривайте итоги завершенных соревнований
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Выберите турнир</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableTournaments.map((tournament) => (
                <Button
                  key={tournament.id}
                  variant={selectedTournament?.id === tournament.id ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => onTournamentSelect(tournament)}
                >
                  <Icon name="Trophy" size={16} className="mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">{tournament.name}</div>
                    <div className="text-xs opacity-70">{tournament.date}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedTournament ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Award" size={20} className="text-primary" />
                  {selectedTournament.name} - Итоговая таблица
                </CardTitle>
                <CardDescription>
                  Результаты турнира от {selectedTournament.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Место</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Игрок</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-600">Очки</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-600">Рейтинг</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-600">Перф.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockResults.map((result, index) => (
                        <tr
                          key={index}
                          className={`border-b hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50' : ''}`}
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
                            {result.place}
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            {result.name}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-900">
                            {result.points}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-600">
                            {result.rating}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-600">
                            {result.performance}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Icon name="Trophy" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Выберите турнир</h3>
                <p className="text-gray-600">
                  Выберите турнир из списка слева для просмотра результатов
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;