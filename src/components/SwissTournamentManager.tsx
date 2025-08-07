import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { SwissSystemEngine, SwissPlayer, SwissPairing, SwissUtils } from '@/utils/swissSystem';

interface Player {
  id: string;
  name: string;
  rating: number;
}

interface SwissTournamentManagerProps {
  initialPlayers?: Player[];
  onTournamentComplete?: (standings: SwissPlayer[]) => void;
}

const SwissTournamentManager: React.FC<SwissTournamentManagerProps> = ({
  initialPlayers = [],
  onTournamentComplete
}) => {
  const [engine, setEngine] = useState<SwissSystemEngine | null>(null);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRating, setNewPlayerRating] = useState('1200');
  const [totalRounds, setTotalRounds] = useState(0);
  const [currentStandings, setCurrentStandings] = useState<SwissPlayer[]>([]);
  const [currentPairings, setCurrentPairings] = useState<SwissPairing[]>([]);
  const [tournamentStarted, setTournamentStarted] = useState(false);
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState<{pairing: SwissPairing, result: string}>({ pairing: {} as SwissPairing, result: '' });

  useEffect(() => {
    if (players.length > 0) {
      setTotalRounds(SwissUtils.calculateOptimalRounds(players.length));
    }
  }, [players]);

  useEffect(() => {
    if (engine) {
      setCurrentStandings(engine.getCurrentStandings());
      setCurrentPairings(engine.getCurrentRoundPairings());
    }
  }, [engine]);

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      rating: parseInt(newPlayerRating) || 1200
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    setNewPlayerRating('1200');
    setShowAddPlayerDialog(false);
  };

  const removePlayer = (playerId: string) => {
    if (tournamentStarted) {
      // Если турнир уже начался, снимаем игрока
      engine?.withdrawPlayer(playerId);
      updateTournamentState();
    } else {
      // Если турнир не начался, просто удаляем из списка
      setPlayers(players.filter(p => p.id !== playerId));
    }
  };

  const startTournament = () => {
    if (players.length < 4) {
      alert('Для проведения турнира необходимо минимум 4 игрока');
      return;
    }

    const newEngine = new SwissSystemEngine(players, totalRounds);
    const firstRoundPairings = newEngine.generateNextRoundPairings();
    
    setEngine(newEngine);
    setCurrentPairings(firstRoundPairings);
    setCurrentStandings(newEngine.getCurrentStandings());
    setTournamentStarted(true);
  };

  const recordResult = (pairing: SwissPairing, result: 1 | 0.5 | 0) => {
    if (!engine) return;

    try {
      engine.recordResult(pairing.round, pairing.white, pairing.black, result);
      updateTournamentState();
    } catch (error) {
      alert(`Ошибка при записи результата: ${error}`);
    }
  };

  const startNextRound = () => {
    if (!engine) return;

    try {
      engine.advanceToNextRound();
      
      if (engine.isCompleted()) {
        const finalStandings = engine.getCurrentStandings();
        setCurrentStandings(finalStandings);
        setCurrentPairings([]);
        
        if (onTournamentComplete) {
          onTournamentComplete(finalStandings);
        }
        
        alert('Турнир завершен!');
        return;
      }

      const nextRoundPairings = engine.generateNextRoundPairings();
      setCurrentPairings(nextRoundPairings);
      setCurrentStandings(engine.getCurrentStandings());
    } catch (error) {
      alert(`Ошибка при создании следующего тура: ${error}`);
    }
  };

  const updateTournamentState = () => {
    if (!engine) return;
    setCurrentStandings(engine.getCurrentStandings());
    setCurrentPairings(engine.getCurrentRoundPairings());
  };

  const canStartNextRound = () => {
    return currentPairings.every(p => p.result !== null);
  };

  const getResultText = (result: number | null): string => {
    if (result === null) return '-';
    if (result === 1) return '1';
    if (result === 0.5) return '½';
    if (result === 0) return '0';
    return '-';
  };

  const getResultColor = (result: number | null): string => {
    if (result === null) return 'text-gray-400';
    if (result === 1) return 'text-green-600';
    if (result === 0.5) return 'text-yellow-600';
    if (result === 0) return 'text-red-600';
    return 'text-gray-400';
  };

  if (!tournamentStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Trophy" size={24} className="text-primary" />
              Настройка турнира по швейцарской системе
            </CardTitle>
            <CardDescription>
              Добавьте игроков и настройте параметры турнира
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Список игроков */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Участники ({players.length})
                </h3>
                <Dialog open={showAddPlayerDialog} onOpenChange={setShowAddPlayerDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить игрока
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Добавление игрока</DialogTitle>
                      <DialogDescription>
                        Введите имя и рейтинг нового участника
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="playerName">Имя игрока</Label>
                        <Input
                          id="playerName"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          placeholder="Фамилия Имя"
                        />
                      </div>
                      <div>
                        <Label htmlFor="playerRating">Рейтинг</Label>
                        <Input
                          id="playerRating"
                          type="number"
                          value={newPlayerRating}
                          onChange={(e) => setNewPlayerRating(e.target.value)}
                          placeholder="1200"
                        />
                      </div>
                      <Button onClick={addPlayer} className="w-full">
                        Добавить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-600">Рейтинг: {player.rating}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePlayer(player.id)}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Настройки турнира */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalRounds">Количество туров</Label>
                <Select 
                  value={totalRounds.toString()} 
                  onValueChange={(value) => setTotalRounds(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(Math.min(players.length - 1, 11))].map((_, i) => (
                      <SelectItem key={i + 3} value={(i + 3).toString()}>
                        {i + 3} туров
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Рекомендуемое количество</Label>
                <div className="h-10 flex items-center text-sm text-gray-600">
                  {SwissUtils.calculateOptimalRounds(players.length)} туров для {players.length} игроков
                </div>
              </div>
            </div>

            {/* Информация о системе */}
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Швейцарская система:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Каждый игрок играет заданное количество туров</li>
                  <li>• Жеребьевка по принципу близости очков</li>
                  <li>• Исключение повторных встреч</li>
                  <li>• Баланс цветов фигур для каждого игрока</li>
                  <li>• Рейтинг-порядок: очки → Бухгольц → Зонненборн-Бергер</li>
                </ul>
              </CardContent>
            </Card>

            <Button 
              onClick={startTournament}
              disabled={players.length < 4}
              className="w-full"
              size="lg"
            >
              <Icon name="Play" size={20} className="mr-2" />
              Начать турнир
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentRound = engine?.getTournamentData().currentRound || 1;
  const isCompleted = engine?.isCompleted() || false;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Швейцарский турнир</h1>
          <p className="text-gray-600">
            {isCompleted ? 'Турнир завершен' : `Тур ${currentRound} из ${totalRounds}`}
          </p>
        </div>
        {!isCompleted && (
          <Button
            onClick={startNextRound}
            disabled={!canStartNextRound()}
            size="lg"
          >
            <Icon name="ChevronRight" size={16} className="mr-2" />
            {canStartNextRound() ? 'Следующий тур' : 'Ожидание результатов'}
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Текущие партии */}
        {!isCompleted && currentPairings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Партии {currentRound} тура</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentPairings.map((pairing) => {
                  const whitePlayer = currentStandings.find(p => p.id === pairing.white);
                  const blackPlayer = currentStandings.find(p => p.id === pairing.black);
                  
                  return (
                    <div key={`${pairing.white}-${pairing.black}`} 
                         className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">Доска {pairing.board}</Badge>
                        <div className="text-sm text-gray-600">
                          {pairing.result !== null ? 'Завершено' : 'В игре'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-medium">
                            ⬜ {whitePlayer?.name} ({whitePlayer?.rating})
                          </div>
                          <div className="font-medium mt-1">
                            ⬛ {blackPlayer?.name} ({blackPlayer?.rating})
                          </div>
                        </div>
                        
                        {pairing.result === null ? (
                          <div className="space-y-1">
                            <Button size="sm" onClick={() => recordResult(pairing, 1)}>
                              1-0
                            </Button>
                            <Button size="sm" onClick={() => recordResult(pairing, 0.5)}>
                              ½-½
                            </Button>
                            <Button size="sm" onClick={() => recordResult(pairing, 0)}>
                              0-1
                            </Button>
                          </div>
                        ) : (
                          <div className="text-lg font-bold">
                            {pairing.result === 1 ? '1-0' : 
                             pairing.result === 0.5 ? '½-½' : '0-1'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Турнирная таблица */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Турнирная таблица</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">№</th>
                    <th className="text-left p-3 font-semibold">Игрок</th>
                    <th className="text-center p-3 font-semibold">Очки</th>
                    <th className="text-center p-3 font-semibold">Бх</th>
                    <th className="text-center p-3 font-semibold">ЗБ</th>
                    <th className="text-center p-3 font-semibold">Рейтинг</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStandings.map((player, index) => (
                    <tr key={player.id} 
                        className={`border-b ${index < 3 ? 'bg-yellow-50' : ''} 
                        ${player.isWithdrawn ? 'opacity-50' : ''}`}>
                      <td className="p-3 font-semibold">
                        {index < 3 && !player.isWithdrawn && (
                          <Icon 
                            name={index === 0 ? "Crown" : index === 1 ? "Medal" : "Award"} 
                            size={16} 
                            className={`inline mr-1 ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 
                              'text-orange-600'
                            }`}
                          />
                        )}
                        {index + 1}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{player.name}</div>
                        {player.isWithdrawn && (
                          <Badge variant="secondary" className="text-xs">Снялся</Badge>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold">{player.points}</td>
                      <td className="p-3 text-center">{player.buchholz.toFixed(1)}</td>
                      <td className="p-3 text-center">{player.sonnenborn.toFixed(1)}</td>
                      <td className="p-3 text-center">{player.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {isCompleted && (
        <Card className="mt-6 bg-gradient-to-r from-primary/10 to-gold-100/50">
          <CardContent className="p-6 text-center">
            <Icon name="Trophy" size={48} className="mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Турнир завершен!</h2>
            <p className="text-gray-600 mb-4">
              Победитель: <span className="font-bold">{currentStandings[0]?.name}</span> с результатом {currentStandings[0]?.points} очков
            </p>
            <Button onClick={() => {
              setTournamentStarted(false);
              setEngine(null);
              setCurrentStandings([]);
              setCurrentPairings([]);
            }}>
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Создать новый турнир
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SwissTournamentManager;