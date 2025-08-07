export interface Tournament {
  id: string;
  name: string;
  description: string;
  status: 'waiting' | 'active' | 'finished';
  participants: string[];
  startDate: string;
  format: 'single_elimination' | 'round_robin' | 'swiss';
  timeControl: string;
}

export interface TournamentStanding {
  playerId: string;
  playerName: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  games: number;
  performance: number;
  roundResults: string[]; // Результат каждого тура: '1', '0', '0.5', '-'
}

export interface Match {
  id: string;
  player1: string;
  player2: string;
  result: '1-0' | '0-1' | '1/2-1/2' | null;
  round: number;
  status: 'scheduled' | 'in_progress' | 'finished';
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface TournamentRoomProps {
  tournamentId: string;
  currentUser: string;
  onBack: () => void;
}