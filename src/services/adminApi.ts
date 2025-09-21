import { authService } from './authApi';

const ADMIN_USERS_URL = 'https://functions.poehali.dev/0900b007-595d-4e27-b139-fa94592ce565';
const ADMIN_TOURNAMENTS_URL = 'https://functions.poehali.dev/cdb79035-abcf-4b0a-a1b9-75c71a2adcf4';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'player' | 'moderator' | 'admin';
  user_type: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  date_of_birth?: string;
  gender?: string;
  fcr_id?: string;
  educational_institution?: string;
  trainer_name?: string;
  representative_email?: string;
  representative_phone?: string;
}

export interface AdminTournament {
  id: number;
  name: string;
  description: string;
  start_date: string;
  max_participants: number;
  registration_deadline?: string;
  entry_fee: number;
  tournament_type: 'swiss' | 'round_robin' | 'knockout' | 'arena';
  time_control: string;
  age_category: string;
  start_time_msk: string;
  rounds: number;
  status: 'planned' | 'registration' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  registered_count: number;
}

export interface CreateTournamentData {
  name: string;
  description?: string;
  start_date: string;
  max_participants?: number;
  registration_deadline?: string;
  entry_fee?: number;
  tournament_type?: 'swiss' | 'round_robin' | 'knockout' | 'arena';
  time_control?: string;
  age_category?: string;
  start_time_msk?: string;
  rounds?: number;
  status?: 'planned' | 'registration' | 'active' | 'completed' | 'cancelled';
}

class AdminApiService {
  private async makeRequest(url: string, options: RequestInit = {}) {
    const sessionToken = authService.getSessionToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Добавляем токен сессии для авторизации
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    return response.json();
  }

  // === API для управления пользователями ===

  async getUsers(): Promise<AdminUser[]> {
    const response = await this.makeRequest(ADMIN_USERS_URL);
    return response.users || [];
  }

  async updateUser(userData: Partial<AdminUser> & { id: number }): Promise<AdminUser> {
    const response = await this.makeRequest(ADMIN_USERS_URL, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.user;
  }

  async deleteUser(userId: number): Promise<boolean> {
    const response = await this.makeRequest(`${ADMIN_USERS_URL}?id=${userId}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // === API для управления турнирами ===

  async getTournaments(): Promise<AdminTournament[]> {
    const response = await this.makeRequest(ADMIN_TOURNAMENTS_URL);
    return response.tournaments || [];
  }

  async createTournament(tournamentData: CreateTournamentData): Promise<AdminTournament> {
    const response = await this.makeRequest(ADMIN_TOURNAMENTS_URL, {
      method: 'POST',
      body: JSON.stringify(tournamentData),
    });
    return response.tournament;
  }

  async updateTournament(tournamentData: Partial<AdminTournament> & { id: number }): Promise<AdminTournament> {
    const response = await this.makeRequest(ADMIN_TOURNAMENTS_URL, {
      method: 'PUT',
      body: JSON.stringify(tournamentData),
    });
    return response.tournament;
  }

  async deleteTournament(tournamentId: number): Promise<boolean> {
    const response = await this.makeRequest(`${ADMIN_TOURNAMENTS_URL}?id=${tournamentId}`, {
      method: 'DELETE',
    });
    return response.success;
  }
}

export const adminApiService = new AdminApiService();