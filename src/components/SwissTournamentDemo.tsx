import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SwissTournamentManager from '@/components/SwissTournamentManager';

const SwissTournamentDemo: React.FC = () => {
  const [showManager, setShowManager] = useState(false);

  // Демонстрационные игроки
  const demoPlayers = [
    { id: '1', name: 'Петров Александр', rating: 1750 },
    { id: '2', name: 'Иванова Мария', rating: 1680 },
    { id: '3', name: 'Сидоров Дмитрий', rating: 1650 },
    { id: '4', name: 'Козлова Елена', rating: 1620 },
    { id: '5', name: 'Морозов Игорь', rating: 1580 },
    { id: '6', name: 'Лебедева Анна', rating: 1550 },
    { id: '7', name: 'Новиков Сергей', rating: 1520 },
    { id: '8', name: 'Волков Андрей', rating: 1490 }
  ];

  if (showManager) {
    return (
      <SwissTournamentManager 
        initialPlayers={demoPlayers}
        onTournamentComplete={(standings) => {
          console.log('Tournament completed:', standings);
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Швейцарская система проведения турниров
        </h1>
        <p className="text-lg text-gray-600">
          Современный и справедливый способ организации шахматных соревнований
        </p>
      </div>

      {/* Что такое швейцарская система */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Info" size={20} className="text-primary" />
            Что такое швейцарская система?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            Швейцарская система — это способ проведения турниров, при котором участники играют 
            заранее определенное количество туров, но не играют со всеми остальными участниками. 
            Жеребьевка каждого тура проводится на основе текущих результатов.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Преимущества:</h4>
              <ul className="text-sm space-y-1">
                <li>• Справедливое определение мест</li>
                <li>• Фиксированное количество туров</li>
                <li>• Интересная борьба до конца</li>
                <li>• Подходит для любого числа участников</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Особенности:</h4>
              <ul className="text-sm space-y-1">
                <li>• Жеребьевка по принципу близости очков</li>
                <li>• Исключение повторных встреч</li>
                <li>• Баланс цветов фигур</li>
                <li>• Коэффициенты для определения мест</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Принципы жеребьевки */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Shuffle" size={20} className="text-primary" />
            Принципы жеребьевки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge className="bg-primary text-black">1</Badge>
              <div>
                <h4 className="font-semibold">Первый тур</h4>
                <p className="text-sm text-gray-600">
                  Игроки делятся пополам по рейтингу. Первая половина играет белыми против второй.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="bg-primary text-black">2</Badge>
              <div>
                <h4 className="font-semibold">Последующие туры</h4>
                <p className="text-sm text-gray-600">
                  Игроки группируются по количеству очков. Внутри группы жеребьевка по рейтингу.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="bg-primary text-black">3</Badge>
              <div>
                <h4 className="font-semibold">Ограничения</h4>
                <p className="text-sm text-gray-600">
                  Исключаются повторные встречи. Стремление к балансу цветов для каждого игрока.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Коэффициенты */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} className="text-primary" />
            Дополнительные коэффициенты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">Коэффициент Бухгольца</h4>
              <p className="text-sm text-gray-700">
                Сумма очков всех противников игрока. Показывает силу соперников.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold mb-2">Зонненборн-Бергер</h4>
              <p className="text-sm text-gray-700">
                Взвешенная сумма очков противников. Учитывает результаты против каждого.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold mb-2">Порядок определения мест:</h4>
            <p className="text-sm text-gray-700">
              1. Количество очков → 2. Коэффициент Бухгольца → 3. Зонненборн-Бергер → 4. Рейтинг
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Демо-участники */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Демонстрационный турнир</CardTitle>
          <CardDescription>
            8 участников, готовых к турниру по швейцарской системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {demoPlayers.map((player, index) => (
              <div key={player.id} className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="font-medium text-sm">{player.name}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {player.rating}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="text-center space-y-3">
            <div className="text-sm text-gray-600">
              Рекомендуемое количество туров для 8 игроков: <strong>7 туров</strong>
            </div>
            
            <Button 
              onClick={() => setShowManager(true)}
              size="lg"
              className="bg-primary hover:bg-gold-600 text-black"
            >
              <Icon name="Play" size={20} className="mr-2" />
              Запустить демо-турнир
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Технические особенности */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Settings" size={20} className="text-primary" />
            Реализованные возможности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Алгоритмы:</h4>
              <ul className="text-sm space-y-1">
                <li>✅ Жеребьевка по швейцарской системе</li>
                <li>✅ Исключение повторных встреч</li>
                <li>✅ Баланс цветов фигур</li>
                <li>✅ Расчет коэффициентов</li>
                <li>✅ Обработка нечетного числа игроков</li>
                <li>✅ Снятие игроков с турнира</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Интерфейс:</h4>
              <ul className="text-sm space-y-1">
                <li>✅ Управление составом участников</li>
                <li>✅ Автоматическая жеребьевка туров</li>
                <li>✅ Ввод результатов партий</li>
                <li>✅ Турнирная таблица в реальном времени</li>
                <li>✅ История партий каждого игрока</li>
                <li>✅ Валидация турнирных данных</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwissTournamentDemo;