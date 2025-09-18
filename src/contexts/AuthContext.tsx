import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем сессию при загрузке приложения
    checkCurrentSession();
  }, []);

  const checkCurrentSession = async () => {
    try {
      const result = await authService.checkSession();
      if (result.authenticated && result.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const response = await authService.register(data);
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    // Проверяем как поле role, так и userType для обратной совместимости
    return user.role === role || user.userType === role;
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    register,
    logout,
    isAdmin: hasRole('admin'),
    isModerator: hasRole('moderator'),
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};