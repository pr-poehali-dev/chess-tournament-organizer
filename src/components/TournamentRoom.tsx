import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface Tournament {
  id: string;
  name: string;
  description: string;
  status: 'waiting' | 'active' | 'finished';
  participants: string[];
  startDate: string;
  format: 'single_elimination' | 'round_robin' | 'swiss';
  timeControl: string;
}

interface TournamentStanding {
  playerId: string;
  playerName: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  games: number;
  performance: number;
}

interface Match {
  id: string;
  player1: string;
  player2: string;
  result: '1-0' | '0-1' | '1/2-1/2' | null;
  round: number;
  status: 'scheduled' | 'in_progress' | 'finished';
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
}

interface TournamentRoomProps {
  tournamentId: string;
  currentUser: string;
  onBack: () => void;
}

const TournamentRoom: React.FC<TournamentRoomProps> = ({
  tournamentId,
  currentUser,
  onBack
}) => {
  // Состояния компонента
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<TournamentStanding[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentRound, setCurrentRound] = useState(4);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Проверка авторизации участника
  useEffect(() => {
    checkAuthorization();
    loadTournamentData();
    loadChatMessages();
    
    // Симуляция реального времени - обновление каждые 30 секунд
    const interval = setInterval(() => {
      loadTournamentData();
      loadChatMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, [tournamentId, currentUser]);

  const checkAuthorization = () => {
    // Симуляция проверки авторизации
    const mockTournament: Tournament = {
      id: tournamentId,
      name: "Чемпионат Клуба «Белая Ладья»",
      description: "Швейцарская система, 9 туров. Контроль времени: 15 минут + 10 секунд на ход.",
      status: 'active',
      participants: [
        currentUser, 
        'Петров Александр Сергеевич', 
        'Иванова Мария Владимировна', 
        'Сидоров Дмитрий Александрович', 
        'Козлова Елена Павловна', 
        'Морозов Игорь Михайлович', 
        'Лебедева Анна Леонидовна', 
        'Новиков Сергей Николаевич',
        'Волков Андрей Петрович',
        'Смирнова Ольга Викторовна'
      ],
      startDate: new Date().toISOString(),
      format: 'swiss',
      timeControl: '15+10'
    };

    if (mockTournament.participants.includes(currentUser)) {
      setIsAuthorized(true);
      setTournament(mockTournament);
    } else {
      setIsAuthorized(false);
    }
  };

  const loadTournamentData = () => {
    // Убираем проверку isAuthorized, так как данные всегда нужно загружать

    // Реалистичная турнирная таблица после 3 туров (10 игроков)
    const mockStandings: TournamentStanding[] = [
      {
        playerId: 'Петров Александр Сергеевич',
        playerName: 'Петров Александр Сергеевич',
        points: 3.0,
        wins: 3,
        losses: 0,
        draws: 0,
        games: 3,
        performance: 2200
      },
      {
        playerId: 'Иванова Мария Владимировна',
        playerName: 'Иванова Мария Владимировна',
        points: 2.5,
        wins: 2,
        losses: 0,
        draws: 1,
        games: 3,
        performance: 2050
      },
      {
        playerId: currentUser,
        playerName: currentUser,
        points: 2.5,
        wins: 2,
        losses: 0,
        draws: 1,
        games: 3,
        performance: 2040
      },
      {
        playerId: 'Сидоров Дмитрий Александрович',
        playerName: 'Сидоров Дмитрий Александрович',
        points: 2.0,
        wins: 2,
        losses: 1,
        draws: 0,
        games: 3,
        performance: 1900
      },
      {
        playerId: 'Морозов Игорь Михайлович',
        playerName: 'Морозов Игорь Михайлович',
        points: 2.0,
        wins: 1,
        losses: 0,
        draws: 2,
        games: 3,
        performance: 1880
      },
      {
        playerId: 'Козлова Елена Павловна',
        playerName: 'Козлова Елена Павловна',
        points: 1.5,
        wins: 1,
        losses: 1,
        draws: 1,
        games: 3,
        performance: 1750
      },
      {
        playerId: 'Волков Андрей Петрович',
        playerName: 'Волков Андрей Петрович',
        points: 1.5,
        wins: 1,
        losses: 1,
        draws: 1,
        games: 3,
        performance: 1720
      },
      {
        playerId: 'Лебедева Анна Леонидовна',
        playerName: 'Лебедева Анна Леонидовна',
        points: 1.0,
        wins: 1,
        losses: 2,
        draws: 0,
        games: 3,
        performance: 1650
      },
      {
        playerId: 'Новиков Сергей Николаевич',
        playerName: 'Новиков Сергей Николаевич',
        points: 0.5,
        wins: 0,
        losses: 2,
        draws: 1,
        games: 3,
        performance: 1500
      },
      {
        playerId: 'Смирнова Ольга Викторовна',
        playerName: 'Смирнова Ольга Викторовна',
        points: 0.0,
        wins: 0,
        losses: 3,
        draws: 0,
        games: 3,
        performance: 1400
      }
    ];

    setStandings(mockStandings);

    // Матчи 4-го тура (текущего)
    const mockMatches: Match[] = [
      {
        id: '1',
        player1: 'Петров Александр Сергеевич',
        player2: 'Иванова Мария Владимировна',
        result: null,
        round: currentRound,
        status: 'in_progress'
      },
      {
        id: '2',
        player1: currentUser,
        player2: 'Сидоров Дмитрий Александрович',
        result: null,
        round: currentRound,
        status: 'in_progress'
      },
      {
        id: '3',
        player1: 'Морозов Игорь Михайлович',
        player2: 'Козлова Елена Павловна',
        result: '1/2-1/2',
        round: currentRound,
        status: 'finished'
      },
      {
        id: '4',
        player1: 'Волков Андрей Петрович',
        player2: 'Лебедева Анна Леонидовна',
        result: '1-0',
        round: currentRound,
        status: 'finished'
      },
      {
        id: '5',
        player1: 'Новиков Сергей Николаевич',
        player2: 'Смирнова Ольга Викторовна',
        result: null,
        round: currentRound,
        status: 'scheduled'
      }
    ];

    setMatches(mockMatches);
  };

  const loadChatMessages = () => {
    // Убираем проверку isAuthorized, так как сообщения всегда нужно загружать

    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        username: 'Администратор',
        message: 'Добро пожаловать в турнирный зал! Удачи всем участникам!',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isAdmin: true
      },
      {
        id: '2',
        username: 'Петров Александр Сергеевич',
        message: 'Всем привет! Хороший турнир получается 💪',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isAdmin: false
      },
      {
        id: '3',
        username: 'Иванова Мария Владимировна',
        message: 'Да, очень интересная борьба в лидирующей группе!',
        timestamp: new Date(Date.now() - 2700000).toISOString(),
        isAdmin: false
      },
      {
        id: '4',
        username: 'Сидоров Дмитрий Александрович',
        message: 'Кто-то помнит время партий? Сколько у нас остается?',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isAdmin: false
      },
      {
        id: '5',
        username: 'Администратор',
        message: '15 минут + 10 секунд на ход. Не забывайте следить за временем!',
        timestamp: new Date(Date.now() - 1500000).toISOString(),
        isAdmin: true
      },
      {
        id: '6',
        username: 'Морозов Игорь Михайлович',
        message: 'Спасибо за напоминание! Удачи всем в 4-м туре 🏆',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        isAdmin: false
      },
      {
        id: '7',
        username: 'Козлова Елена Павловна',
        message: 'Когда планируется следующий тур?',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        isAdmin: false
      },
      {
        id: '8',
        username: 'Администратор',
        message: '5-й тур начнется через 30 минут после завершения всех партий текущего тура.',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        isAdmin: true
      }
    ];

    setChatMessages(mockMessages);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      username: currentUser,
      message: newMessage,
      timestamp: new Date().toISOString(),
      isAdmin: false
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Функция для сокращения ФИО до фамилии и имени
  const formatUsername = (fullName: string) => {
    if (fullName === 'Администратор') return fullName;
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`; // Фамилия Имя
    }
    return fullName; // Если меньше 2 частей, возвращаем как есть
  };

  const getStatusBadge = (status: Tournament['status']) => {
    const statusMap = {
      waiting: { label: 'Ожидание', variant: 'secondary' as const, className: '' },
      active: { label: 'Активный', variant: 'default' as const, className: 'bg-primary text-black' },
      finished: { label: 'Завершён', variant: 'outline' as const, className: '' }
    };
    return statusMap[status];
  };

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
          {/* Информация о турнире */}
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

          {/* Чат */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Icon name="MessageSquare" size={20} className="text-primary" />
                Чат турнира
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64 p-4">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          msg.isAdmin ? 'text-primary' : 'text-blue-600'
                        }`}>
                          {msg.isAdmin && <Icon name="Shield" size={14} className="inline mr-1" />}
                          {formatUsername(msg.username)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Separator />
              <div className="p-4 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Написать сообщение..."
                  className="bg-white border-gray-200"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button
                  onClick={sendMessage}
                  size="sm"
                  className="shrink-0 bg-primary hover:bg-primary/90 text-black"
                  disabled={!newMessage.trim()}
                >
                  <Icon name="Send" size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Турнирная таблица */}
        <Card className="lg:col-span-3 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Icon name="BarChart3" size={20} className="text-primary" />
              Турнирная таблица
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="p-4">
                <div className="grid grid-cols-7 gap-2 text-sm font-medium text-gray-500 mb-3">
                  <div>Место</div>
                  <div>Игрок</div>
                  <div>Очки</div>
                  <div>Партии</div>
                  <div>+/-/=</div>
                  <div>Рейтинг</div>
                  <div>Перф.</div>
                </div>
                <Separator className="mb-3" />
                {standings.map((player, index) => (
                  <div
                    key={player.playerId}
                    className={`grid grid-cols-7 gap-2 text-sm py-2 rounded px-2 ${
                      player.playerId === currentUser ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="text-gray-900 font-medium">{index + 1}</div>
                    <div className="text-gray-900 font-medium">
                      {formatUsername(player.playerName)}
                      {player.playerId === currentUser && (
                        <Badge className="ml-2 text-xs bg-primary text-black">Вы</Badge>
                      )}
                    </div>
                    <div className="text-gray-900 font-medium">{player.points.toFixed(1)}</div>
                    <div className="text-gray-600">{player.games}</div>
                    <div className="text-gray-600">
                      <span className="text-green-600">{player.wins}</span>/
                      <span className="text-red-600">{player.losses}</span>/
                      <span className="text-orange-500">{player.draws}</span>
                    </div>
                    <div className="text-gray-600">1650</div>
                    <div className="text-gray-600">{player.performance}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Правая колонка: Текущие матчи */}
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
      </div>
    </div>
  );
};

export default TournamentRoom;