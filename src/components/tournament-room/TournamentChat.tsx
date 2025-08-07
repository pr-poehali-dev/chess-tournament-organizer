import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { ChatMessage } from './types';

interface TournamentChatProps {
  chatMessages: ChatMessage[];
  currentUser: string;
  onSendMessage: (message: string) => void;
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatUsername = (fullName: string) => {
  if (fullName === 'Администратор') return fullName;
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`; // Фамилия Имя
  }
  return fullName; // Если меньше 2 частей, возвращаем как есть
};

const TournamentChat: React.FC<TournamentChatProps> = ({ 
  chatMessages, 
  currentUser, 
  onSendMessage 
}) => {
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <Icon name="MessageSquare" size={20} className="text-primary" />
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
                    msg.isAdmin ? 'text-primary' : 'text-blue-600'
                  }`}>
                    {msg.isAdmin && <Icon name="Shield" size={14} className="inline mr-1" />}
                    {formatUsername(msg.username)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{msg.message}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-4 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Написать сообщение..."
            className="bg-white border-gray-200"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button
            onClick={sendMessage}
            size="sm"
            className="shrink-0 bg-primary hover:bg-primary/90 text-black"
            disabled={!newMessage.trim()}
          >
            <Icon name="Send" size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentChat;