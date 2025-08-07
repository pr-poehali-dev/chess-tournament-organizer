import { useState, useEffect } from 'react';
import { Tournament, TournamentStanding, Match, ChatMessage } from './types';

export const useTournamentData = (tournamentId: string, currentUser: string) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<TournamentStanding[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentRound] = useState(4);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkAuthorization = () => {
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
    const mockStandings: TournamentStanding[] = [
      {
        playerId: 'Петров Александр Сергеевич',
        playerName: 'Петров Александр Сергеевич',
        points: 3.0,
        wins: 3,
        losses: 0,
        draws: 0,
        games: 3,
        performance: 2200,
        roundResults: ['1', '1', '1', '-', '-']
      },
      {
        playerId: 'Иванова Мария Владимировна',
        playerName: 'Иванова Мария Владимировна',
        points: 2.5,
        wins: 2,
        losses: 0,
        draws: 1,
        games: 3,
        performance: 2050,
        roundResults: ['1', '0.5', '1', '-', '-']
      },
      {
        playerId: currentUser,
        playerName: currentUser,
        points: 2.5,
        wins: 2,
        losses: 0,
        draws: 1,
        games: 3,
        performance: 2040,
        roundResults: ['1', '1', '0.5', '-', '-']
      },
      {
        playerId: 'Сидоров Дмитрий Александрович',
        playerName: 'Сидоров Дмитрий Александрович',
        points: 2.0,
        wins: 2,
        losses: 1,
        draws: 0,
        games: 3,
        performance: 1900,
        roundResults: ['1', '1', '0', '-', '-']
      },
      {
        playerId: 'Морозов Игорь Михайлович',
        playerName: 'Морозов Игорь Михайлович',
        points: 2.0,
        wins: 1,
        losses: 0,
        draws: 2,
        games: 3,
        performance: 1880,
        roundResults: ['0.5', '1', '0.5', '-', '-']
      },
      {
        playerId: 'Козлова Елена Павловна',
        playerName: 'Козлова Елена Павловна',
        points: 1.5,
        wins: 1,
        losses: 1,
        draws: 1,
        games: 3,
        performance: 1750,
        roundResults: ['1', '0', '0.5', '-', '-']
      },
      {
        playerId: 'Волков Андрей Петрович',
        playerName: 'Волков Андрей Петрович',
        points: 1.5,
        wins: 1,
        losses: 1,
        draws: 1,
        games: 3,
        performance: 1720,
        roundResults: ['0.5', '1', '0', '-', '-']
      },
      {
        playerId: 'Лебедева Анна Леонидовна',
        playerName: 'Лебедева Анна Леонидовна',
        points: 1.0,
        wins: 1,
        losses: 2,
        draws: 0,
        games: 3,
        performance: 1650,
        roundResults: ['0', '1', '0', '-', '-']
      },
      {
        playerId: 'Новиков Сергей Николаевич',
        playerName: 'Новиков Сергей Николаевич',
        points: 0.5,
        wins: 0,
        losses: 2,
        draws: 1,
        games: 3,
        performance: 1500,
        roundResults: ['0', '0.5', '0', '-', '-']
      },
      {
        playerId: 'Смирнова Ольга Викторовна',
        playerName: 'Смирнова Ольга Викторовна',
        points: 0.0,
        wins: 0,
        losses: 3,
        draws: 0,
        games: 3,
        performance: 1400,
        roundResults: ['0', '0', '0', '-', '-']
      }
    ];

    setStandings(mockStandings);

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

  const sendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: currentUser,
      message,
      timestamp: new Date().toISOString(),
      isAdmin: false
    };

    setChatMessages(prev => [...prev, newMessage]);
  };

  useEffect(() => {
    checkAuthorization();
    loadTournamentData();
    loadChatMessages();
    
    const interval = setInterval(() => {
      loadTournamentData();
      loadChatMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, [tournamentId, currentUser]);

  return {
    tournament,
    standings,
    matches,
    chatMessages,
    currentRound,
    isAuthorized,
    sendMessage
  };
};