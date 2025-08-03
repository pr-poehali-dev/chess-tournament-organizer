import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('participant'); // 'participant' | 'admin'
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const upcomingTournaments = [
    {
      id: 1,
      title: 'Весенний турнир новичков',
      date: '2025-04-15',
      time: '10:00',
      participants: 24,
      maxParticipants: 32,
      ageGroup: '6-10 лет',
      status: 'Регистрация открыта'
    },
    {
      id: 2,
      title: 'Кубок юных гроссмейстеров',
      date: '2025-04-22',
      time: '14:00',
      participants: 16,
      maxParticipants: 16,
      ageGroup: '11-15 лет',
      status: 'Места заполнены'
    },
    {
      id: 3,
      title: 'Летний чемпионат',
      date: '2025-05-05',
      time: '09:00',
      participants: 8,
      maxParticipants: 64,
      ageGroup: '8-14 лет',
      status: 'Регистрация открыта'
    }
  ];

  const navigationItems = [
    { id: 'home', label: 'Главная', icon: 'Home' },
    { id: 'tournaments', label: 'Турниры', icon: 'Trophy' },
    { id: 'about', label: 'О центре', icon: 'Info' },
    { id: 'contacts', label: 'Контакты', icon: 'Phone' },
    { id: 'profile', label: isLoggedIn ? 'Личный кабинет' : 'Регистрация', icon: 'User' }
  ];

  const renderNavigation = () => (
    <div>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <img 
                src="https://cdn.poehali.dev/files/f7c22529-8aec-4d54-8fdf-65bbb1fc6ed7.png" 
                alt="Мир шахмат" 
                className="h-24 w-auto"
              />
              <div>
                <h1 className="text-xl font-heading font-semibold text-gray-900">Мир шахмат</h1>
                <p className="text-sm text-gray-500">Центр поддержки детского шахматного спорта</p>
              </div>
            </div>
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon name={item.icon as any} size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      <div className="bg-gradient-to-r from-primary/10 to-gold-100/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-center text-gray-900">
            Центр поддержки детского шахматного спорта "Мир шахмат"
          </h2>
        </div>
      </div>
    </div>
  );

  const renderHome = () => (
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
              <p className="text-xl text-gray-600 mb-8 font-body">
                Развиваем логическое мышление и стратегические навыки детей через увлекательные шахматные соревнования
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-gold-600 text-black font-medium"
                  onClick={() => setActiveSection('tournaments')}
                >
                  <Icon name="Trophy" size={20} className="mr-2" />
                  Участвовать в турнире
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setActiveSection('about')}
                >
                  Узнать больше
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 64 }, (_, i) => {
                    const isLight = (Math.floor(i / 8) + (i % 8)) % 2 === 0;
                    return (
                      <div
                        key={i}
                        className={`aspect-square ${
                          isLight ? 'bg-chess-light' : 'bg-chess-dark'
                        } flex items-center justify-center text-4xl`}
                      >
                        {i === 0 && '♜'}
                        {i === 1 && '♞'}
                        {i === 2 && '♝'}
                        {i === 3 && '♛'}
                        {i === 4 && '♚'}
                        {i === 5 && '♝'}
                        {i === 6 && '♞'}
                        {i === 7 && '♜'}
                        {i >= 8 && i <= 15 && '♟'}
                        {i >= 48 && i <= 55 && '♙'}
                        {i === 56 && '♖'}
                        {i === 57 && '♘'}
                        {i === 58 && '♗'}
                        {i === 59 && '♕'}
                        {i === 60 && '♔'}
                        {i === 61 && '♗'}
                        {i === 62 && '♘'}
                        {i === 63 && '♖'}
                      </div>
                    );
                  })}
                </div>
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
                      variant={tournament.status === 'Регистрация открыта' ? 'default' : 'secondary'}
                      className={tournament.status === 'Регистрация открыта' ? 'bg-primary text-black' : ''}
                    >
                      {tournament.status}
                    </Badge>
                  </div>
                  <CardDescription className="font-body">
                    Возрастная группа: {tournament.ageGroup}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Icon name="Calendar" size={16} className="mr-2" />
                      {tournament.date} в {tournament.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Icon name="Users" size={16} className="mr-2" />
                      {tournament.participants}/{tournament.maxParticipants} участников
                    </div>
                    <div className="pt-3">
                      <Button 
                        className="w-full bg-primary hover:bg-gold-600 text-black"
                        disabled={tournament.status === 'Места заполнены'}
                      >
                        {tournament.status === 'Места заполнены' ? 'Мест нет' : 'Зарегистрироваться'}
                      </Button>
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

  const renderTournaments = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Турниры</h1>
        {userRole === 'admin' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-gold-600 text-black">
                <Icon name="Plus" size={16} className="mr-2" />
                Создать турнир
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создание нового турнира</DialogTitle>
                <DialogDescription>Заполните информацию о турнире</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Название турнира</Label>
                  <Input id="title" placeholder="Введите название турнира" />
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea id="description" placeholder="Описание турнира" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Дата</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="time">Время</Label>
                    <Input id="time" type="time" />
                  </div>
                </div>
                <Button className="w-full bg-primary hover:bg-gold-600 text-black">
                  Создать турнир
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {upcomingTournaments.map((tournament) => (
              <Card key={tournament.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-heading">{tournament.title}</CardTitle>
                      <CardDescription className="font-body">
                        {tournament.date} в {tournament.time} • {tournament.ageGroup}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={tournament.status === 'Регистрация открыта' ? 'default' : 'secondary'}
                      className={tournament.status === 'Регистрация открыта' ? 'bg-primary text-black' : ''}
                    >
                      {tournament.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <Icon name="Users" size={16} className="inline mr-1" />
                      {tournament.participants}/{tournament.maxParticipants} участников
                    </div>
                    <Button 
                      size="sm"
                      className="bg-primary hover:bg-gold-600 text-black"
                      disabled={tournament.status === 'Места заполнены'}
                    >
                      {tournament.status === 'Места заполнены' ? 'Мест нет' : 'Участвовать'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Календарь турниров</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => {
    if (!isLoggedIn) {
      return (
        <div className="max-w-md mx-auto py-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-center font-heading">Вход в систему</CardTitle>
              <CardDescription className="text-center font-body">
                Войдите в аккаунт или зарегистрируйтесь
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Вход</TabsTrigger>
                  <TabsTrigger value="register">Регистрация</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="password">Пароль</Label>
                    <Input id="password" type="password" />
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-gold-600 text-black"
                    onClick={() => setIsLoggedIn(true)}
                  >
                    Войти
                  </Button>
                </TabsContent>
                <TabsContent value="register" className="space-y-4">
                  <div>
                    <Label htmlFor="name">Имя ребенка</Label>
                    <Input id="name" placeholder="Имя" />
                  </div>
                  <div>
                    <Label htmlFor="age">Возраст</Label>
                    <Input id="age" type="number" placeholder="8" />
                  </div>
                  <div>
                    <Label htmlFor="parent-email">Email родителя</Label>
                    <Input id="parent-email" type="email" placeholder="parent@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="new-password">Пароль</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-gold-600 text-black"
                    onClick={() => setIsLoggedIn(true)}
                  >
                    Зарегистрироваться
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900">Личный кабинет</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setUserRole(userRole === 'admin' ? 'participant' : 'admin')}
            >
              {userRole === 'admin' ? 'Режим участника' : 'Режим администратора'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsLoggedIn(false)}
            >
              Выйти
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-black text-lg">МА</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="font-heading">Максим Андреев</CardTitle>
                    <CardDescription className="font-body">
                      {userRole === 'admin' ? 'Администратор' : '9 лет • Новичок'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Турниров сыграно:</span>
                    <span className="font-medium ml-2">5</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Побед:</span>
                    <span className="font-medium ml-2">3</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Рейтинг:</span>
                    <span className="font-medium ml-2">1200</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {userRole === 'admin' ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">Управление турнирами</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">12</div>
                        <div className="text-sm text-gray-600">Активных турниров</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">156</div>
                        <div className="text-sm text-gray-600">Зарегистрированных игроков</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">89</div>
                        <div className="text-sm text-gray-600">Завершенных игр</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">Последние регистрации</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Анна Петрова', age: 8, tournament: 'Весенний турнир новичков' },
                        { name: 'Дмитрий Сидоров', age: 10, tournament: 'Летний чемпионат' },
                        { name: 'София Иванова', age: 12, tournament: 'Кубок юных гроссмейстеров' }
                      ].map((participant, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{participant.name}</div>
                            <div className="text-sm text-gray-600">{participant.age} лет</div>
                          </div>
                          <div className="text-sm text-gray-600">{participant.tournament}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Мои турниры</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Весенний турнир новичков', status: 'Зарегистрирован', date: '2025-04-15' },
                      { name: 'Летний чемпионат', status: 'Ожидание', date: '2025-05-05' }
                    ].map((tournament, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{tournament.name}</div>
                          <div className="text-sm text-gray-600">{tournament.date}</div>
                        </div>
                        <Badge variant={tournament.status === 'Зарегистрирован' ? 'default' : 'secondary'}>
                          {tournament.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAbout = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">О центре "Мир шахмат"</h1>
        <p className="text-xl text-gray-600 font-body">
          Развиваем интеллектуальный потенциал детей через шахматное искусство
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-2xl font-heading font-semibold mb-6">Наша миссия</h2>
          <p className="text-gray-600 mb-4 font-body">
            Центр поддержки детского шахматного спорта "Мир шахмат" создан для развития логического мышления, 
            концентрации внимания и стратегических навыков у детей всех возрастов.
          </p>
          <p className="text-gray-600 font-body">
            Мы организуем безопасные онлайн-турниры, где дети могут соревноваться, учиться и находить новых друзей, 
            объединенных любовью к шахматам.
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-gray-600">Участников</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-gray-600">Турниров</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <div className="text-sm text-gray-600">Года работы</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-gray-600">Довольных родителей</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-heading font-semibold text-center">Что мы предлагаем</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Icon name="Users" size={32} className="text-primary mb-4" />
              <CardTitle className="font-heading">Турниры по возрастам</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 font-body">
                Соревнования для разных возрастных групп: от 6 до 16 лет
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Icon name="Shield" size={32} className="text-primary mb-4" />
              <CardTitle className="font-heading">Безопасная среда</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 font-body">
                Модерируемые игры с соблюдением правил детской безопасности
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Icon name="Award" size={32} className="text-primary mb-4" />
              <CardTitle className="font-heading">Награды и сертификаты</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 font-body">
                Официальные дипломы и грамоты для всех участников
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">Контакты</h1>
        <p className="text-xl text-gray-600 font-body">Свяжитесь с нами любым удобным способом</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Phone" size={24} className="text-black" />
            </div>
            <div>
              <h3 className="font-heading font-semibold mb-2">Телефон</h3>
              <p className="text-gray-600 font-body">+7 (495) 123-45-67</p>
              <p className="text-sm text-gray-500">Ежедневно с 9:00 до 21:00</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Mail" size={24} className="text-black" />
            </div>
            <div>
              <h3 className="font-heading font-semibold mb-2">Email</h3>
              <p className="text-gray-600 font-body">info@mir-shahmaty.ru</p>
              <p className="text-sm text-gray-500">Ответим в течение 24 часов</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Icon name="MessageCircle" size={24} className="text-black" />
            </div>
            <div>
              <h3 className="font-heading font-semibold mb-2">Telegram</h3>
              <p className="text-gray-600 font-body">@mir_shahmaty_bot</p>
              <p className="text-sm text-gray-500">Быстрая поддержка в мессенджере</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Написать нам</CardTitle>
            <CardDescription className="font-body">
              Задайте вопрос или оставьте отзыв
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contact-name">Имя</Label>
              <Input id="contact-name" placeholder="Ваше имя" />
            </div>
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" placeholder="your@email.com" />
            </div>
            <div>
              <Label htmlFor="contact-message">Сообщение</Label>
              <Textarea id="contact-message" placeholder="Ваше сообщение" rows={4} />
            </div>
            <Button className="w-full bg-primary hover:bg-gold-600 text-black">
              Отправить сообщение
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return renderHome();
      case 'tournaments':
        return renderTournaments();
      case 'about':
        return renderAbout();
      case 'contacts':
        return renderContacts();
      case 'profile':
        return renderProfile();
      default:
        return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-white font-body">
      {renderNavigation()}
      <main>
        {renderContent()}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="https://cdn.poehali.dev/files/f7c22529-8aec-4d54-8fdf-65bbb1fc6ed7.png" 
                  alt="Мир шахмат" 
                  className="h-8 w-auto filter brightness-0 invert"
                />
                <span className="font-heading font-semibold">Мир шахмат</span>
              </div>
              <p className="text-gray-400 font-body">
                Центр поддержки детского шахматного спорта
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4">Разделы</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => setActiveSection('tournaments')}>Турниры</button></li>
                <li><button onClick={() => setActiveSection('about')}>О центре</button></li>
                <li><button onClick={() => setActiveSection('contacts')}>Контакты</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-gray-400">
                <p>+7 (495) 123-45-67</p>
                <p>info@mir-shahmaty.ru</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Мир шахмат. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;