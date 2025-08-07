import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tournament, ActiveSection } from './types';

interface HomePageProps {
  upcomingTournaments: Tournament[];
  onSectionChange: (section: ActiveSection) => void;
  onTournamentRegistration: (tournament: Tournament) => void;
  onEnterTournamentRoom: (tournamentId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  upcomingTournaments,
  onSectionChange,
  onTournamentRegistration,
  onEnterTournamentRoom
}) => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-heading font-bold text-gray-900 mb-6">
                Детские шахматные
                <span className="text-primary"> турниры онлайн</span>
              </h1>
              <p className="text-xl text-gray-600 mb-4 font-body">
                Развиваем логическое мышление и стратегические навыки детей через увлекательные шахматные соревнования
              </p>
              <p className="text-lg text-primary font-semibold mb-8">
                Участие в турнире — всего 250 рублей
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-gold-600 text-black font-medium"
                  onClick={() => onSectionChange('tournaments')}
                >
                  <Icon name="Trophy" size={20} className="mr-2" />
                  Участвовать в турнире
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onSectionChange('about')}
                >
                  Узнать больше
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-gold-100/30 rounded-2xl p-8 text-center">
                <div className="text-8xl mb-4">♟️</div>
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  Готовы играть?
                </h3>
                <p className="text-gray-600 mb-4">
                  Перейдите во вкладку "Игра" для тренировки
                </p>
                <Button 
                  onClick={() => onSectionChange('play')}
                  className="bg-primary hover:bg-gold-600 text-black"
                >
                  <Icon name="Gamepad2" size={20} className="mr-2" />
                  Играть в шахматы
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Tournaments */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">Ближайшие турниры</h2>
            <p className="text-lg text-gray-600 font-body">Присоединяйтесь к увлекательным соревнованиям</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-heading">{tournament.title}</CardTitle>
                    <Badge 
                      variant={tournament.status === 'upcoming' ? 'default' : 'secondary'}
                      className={tournament.status === 'upcoming' ? 'bg-primary text-black' : ''}
                    >
                      {tournament.status === 'upcoming' ? 'Регистрация открыта' : 
                       tournament.status === 'active' ? 'Активный турнир' : 'Места заполнены'}
                    </Badge>
                  </div>
                  <CardDescription className="font-body">
                    {tournament.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Icon name="Calendar" size={16} className="mr-2" />
                      {tournament.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Icon name="Users" size={16} className="mr-2" />
                      {tournament.participants}/{tournament.maxParticipants} участников
                    </div>
                    <div className="pt-3 space-y-2">
                      {tournament.status === 'active' ? (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => onEnterTournamentRoom(tournament.id)}
                        >
                          <Icon name="Users" size={16} className="mr-2" />
                          Войти в турнирный зал
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-primary hover:bg-gold-600 text-black"
                          disabled={tournament.status === 'finished'}
                          onClick={() => onTournamentRegistration(tournament)}
                        >
                          {tournament.status === 'finished' ? 'Мест нет' : 'Зарегистрироваться'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">Преимущества наших турниров</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Shield" size={32} className="text-black" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Безопасная среда</h3>
              <p className="text-gray-600 font-body">Модерируемые игры в защищенной онлайн-среде</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Award" size={32} className="text-black" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Сертификаты</h3>
              <p className="text-gray-600 font-body">Официальные награды и дипломы для участников</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={32} className="text-black" />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Сообщество</h3>
              <p className="text-gray-600 font-body">Общение с единомышленниками и опытными тренерами</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;