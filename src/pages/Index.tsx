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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { UserData } from '@/types/user';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('participant'); // 'participant' | 'admin'
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [registrationData, setRegistrationData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female',
    fcrId: '',
    educationalInstitution: '',
    trainerName: '',
    representativeEmail: '',
    representativePhone: '',
    userType: 'child' as 'child' | 'parent' | 'trainer',
    password: ''
  });
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [selectedTournamentForRegistration, setSelectedTournamentForRegistration] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');

  // Функция обработки регистрации на турнир с оплатой
  const handleTournamentRegistration = (tournament: any) => {
    if (!isLoggedIn) {
      alert('Для регистрации на турнир необходимо войти в систему');
      return;
    }
    setSelectedTournamentForRegistration(tournament);
    setShowRegistrationDialog(true);
    setPaymentStatus('pending');
  };

  // Симуляция процесса оплаты
  const processPayment = async () => {
    setPaymentStatus('processing');
    
    // Симуляция обработки платежа
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        setShowRegistrationDialog(false);
        setPaymentStatus('pending');
        alert(`Вы успешно зарегистрированы на турнир "${selectedTournamentForRegistration?.title}"`);
      }, 2000);
    }, 3000);
  };

  // Тестовые аккаунты
  const testUsers: UserData[] = [
    {
      id: '1',
      fullName: 'Иванов Максим Андреевич',
      dateOfBirth: '2015-03-15',
      gender: 'male',
      fcrId: '12345678',
      educationalInstitution: 'МБОУ СОШ №1',
      trainerName: 'Петров Сергей Владимирович',
      representativeEmail: 'ivanova@email.com',
      representativePhone: '+7 (999) 123-45-67',
      userType: 'child',
      registrationDate: '2024-01-15'
    },
    {
      id: '2',
      fullName: 'Смирнова Анна Дмитриевна',
      dateOfBirth: '2014-07-22',
      gender: 'female',
      fcrId: '87654321',
      educationalInstitution: 'МБОУ Гимназия №5',
      trainerName: 'Козлов Александр Игоревич',
      representativeEmail: 'smirnov@email.com',
      representativePhone: '+7 (999) 234-56-78',
      userType: 'child',
      registrationDate: '2024-02-10'
    },
    {
      id: '3',
      fullName: 'Козлов Денис Сергеевич',
      dateOfBirth: '2013-11-08',
      gender: 'male',
      fcrId: '11223344',
      educationalInstitution: 'МБОУ Лицей №3',
      trainerName: 'Волкова Елена Анатольевна',
      representativeEmail: 'kozlova@email.com',
      representativePhone: '+7 (999) 345-67-89',
      userType: 'child',
      registrationDate: '2024-01-28'
    },
    {
      id: '4',
      fullName: 'Петрова София Алексеевна',
      dateOfBirth: '2016-05-12',
      gender: 'female',
      fcrId: '44556677',
      educationalInstitution: 'МБОУ СОШ №7',
      trainerName: 'Морозов Дмитрий Петрович',
      representativeEmail: 'petrova@email.com',
      representativePhone: '+7 (999) 456-78-90',
      userType: 'child',
      registrationDate: '2024-03-05'
    },
    {
      id: '5',
      fullName: 'Новиков Артем Владимирович',
      dateOfBirth: '2014-09-30',
      gender: 'male',
      fcrId: '99887766',
      educationalInstitution: 'МАОУ СОШ №12',
      trainerName: 'Лебедев Михаил Анатольевич',
      representativeEmail: 'novikova@email.com',
      representativePhone: '+7 (999) 567-89-01',
      userType: 'child',
      registrationDate: '2024-02-20'
    }
  ];

  const handleRegistration = () => {
    const newUser: UserData = {
      id: Date.now().toString(),
      ...registrationData,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    setCurrentUser(newUser);
    setIsLoggedIn(true);
  };

  const handleTestLogin = (user: UserData) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указана';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

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
    { id: 'results', label: 'Результаты', icon: 'Award' },
    { id: 'about', label: 'О центре', icon: 'Info' },
    { id: 'contacts', label: 'Контакты', icon: 'Phone' },
    { id: 'profile', label: isLoggedIn ? 'Личный кабинет' : 'Регистрация', icon: 'User' }
  ];

  const renderNavigation = () => (
    <div>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center">
              <img 
                src="https://cdn.poehali.dev/files/f7c22529-8aec-4d54-8fdf-65bbb1fc6ed7.png" 
                alt="Мир шахмат" 
                className="h-24 w-auto"
              />
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
                    const row = Math.floor(i / 8);
                    const col = i % 8;
                    
                    // Определяем фигуру и её цвет
                    let piece = '';
                    let isBlackPiece = false;
                    
                    // Черные фигуры (верхние ряды 0-1)
                    if (row === 0) {
                      isBlackPiece = true;
                      if (col === 0 || col === 7) piece = '♜'; // Ладья
                      if (col === 1 || col === 6) piece = '♞'; // Конь
                      if (col === 2 || col === 5) piece = '♝'; // Слон
                      if (col === 3) piece = '♛'; // Ферзь
                      if (col === 4) piece = '♚'; // Король
                    }
                    if (row === 1) {
                      isBlackPiece = true;
                      piece = '♟'; // Пешка
                    }
                    
                    // Белые фигуры (нижние ряды 6-7)
                    if (row === 6) {
                      isBlackPiece = false;
                      piece = '♙'; // Пешка
                    }
                    if (row === 7) {
                      isBlackPiece = false;
                      if (col === 0 || col === 7) piece = '♖'; // Ладья
                      if (col === 1 || col === 6) piece = '♘'; // Конь
                      if (col === 2 || col === 5) piece = '♗'; // Слон
                      if (col === 3) piece = '♕'; // Ферзь
                      if (col === 4) piece = '♔'; // Король
                    }
                    
                    return (
                      <div
                        key={i}
                        className={`aspect-square ${
                          isLight ? 'bg-chess-light' : 'bg-chess-dark'
                        } flex items-center justify-center text-6xl font-bold`}
                      >
                        {piece && (
                          <span 
                            className={`${
                              isBlackPiece ? 'text-black' : 'text-white'
                            } drop-shadow-lg`}
                            style={{
                              textShadow: isBlackPiece 
                                ? '1px 1px 2px rgba(255,255,255,0.3)' 
                                : '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            {piece}
                          </span>
                        )}
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
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600">
                      <Icon name="Users" size={16} className="inline mr-1" />
                      {tournament.participants}/{tournament.maxParticipants} участников
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      <Icon name="CreditCard" size={16} className="inline mr-1" />
                      250 ₽
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      size="sm"
                      className="bg-primary hover:bg-gold-600 text-black"
                      disabled={tournament.status === 'Места заполнены'}
                      onClick={() => handleTournamentRegistration(tournament)}
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
                    <Label htmlFor="fullName">ФИО</Label>
                    <Input 
                      id="fullName" 
                      placeholder="Иванов Иван Иванович" 
                      value={registrationData.fullName}
                      onChange={(e) => setRegistrationData({...registrationData, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Дата рождения</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date" 
                      value={registrationData.dateOfBirth}
                      onChange={(e) => setRegistrationData({...registrationData, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Пол</Label>
                    <Select 
                      value={registrationData.gender} 
                      onValueChange={(value) => setRegistrationData({...registrationData, gender: value as 'male' | 'female'})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите пол" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Мужской</SelectItem>
                        <SelectItem value="female">Женский</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fcrId">ID ФШР</Label>
                    <Input 
                      id="fcrId" 
                      placeholder="12345678" 
                      value={registrationData.fcrId}
                      onChange={(e) => setRegistrationData({...registrationData, fcrId: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="educationalInstitution">Наименование учебного заведения</Label>
                    <Input 
                      id="educationalInstitution" 
                      placeholder="МБОУ СОШ №1" 
                      value={registrationData.educationalInstitution}
                      onChange={(e) => setRegistrationData({...registrationData, educationalInstitution: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trainerName">ФИО тренера</Label>
                    <Input 
                      id="trainerName" 
                      placeholder="Петров Петр Петрович" 
                      value={registrationData.trainerName}
                      onChange={(e) => setRegistrationData({...registrationData, trainerName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="representativeEmail">Электронная почта представителя</Label>
                    <Input 
                      id="representativeEmail" 
                      type="email" 
                      placeholder="parent@email.com" 
                      value={registrationData.representativeEmail}
                      onChange={(e) => setRegistrationData({...registrationData, representativeEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="representativePhone">Телефон представителя</Label>
                    <Input 
                      id="representativePhone" 
                      type="tel" 
                      placeholder="+7 (999) 123-45-67" 
                      value={registrationData.representativePhone}
                      onChange={(e) => setRegistrationData({...registrationData, representativePhone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Пароль</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={registrationData.password}
                      onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                    />
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-gold-600 text-black"
                    onClick={handleRegistration}
                  >
                    Зарегистрироваться
                  </Button>
                </TabsContent>
              </Tabs>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Тестовые аккаунты:</h3>
                <div className="space-y-2">
                  {testUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleTestLogin(user)}
                    >
                      {user.fullName} ({calculateAge(user.dateOfBirth)} лет)
                    </Button>
                  ))}
                </div>
              </div>
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
              onClick={() => {
                setIsLoggedIn(false);
                setCurrentUser(null);
              }}
            >
              Выйти
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-black text-lg">
                      {currentUser?.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'У'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="font-heading">{currentUser?.fullName || 'Пользователь'}</CardTitle>
                    <CardDescription className="font-body">
                      {userRole === 'admin' ? 'Администратор' : `${calculateAge(currentUser?.dateOfBirth)} лет • ID ФШР: ${currentUser?.fcrId}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs">
                    <div className="text-gray-600 mb-1">Дата рождения:</div>
                    <div className="font-medium">{formatDate(currentUser?.dateOfBirth)}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-gray-600 mb-1">Пол:</div>
                    <div className="font-medium">{currentUser?.gender === 'male' ? 'Мужской' : 'Женский'}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-gray-600 mb-1">Учебное заведение:</div>
                    <div className="font-medium break-words">{currentUser?.educationalInstitution}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-gray-600 mb-1">Тренер:</div>
                    <div className="font-medium break-words">{currentUser?.trainerName}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-gray-600 mb-1">Email представителя:</div>
                    <div className="font-medium break-all">{currentUser?.representativeEmail}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-gray-600 mb-1">Телефон представителя:</div>
                    <div className="font-medium">{currentUser?.representativePhone}</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-gray-600 mb-1">Дата регистрации:</div>
                    <div className="font-medium">{formatDate(currentUser?.registrationDate)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
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

  const renderResults = () => {
    // Функция для валидации турнирных данных
    const validateTournamentData = (games: any[], players: string[]) => {
      const errors: string[] = [];
      const maxRound = Math.max(...games.map(g => g.round));
      
      for (let round = 1; round <= maxRound; round++) {
        const roundGames = games.filter(g => g.round === round);
        const playersInRound = new Set<string>();
        
        roundGames.forEach(game => {
          if (playersInRound.has(game.white)) {
            errors.push(`Тур ${round}: ${game.white} играет более одной партии`);
          }
          if (playersInRound.has(game.black)) {
            errors.push(`Тур ${round}: ${game.black} играет более одной партии`);
          }
          playersInRound.add(game.white);
          playersInRound.add(game.black);
        });
      }
      
      return errors;
    };

    // Функция для генерации согласованных результатов турнира на основе реестра партий
    const generateTournamentResults = (games: any[], players: string[]) => {
      // Проверяем данные на корректность
      const validationErrors = validateTournamentData(games, players);
      if (validationErrors.length > 0) {
        console.warn('Ошибки в турнирных данных:', validationErrors);
      }
      
      const results: any = {};
      
      // Инициализация результатов для каждого игрока
      players.forEach(player => {
        results[player] = {
          roundResults: [],
          opponents: [],
          points: 0,
          gamesPlayed: 0
        };
      });

      // Обработка партий по турам
      const maxRound = Math.max(...games.map(g => g.round));
      
      for (let round = 1; round <= maxRound; round++) {
        const roundGames = games.filter(g => g.round === round);
        
        players.forEach(player => {
          const game = roundGames.find(g => g.white === player || g.black === player);
          
          if (game) {
            const isWhite = game.white === player;
            const opponent = isWhite ? game.black : game.white;
            let result = 0;
            
            if (game.result === '1-0') {
              result = isWhite ? 1 : 0;
            } else if (game.result === '0-1') {
              result = isWhite ? 0 : 1;
            } else if (game.result === '0.5-0.5') {
              result = 0.5;
            }
            
            results[player].roundResults.push(result);
            results[player].opponents.push(opponent);
            results[player].points += result;
            results[player].gamesPlayed += 1;
          } else {
            // Если игрок не играл в этом туре (проходил)
            results[player].roundResults.push('—');
            results[player].opponents.push('Проход');
          }
        });
      }
      
      return results;
    };

    const completedTournaments = [
      {
        id: 1,
        title: 'Весенний турнир "Юные мастера"',
        date: '2025-03-15',
        participants: 8,
        status: 'Завершен',
        winner: 'Иванов Максим',
        rounds: 7,
        players: ['Иванов Максим', 'Смирнова Анна', 'Козлов Денис', 'Петрова София', 'Новиков Артем', 'Волков Егор', 'Лебедева Мария', 'Морозов Никита'],
        playerAges: {
          'Иванов Максим': 9,
          'Смирнова Анна': 10,
          'Козлов Денис': 11,
          'Петрова София': 8,
          'Новиков Артем': 10,
          'Волков Егор': 9,
          'Лебедева Мария': 8,
          'Морозов Никита': 11
        },
        games: [
          // Тур 1
          { round: 1, white: 'Иванов Максим', black: 'Морозов Никита', result: '1-0' },
          { round: 1, white: 'Смирнова Анна', black: 'Лебедева Мария', result: '1-0' },
          { round: 1, white: 'Козлов Денис', black: 'Петрова София', result: '0.5-0.5' },
          { round: 1, white: 'Новиков Артем', black: 'Волков Егор', result: '0-1' },
          
          // Тур 2
          { round: 2, white: 'Козлов Денис', black: 'Смирнова Анна', result: '0.5-0.5' },
          { round: 2, white: 'Лебедева Мария', black: 'Иванов Максим', result: '0-1' },
          { round: 2, white: 'Петрова София', black: 'Новиков Артем', result: '0-1' },
          { round: 2, white: 'Морозов Никита', black: 'Волков Егор', result: '0.5-0.5' },
          
          // Тур 3
          { round: 3, white: 'Иванов Максим', black: 'Козлов Денис', result: '0.5-0.5' },
          { round: 3, white: 'Смирнова Анна', black: 'Морозов Никита', result: '1-0' },
          { round: 3, white: 'Волков Егор', black: 'Новиков Артем', result: '1-0' },
          { round: 3, white: 'Лебедева Мария', black: 'Петрова София', result: '0-1' },
          
          // Тур 4
          { round: 4, white: 'Иванов Максим', black: 'Новиков Артем', result: '1-0' },
          { round: 4, white: 'Смирнова Анна', black: 'Волков Егор', result: '1-0' },
          { round: 4, white: 'Козлов Денис', black: 'Лебедева Мария', result: '0.5-0.5' },
          { round: 4, white: 'Петрова София', black: 'Морозов Никита', result: '1-0' },
          
          // Тур 5
          { round: 5, white: 'Иванов Максим', black: 'Волков Егор', result: '1-0' },
          { round: 5, white: 'Смирнова Анна', black: 'Петрова София', result: '0.5-0.5' },
          { round: 5, white: 'Козлов Денис', black: 'Морозов Никита', result: '1-0' },
          { round: 5, white: 'Новиков Артем', black: 'Лебедева Мария', result: '1-0' },
          
          // Тур 6
          { round: 6, white: 'Петрова София', black: 'Иванов Максим', result: '0-1' },
          { round: 6, white: 'Новиков Артем', black: 'Смирнова Анна', result: '0-1' },
          { round: 6, white: 'Козлов Денис', black: 'Волков Егор', result: '0.5-0.5' },
          { round: 6, white: 'Лебедева Мария', black: 'Морозов Никита', result: '1-0' },
          
          // Тур 7
          { round: 7, white: 'Смирнова Анна', black: 'Иванов Максим', result: '0.5-0.5' },
          { round: 7, white: 'Козлов Денис', black: 'Новиков Артем', result: '1-0' },
          { round: 7, white: 'Петрова София', black: 'Волков Егор', result: '0-1' },
          { round: 7, white: 'Морозов Никита', black: 'Лебедева Мария', result: '0.5-0.5' }
        ]
      },
      {
        id: 2,
        title: 'Зимний кубок',
        date: '2025-01-20',
        participants: 6,
        status: 'Завершен',
        winner: 'Козлов Денис',
        rounds: 5,
        players: ['Козлов Денис', 'Иванов Максим', 'Петрова София', 'Смирнова Анна', 'Новиков Артем', 'Волков Егор'],
        playerAges: {
          'Козлов Денис': 11,
          'Иванов Максим': 9,
          'Петрова София': 8,
          'Смирнова Анна': 10,
          'Новиков Артем': 10,
          'Волков Егор': 9
        },
        games: [
          { round: 1, white: 'Козлов Денис', black: 'Волков Егор', result: '1-0' },
          { round: 1, white: 'Иванов Максим', black: 'Новиков Артем', result: '1-0' },
          { round: 1, white: 'Петрова София', black: 'Смирнова Анна', result: '0.5-0.5' },
          
          { round: 2, white: 'Козлов Денис', black: 'Иванов Максим', result: '1-0' },
          { round: 2, white: 'Смирнова Анна', black: 'Волков Егор', result: '1-0' },
          { round: 2, white: 'Петрова София', black: 'Новиков Артем', result: '1-0' },
          
          { round: 3, white: 'Козлов Денис', black: 'Смирнова Анна', result: '1-0' },
          { round: 3, white: 'Петрова София', black: 'Иванов Максим', result: '0.5-0.5' },
          { round: 3, white: 'Новиков Артем', black: 'Волков Егор', result: '1-0' },
          
          { round: 4, white: 'Козлов Денис', black: 'Петрова София', result: '0.5-0.5' },
          { round: 4, white: 'Смирнова Анна', black: 'Иванов Максим', result: '0-1' },
          { round: 4, white: 'Новиков Артем', black: 'Волков Егор', result: '1-0' },
          
          { round: 5, white: 'Козлов Денис', black: 'Новиков Артем', result: '1-0' },
          { round: 5, white: 'Иванов Максим', black: 'Волков Егор', result: '1-0' },
          { round: 5, white: 'Петрова София', black: 'Смирнова Анна', result: '1-0' }
        ]
      },
      {
        id: 3,
        title: 'Осенний турнир',
        date: '2024-10-12',
        participants: 4,
        status: 'Завершен',
        winner: 'Смирнова Анна',
        rounds: 3,
        players: ['Смирнова Анна', 'Иванов Максим', 'Козлов Денис', 'Петрова София'],
        playerAges: {
          'Смирнова Анна': 10,
          'Иванов Максим': 9,
          'Козлов Денис': 11,
          'Петрова София': 8
        },
        games: [
          { round: 1, white: 'Смирнова Анна', black: 'Петрова София', result: '1-0' },
          { round: 1, white: 'Иванов Максим', black: 'Козлов Денис', result: '0.5-0.5' },
          
          { round: 2, white: 'Смирнова Анна', black: 'Козлов Денис', result: '1-0' },
          { round: 2, white: 'Иванов Максим', black: 'Петрова София', result: '1-0' },
          
          { round: 3, white: 'Смирнова Анна', black: 'Иванов Максим', result: '0.5-0.5' },
          { round: 3, white: 'Козлов Денис', black: 'Петрова София', result: '1-0' }
        ]
      }
    ];

    if (selectedTournament) {
      // Генерируем согласованные результаты на основе реестра партий
      const tournamentResults = generateTournamentResults(selectedTournament.games, selectedTournament.players);
      
      // Сортируем участников по очкам для определения мест
      const sortedPlayers = selectedTournament.players
        .map(player => ({
          name: player,
          age: selectedTournament.playerAges[player],
          points: tournamentResults[player].points,
          games: tournamentResults[player].gamesPlayed,
          roundResults: tournamentResults[player].roundResults,
          opponents: tournamentResults[player].opponents
        }))
        .sort((a, b) => b.points - a.points)
        .map((player, index) => ({ ...player, place: index + 1 }));

      return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => setSelectedTournament(null)}
              className="mb-4"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад к результатам
            </Button>
            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
              {selectedTournament.title}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <span>Дата: {formatDate(selectedTournament.date)}</span>
              <span>•</span>
              <span>Участников: {selectedTournament.participants}</span>
              <span>•</span>
              <span className="text-primary font-medium">Победитель: {sortedPlayers[0].name}</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Итоговая таблица</CardTitle>
              <CardDescription>Результаты турнира по швейцарской системе (данные согласованы с реестром партий)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-3 px-4 font-semibold">Место</th>
                      <th className="text-left py-3 px-4 font-semibold">ФИ участника</th>
                      <th className="text-center py-3 px-4 font-semibold">Возраст</th>
                      {Array.from({ length: selectedTournament.rounds }, (_, i) => (
                        <th key={i} className="text-center py-3 px-2 font-semibold text-sm min-w-[50px]">
                          {i + 1}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-semibold">Очки</th>
                      <th className="text-center py-3 px-4 font-semibold">Партий</th>
                      <th className="text-center py-3 px-4 font-semibold">Процент</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayers.map((result: any) => (
                      <tr 
                        key={result.place} 
                        className={`border-b hover:bg-gray-50 ${result.place <= 3 ? 'bg-yellow-50' : ''}`}
                      >
                        <td className="py-3 px-4 font-semibold">
                          {result.place <= 3 && (
                            <Icon 
                              name={result.place === 1 ? "Trophy" : result.place === 2 ? "Medal" : "Award"} 
                              size={16} 
                              className={`inline mr-2 ${result.place === 1 ? 'text-yellow-500' : result.place === 2 ? 'text-gray-400' : 'text-orange-600'}`} 
                            />
                          )}
                          {result.place}
                        </td>
                        <td className="py-3 px-4">{result.name}</td>
                        <td className="py-3 px-4 text-center">{result.age} лет</td>
                        {result.roundResults.map((roundResult: any, roundIndex: number) => (
                          <td key={roundIndex} className="py-3 px-2 text-center text-sm font-medium">
                            {roundResult === '—' ? (
                              <span 
                                className="text-gray-400" 
                                title={`Тур ${roundIndex + 1} | Проход`}
                              >
                                —
                              </span>
                            ) : (
                              <span 
                                className={`inline-block w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-help ${
                                  roundResult === 1 ? 'bg-green-100 text-green-800' : 
                                  roundResult === 0.5 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}
                                title={`Тур ${roundIndex + 1} | Соперник: ${result.opponents && result.opponents[roundIndex] ? result.opponents[roundIndex] : 'Проход'} | ${
                                  roundResult === 1 ? 'Победа' : 
                                  roundResult === 0.5 ? 'Ничья' : 
                                  'Поражение'
                                }`}
                              >
                                {roundResult === 0.5 ? '½' : roundResult}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="py-3 px-4 text-center font-semibold">{result.points}</td>
                        <td className="py-3 px-4 text-center">{result.games}</td>
                        <td className="py-3 px-4 text-center">
                          {result.games > 0 ? Math.round((result.points / result.games) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">Результаты турниров</h1>
          <p className="text-gray-600 font-body">Архив проведенных турниров и их результаты</p>
        </div>

        <div className="grid gap-6">
          {completedTournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon name="Trophy" size={20} className="text-primary" />
                      <h3 className="text-xl font-heading font-semibold">{tournament.title}</h3>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {tournament.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Icon name="Calendar" size={16} className="mr-1" />
                        {formatDate(tournament.date)}
                      </span>
                      <span className="flex items-center">
                        <Icon name="Users" size={16} className="mr-1" />
                        {tournament.participants} участников
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Crown" size={16} className="text-yellow-500" />
                      <span className="text-sm font-medium">Победитель: {tournament.winner}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedTournament(tournament)}
                    className="bg-primary hover:bg-gold-600 text-black ml-4"
                  >
                    Посмотреть протокол
                    <Icon name="ChevronRight" size={16} className="ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

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
      case 'results':
        return renderResults();
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
              <div className="flex items-center mb-4">
                <img 
                  src="https://cdn.poehali.dev/files/f7c22529-8aec-4d54-8fdf-65bbb1fc6ed7.png" 
                  alt="Мир шахмат" 
                  className="h-24 w-auto filter brightness-0 invert"
                />
              </div>
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

      {/* Диалог регистрации на турнир с оплатой */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Регистрация на турнир</DialogTitle>
            <DialogDescription className="font-body">
              {selectedTournamentForRegistration?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Информация об участнике */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Участник</h4>
              <p className="text-sm text-gray-600">{currentUser?.fullName}</p>
              <p className="text-sm text-gray-600">ID ФШР: {currentUser?.fcrId}</p>
            </div>

            {/* Информация о стоимости */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Стоимость участия:</span>
                <span className="text-2xl font-bold text-blue-600">250 ₽</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Оплата производится единовременно при регистрации
              </p>
            </div>

            {/* Статус оплаты */}
            {paymentStatus === 'processing' && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <span className="text-yellow-700">Обработка платежа...</span>
                </div>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                  <span className="text-green-700">Платеж успешно обработан!</span>
                </div>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRegistrationDialog(false)}
                disabled={paymentStatus === 'processing'}
              >
                Отмена
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-gold-600 text-black"
                onClick={processPayment}
                disabled={paymentStatus === 'processing' || paymentStatus === 'success'}
              >
                {paymentStatus === 'processing' ? 'Обработка...' : 
                 paymentStatus === 'success' ? 'Готово' : 'Оплатить 250 ₽'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;