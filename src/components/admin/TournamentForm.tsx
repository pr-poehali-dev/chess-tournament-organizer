import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tournament, CreateTournamentData } from './types';

interface TournamentFormProps {
  tournament?: Tournament;
  onSubmit: (data: CreateTournamentData) => void | Promise<void>;
  onCancel: () => void;
  title: string;
  loading?: boolean;
}

const TournamentForm: React.FC<TournamentFormProps> = ({ 
  tournament, 
  onSubmit, 
  onCancel, 
  title, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    name: tournament?.name || '',
    description: tournament?.description || '',
    start_date: tournament?.start_date || '',
    max_participants: tournament?.max_participants || 100,
    tournament_type: tournament?.tournament_type || 'swiss',
    time_control: tournament?.time_control || '90+30',
    age_category: tournament?.age_category || 'до 12 лет',
    start_time_msk: tournament?.start_time_msk || '10:00',
    rounds: tournament?.rounds || 9,
    entry_fee: tournament?.entry_fee || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Название турнира</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="start_date">Дата начала</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="start_time_msk">Время начала (МСК)</Label>
              <Input
                id="start_time_msk"
                type="time"
                value={formData.start_time_msk}
                onChange={(e) => setFormData({ ...formData, start_time_msk: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="time_control">Контроль времени</Label>
              <Select
                value={formData.time_control}
                onValueChange={(value) => setFormData({ ...formData, time_control: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90+30">90 мин + 30 сек/ход</SelectItem>
                  <SelectItem value="60+10">60 мин + 10 сек/ход</SelectItem>
                  <SelectItem value="30+5">30 мин + 5 сек/ход</SelectItem>
                  <SelectItem value="15+10">15 мин + 10 сек/ход</SelectItem>
                  <SelectItem value="10+5">10 мин + 5 сек/ход</SelectItem>
                  <SelectItem value="5+3">5 мин + 3 сек/ход</SelectItem>
                  <SelectItem value="3+2">3 мин + 2 сек/ход</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="max_participants">Макс. участников</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="tournament_type">Тип турнира</Label>
              <Select
                value={formData.tournament_type}
                onValueChange={(value) => setFormData({ ...formData, tournament_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="swiss">Швейцарская система</SelectItem>
                  <SelectItem value="round_robin">Круговая система</SelectItem>
                  <SelectItem value="knockout">На выбывание</SelectItem>
                  <SelectItem value="arena">Арена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rounds">Количество туров</Label>
              <Input
                id="rounds"
                type="number"
                value={formData.rounds}
                onChange={(e) => setFormData({ ...formData, rounds: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="entry_fee">Взнос (руб.)</Label>
              <Input
                id="entry_fee"
                type="number"
                step="0.01"
                value={formData.entry_fee}
                onChange={(e) => setFormData({ ...formData, entry_fee: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="age_category">Возрастная категория</Label>
              <Select
                value={formData.age_category}
                onValueChange={(value) => setFormData({ ...formData, age_category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="до 8 лет">до 8 лет</SelectItem>
                  <SelectItem value="до 10 лет">до 10 лет</SelectItem>
                  <SelectItem value="до 12 лет">до 12 лет</SelectItem>
                  <SelectItem value="до 14 лет">до 14 лет</SelectItem>
                  <SelectItem value="до 16 лет">до 16 лет</SelectItem>
                  <SelectItem value="до 18 лет">до 18 лет</SelectItem>
                  <SelectItem value="взрослые">взрослые</SelectItem>
                  <SelectItem value="открытая">открытая</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Обработка...' : (tournament ? 'Сохранить изменения' : 'Создать турнир')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TournamentForm;