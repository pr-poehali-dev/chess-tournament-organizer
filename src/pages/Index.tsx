import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import TournamentRoom from '@/components/TournamentRoom';

// Импорт компонентов секций
import Navigation from '@/components/main-sections/Navigation';
import HomePage from '@/components/main-sections/HomePage';
import TournamentsPage from '@/components/main-sections/TournamentsPage';
import PlayPage from '@/components/main-sections/PlayPage';
import ResultsPage from '@/components/main-sections/ResultsPage';
import PlayerStats from '@/components/chess/PlayerStats';
import RewardsShop from '@/components/main-sections/RewardsShop';
import AboutPage from '@/components/main-sections/AboutPage';
import ContactsPage from '@/components/main-sections/ContactsPage';
import AuthPage from '@/components/main-sections/AuthPage';
import AdminPanel from '@/components/admin/AdminPanel';
import { useAuth } from '@/contexts/AuthContext';

// Типы
import { 
  Tournament, 
  NavigationItem, 
  OrderForm, 
  PaymentStatus, 
  ActiveSection 
} from '@/components/main-sections/types';

const Index = () => {
  const { isLoggedIn, user: currentUser } = useAuth();
  
  // Основное состояние
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [userRole, setUserRole] = useState('participant');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());



  // Состояние турниров
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [selectedTournamentForRegistration, setSelectedTournamentForRegistration] = useState<Tournament | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [showTournamentRoom, setShowTournamentRoom] = useState(false);
  const [currentTournamentId, setCurrentTournamentId] = useState<string | null>(null);

  // Состояние корзины наград
  const [rewardCart, setRewardCart] = useState<{[key: string]: number}>({});
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    name: '',
    phone: '',
    email: '',
    address: '',
    includeDelivery: false
  });

  // Данные турниров
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка турниров из API
  const loadTournaments = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://functions.poehali.dev/0ea7af08-6a91-44d1-bee2-e83909110e5d');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.tournaments) {
        // Преобразуем данные из БД в формат Tournament
        const tournaments: Tournament[] = data.tournaments.map((t: any) => ({
          id: t.id.toString(),
          title: t.name,
          description: t.description || '',
          date: new Date(t.start_date).toLocaleDateString('ru-RU'),
          time: t.start_time_msk || '10:00',
          participants: t.current_participants || 0,
          maxParticipants: t.max_participants || 0,
          entryFee: t.entry_fee || 0,
          timeControl: t.time_control || '90+30',
          ageCategory: t.age_category || 'открытая',
          format: t.tournament_type || 'Швейцарская система',
          status: t.status as 'upcoming' | 'active' | 'completed'
        }));
        setUpcomingTournaments(tournaments);
      }
    } catch (error) {
      console.error('Ошибка загрузки турниров:', error);
      // Устанавливаем пустой массив при ошибке
      setUpcomingTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  // Навигация
  const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Главная', icon: 'Home' },
    { id: 'tournaments', label: 'Турниры', icon: 'Trophy' },
    { id: 'play', label: 'Игра', icon: 'Gamepad2' },
    { id: 'results', label: 'Результаты', icon: 'Award' },
    { id: 'stats', label: 'Статистика', icon: 'BarChart3' },
    { id: 'rewards', label: 'Награды', icon: 'Medal' },
    { id: 'about', label: 'О центре', icon: 'Info' },
    { id: 'contacts', label: 'Контакты', icon: 'Phone' },
    { id: 'profile', label: isLoggedIn ? 'Личный кабинет' : 'Регистрация', icon: 'User' }
  ];

  // Обработчики
  const handleTournamentRegistration = (tournament: Tournament) => {
    if (!isLoggedIn) {
      alert('Для регистрации на турнир необходимо войти в систему');
      return;
    }
    setSelectedTournamentForRegistration(tournament);
    setShowRegistrationDialog(true);
    setPaymentStatus('pending');
  };

  const processPayment = async () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        setShowRegistrationDialog(false);
        setPaymentStatus('pending');
        alert(`Вы успешно зарегистрированы на турнир "${selectedTournamentForRegistration?.title}"`);
      }, 2000);
    }, 3000);
  };



  const enterTournamentRoom = (tournamentId: string) => {
    if (!isLoggedIn || !currentUser) {
      alert('Войдите в систему для доступа к турнирному залу');
      return;
    }
    setCurrentTournamentId(tournamentId);
    setShowTournamentRoom(true);
  };

  // Обработчики корзины наград
  const addToCart = (itemId: string) => {
    setRewardCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setRewardCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const handleOrderSubmit = () => {
    if (!orderForm.name || !orderForm.phone || !orderForm.email) {
      alert('Заполните все обязательные поля');
      return;
    }
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      setRewardCart({});
      setOrderForm({ name: '', phone: '', email: '', address: '', includeDelivery: false });
      setShowOrderForm(false);
      alert('Заказ успешно оформлен!');
    }, 2000);
  };

  // Рендер содержимого
  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <HomePage
            upcomingTournaments={upcomingTournaments}
            onSectionChange={setActiveSection}
            onTournamentRegistration={handleTournamentRegistration}
            onEnterTournamentRoom={enterTournamentRoom}
          />
        );
      case 'tournaments':
        return (
          <TournamentsPage
            upcomingTournaments={upcomingTournaments}
            selectedDate={selectedDate}
            userRole={userRole}
            loading={loading}
            onDateChange={setSelectedDate}
            onTournamentRegistration={handleTournamentRegistration}
            onEnterTournamentRoom={enterTournamentRoom}
          />
        );
      case 'play':
        return <PlayPage />;
      case 'results':
        return (
          <ResultsPage
            selectedTournament={selectedTournament}
            onTournamentSelect={setSelectedTournament}
          />
        );
      case 'stats':
        return <PlayerStats />;
      case 'rewards':
        return (
          <RewardsShop
            rewardCart={rewardCart}
            orderForm={orderForm}
            showOrderForm={showOrderForm}
            paymentStatus={paymentStatus}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            onShowOrderForm={setShowOrderForm}
            onOrderFormChange={setOrderForm}
            onOrderSubmit={handleOrderSubmit}
          />
        );
      case 'about':
        return <AboutPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'profile':
        return <AuthPage />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <HomePage
          upcomingTournaments={upcomingTournaments}
          loading={loading}
          onSectionChange={setActiveSection}
          onTournamentRegistration={handleTournamentRegistration}
          onEnterTournamentRoom={enterTournamentRoom}
        />;
    }
  };

  // Показ турнирного зала
  if (showTournamentRoom && currentTournamentId && currentUser) {
    return (
      <TournamentRoom
        tournamentId={currentTournamentId}
        currentUser={currentUser.fullName}
        onBack={() => setShowTournamentRoom(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        navigationItems={navigationItems}
      />
      
      <main>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-heading font-semibold mb-4">Мир шахмат</h3>
              <p className="text-gray-400 font-body">
                Развиваем шахматное мастерство детей через онлайн-турниры
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Навигация</h4>
              <div className="space-y-2">
                {navigationItems.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as ActiveSection)}
                    className="block text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Информация</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection('about')}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  О центре
                </button>
                <button
                  onClick={() => setActiveSection('contacts')}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Контакты
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="text-gray-400 space-y-2">
                <p>+7 (495) 123-45-67</p>
                <p>info@chess-world.ru</p>
                <p>г. Москва</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Центр "Мир шахмат". Все права защищены.</p>
          </div>
        </div>
      </footer>

      {/* Диалог регистрации на турнир */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Регистрация на турнир</DialogTitle>
            <DialogDescription>
              {selectedTournamentForRegistration?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span>Взнос за участие:</span>
                <span className="text-xl font-bold text-primary">
                  {selectedTournamentForRegistration?.entryFee}₽
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Номер карты</Label>
              <Input
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Срок действия</Label>
                <Input id="expiry" placeholder="ММ/ГГ" />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" />
              </div>
            </div>

            <Button
              onClick={processPayment}
              className="w-full"
              disabled={paymentStatus === 'processing'}
            >
              {paymentStatus === 'processing' ? (
                <>Обработка платежа...</>
              ) : (
                <>
                  <Icon name="CreditCard" size={16} className="mr-2" />
                  Оплатить {selectedTournamentForRegistration?.entryFee}₽
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;