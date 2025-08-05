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
  const [currentRound, setCurrentRound] = useState(1);
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
      description: "Открытый турнир по шахматам в классическом контроле времени. Добро пожаловать!",
      status: 'active',
      participants: [currentUser, 'Александр_К', 'Мария_В', 'Дмитрий_С', 'Елена_П', 'Игорь_М', 'Анна_Л', 'Сергей_Н'],
      startDate: new Date().toISOString(),
      format: 'round_robin',
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
    if (!isAuthorized || !tournament) return;

    // Генерация турнирной таблицы
    const mockStandings: TournamentStanding[] = tournament.participants.map((player, index) => ({
      playerId: player,
      playerName: player,
      points: Math.random() * 5 + 1,
      wins: Math.floor(Math.random() * 3) + 1,
      losses: Math.floor(Math.random() * 2),
      draws: Math.floor(Math.random() * 2),
      games: Math.floor(Math.random() * 5) + 3,
      performance: Math.floor(Math.random() * 400) + 1600
    })).sort((a, b) => b.points - a.points);

    setStandings(mockStandings);

    // Генерация текущих матчей
    const mockMatches: Match[] = [
      {
        id: '1',
        player1: tournament.participants[0],
        player2: tournament.participants[1],
        result: null,
        round: currentRound,
        status: 'in_progress'
      },
      {
        id: '2',
        player1: tournament.participants[2],
        player2: tournament.participants[3],
        result: '1-0',
        round: currentRound,
        status: 'finished'
      }
    ];

    setMatches(mockMatches);
  };

  const loadChatMessages = () => {
    if (!isAuthorized) return;

    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        username: 'Администратор',
        message: 'Добро пожаловать в турнирный зал! Удачи всем участникам!',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isAdmin: true
      },
      {
        id: '2',
        username: 'Александр_К',
        message: 'Всем привет! Отличный турнир!',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isAdmin: false
      },
      {
        id: '3',
        username: 'Мария_В',
        message: 'Удачи всем в следующем туре!',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        isAdmin: false
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

  const getStatusBadge = (status: Tournament['status']) => {
    const statusMap = {
      waiting: { label: 'Ожидание', variant: 'secondary' as const },
      active: { label: 'Активный', variant: 'default' as const },
      finished: { label: 'Завершён', variant: 'outline' as const }
    };
    return statusMap[status];
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Icon name="Lock" size={48} className="mx-auto mb-4 text-red-500" />
            <CardTitle className="text-xl">Доступ запрещён</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4" />
          <p>Загружаем турнирный зал...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          К турнирам
        </Button>
        <div className="flex items-center gap-2">
          <Icon name="Users" size={20} />
          <span className="text-sm">{tournament.participants.length} участников</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Информация о турнире */}
        <Card className="lg:col-span-2 bg-white/10 border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Icon name="Trophy" size={24} />
                {tournament.name}
              </CardTitle>
              <Badge {...getStatusBadge(tournament.status)} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 mb-4">{tournament.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-white/60">Формат:</span>
                <p className="text-white font-medium">
                  {tournament.format === 'round_robin' ? 'Круговая система' : 'На выбывание'}
                </p>
              </div>
              <div>
                <span className="text-white/60">Контроль времени:</span>
                <p className="text-white font-medium">{tournament.timeControl}</p>
              </div>
              <div>
                <span className="text-white/60">Тур:</span>
                <p className="text-white font-medium">{currentRound}</p>
              </div>
              <div>
                <span className="text-white/60">Участников:</span>
                <p className="text-white font-medium">{tournament.participants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Чат */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Icon name="MessageSquare" size={20} />
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
                        msg.isAdmin ? 'text-yellow-400' : 'text-blue-400'
                      }`}>
                        {msg.isAdmin && <Icon name="Shield" size={14} className="inline mr-1" />}
                        {msg.username}
                      </span>
                      <span className="text-xs text-white/40">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm">{msg.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="bg-white/20" />
            <div className="p-4 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Написать сообщение..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button
                onClick={sendMessage}
                size="sm"
                className="shrink-0"
                disabled={!newMessage.trim()}
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Турнирная таблица */}
        <Card className="lg:col-span-2 bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Icon name="BarChart3" size={20} />
              Турнирная таблица
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="p-4">
                <div className="grid grid-cols-7 gap-2 text-sm font-medium text-white/60 mb-3">
                  <div>Место</div>
                  <div>Игрок</div>
                  <div>Очки</div>
                  <div>Партии</div>
                  <div>+/-/=</div>
                  <div>Рейтинг</div>
                  <div>Перф.</div>
                </div>
                <Separator className="bg-white/20 mb-3" />
                {standings.map((player, index) => (
                  <div
                    key={player.playerId}
                    className={`grid grid-cols-7 gap-2 text-sm py-2 rounded px-2 ${
                      player.playerId === currentUser ? 'bg-blue-500/20' : ''
                    }`}
                  >
                    <div className="text-white font-medium">{index + 1}</div>
                    <div className="text-white font-medium">
                      {player.playerName}
                      {player.playerId === currentUser && (
                        <Badge variant="secondary" className="ml-2 text-xs">Вы</Badge>
                      )}
                    </div>
                    <div className="text-white font-medium">{player.points.toFixed(1)}</div>
                    <div className="text-white/80">{player.games}</div>
                    <div className="text-white/80">
                      <span className="text-green-400">{player.wins}</span>/
                      <span className="text-red-400">{player.losses}</span>/
                      <span className="text-yellow-400">{player.draws}</span>
                    </div>
                    <div className="text-white/80">1650</div>
                    <div className="text-white/80">{player.performance}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Текущие матчи */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Icon name="Clock" size={20} />
              Текущий тур
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-white/60">Тур {match.round}</div>
                    <Badge
                      variant={match.status === 'in_progress' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {match.status === 'in_progress' ? 'Играют' : 'Завершено'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm">
                      <div>{match.player1}</div>
                      <div className="text-white/60">vs</div>
                      <div>{match.player2}</div>
                    </div>
                    <div className="text-right">
                      {match.result ? (
                        <div className="text-white font-medium">{match.result}</div>
                      ) : (
                        <div className="text-yellow-400 text-sm animate-pulse">В игре...</div>
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