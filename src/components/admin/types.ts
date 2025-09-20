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
  // Статистика
  participants_count?: number;
  registered_count?: number;
  completed_rounds?: number;
  created_at?: string;
  updated_at?: string;
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