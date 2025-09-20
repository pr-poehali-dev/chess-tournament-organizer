// Локальные типы для турниров  
export interface Tournament {
  id: number;
  name: string;
  description: string;
  start_date: string;
  max_participants: number;
  entry_fee: number;
  tournament_type: string;
  time_control: string;
  age_category: string;
  start_time_msk: string;
  rounds: number;
  status: string;
}

export interface CreateTournamentData {
  name: string;
  description?: string;
  start_date: string;
  max_participants?: number;
  entry_fee?: number;
  tournament_type?: string;
  time_control?: string;
  age_category?: string;
  start_time_msk?: string;
  rounds?: number;
}