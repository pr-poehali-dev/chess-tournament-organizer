import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Icon name="User" size={16} className="text-black" />
          </div>
          <span className="font-medium">{user.username}</span>
          {isAdmin && (
            <Badge variant="secondary" className="bg-gold-100 text-gold-800 border-gold-200">
              <Icon name="Crown" size={12} className="mr-1" />
              Admin
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Icon name="User" size={12} className="text-black" />
          </div>
          <div>
            <p className="font-medium">{user.username}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Icon name="Settings" size={16} className="mr-2" />
          Настройки
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Icon name="User" size={16} className="mr-2" />
          Профиль
        </DropdownMenuItem>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icon name="Shield" size={16} className="mr-2" />
              Панель администратора
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="Users" size={16} className="mr-2" />
              Управление пользователями
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={logout} className="text-red-600">
          <Icon name="LogOut" size={16} className="mr-2" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;