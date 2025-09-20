const AUTH_API_URL = 'https://functions.poehali.dev/77ed06b2-9e6e-44bd-b801-eea5ca972ba0';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  userType: 'child' | 'parent' | 'trainer' | 'admin';
  role?: 'player' | 'moderator' | 'admin';
  playerId?: number;
  birthDate?: string;
  fsrId?: string;
  coach?: string;
  educationalInstitution?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  dateOfBirth?: string;
  birthDate?: string; // Новое поле для даты рождения
  gender?: 'male' | 'female';
  fcrId?: string;
  fsrId?: string; // Новое поле ID ФШР
  educationalInstitution?: string;
  trainerName?: string;
  coach?: string; // Новое поле тренер
  representativeEmail?: string;
  representativePhone?: string;
  userType?: 'child' | 'parent' | 'trainer';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  sessionToken: string;
  expiresAt: string;
}

class AuthService {
  private sessionToken: string | null = null;

  constructor() {
    // Загружаем токен из localStorage при инициализации
    this.sessionToken = localStorage.getItem('chess_session_token');
  }

  private async makeRequest(endpoint: string = '/', options: RequestInit = {}) {
    const url = `${AUTH_API_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Добавляем токен сессии если есть
    if (this.sessionToken) {
      headers['X-Session-Token'] = this.sessionToken;
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

  // Регистрация
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        action: 'register',
        ...data,
      }),
    });

    if (response.success && response.sessionToken) {
      this.sessionToken = response.sessionToken;
      localStorage.setItem('chess_session_token', response.sessionToken);
    }

    return response;
  }

  // Вход
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        ...data,
      }),
    });

    if (response.success && response.sessionToken) {
      this.sessionToken = response.sessionToken;
      localStorage.setItem('chess_session_token', response.sessionToken);
    }

    return response;
  }

  // Выход
  async logout(): Promise<void> {
    try {
      await this.makeRequest('/', {
        method: 'POST',
        body: JSON.stringify({
          action: 'logout',
        }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.sessionToken = null;
      localStorage.removeItem('chess_session_token');
    }
  }

  // Проверка сессии
  async checkSession(): Promise<{ authenticated: boolean; user?: User }> {
    try {
      const response = await this.makeRequest('/');
      return response;
    } catch (error) {
      console.error('Session check error:', error);
      this.sessionToken = null;
      localStorage.removeItem('chess_session_token');
      return { authenticated: false };
    }
  }

  // Получение текущего токена
  getSessionToken(): string | null {
    return this.sessionToken;
  }

  // Обновление профиля пользователя
  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await this.makeRequest('/', {
        method: 'POST',
        body: JSON.stringify({
          action: 'updateProfile',
          ...profileData,
        }),
      });

      return response;
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления профиля' 
      };
    }
  }

  // Получение данных пользователя по ID (для админов)
  async getUserById(userId: number): Promise<User> {
    const response = await this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getUserById',
        userId,
      }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Ошибка получения данных пользователя');
    }

    return response.user;
  }

  // Получение списка всех пользователей (для админов)
  async getAllUsers(): Promise<User[]> {
    const response = await this.makeRequest('/', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getAllUsers',
      }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Ошибка получения списка пользователей');
    }

    return response.users;
  }

  // Обновление данных любого пользователя (для админов)
  async updateUserById(userId: number, profileData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await this.makeRequest('/', {
        method: 'POST',
        body: JSON.stringify({
          action: 'updateUserById',
          userId,
          ...profileData,
        }),
      });

      return response;
    } catch (error) {
      console.error('User update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления пользователя' 
      };
    }
  }

  // Проверка, авторизован ли пользователь
  isAuthenticated(): boolean {
    return this.sessionToken !== null;
  }
}

export const authService = new AuthService();