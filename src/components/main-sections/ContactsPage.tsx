import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const ContactsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-6">
          Контакты
        </h1>
        <p className="text-xl text-gray-600 font-body">
          Свяжитесь с нами любым удобным способом
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Информация о центре</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Icon name="MapPin" size={20} className="text-black" />
              </div>
              <div>
                <div className="font-semibold">Адрес</div>
                <div className="text-gray-600">г. Москва, ул. Шахматная, д. 1</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Phone" size={20} className="text-black" />
              </div>
              <div>
                <div className="font-semibold">Телефон</div>
                <div className="text-gray-600">+7 (495) 123-45-67</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Mail" size={20} className="text-black" />
              </div>
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-gray-600">info@chess-world.ru</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Clock" size={20} className="text-black" />
              </div>
              <div>
                <div className="font-semibold">Режим работы</div>
                <div className="text-gray-600">Пн-Пт: 9:00 - 18:00<br />Сб-Вс: 10:00 - 16:00</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Задайте вопрос</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Есть вопросы о турнирах, регистрации или технической поддержке? 
                Мы всегда готовы помочь!
              </p>
              
              <div className="flex flex-col space-y-2">
                <Button className="bg-primary hover:bg-gold-600 text-black">
                  <Icon name="MessageSquare" size={16} className="mr-2" />
                  Написать в чат поддержки
                </Button>
                <Button variant="outline">
                  <Icon name="Phone" size={16} className="mr-2" />
                  Заказать обратный звонок
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="font-semibold mb-2">Социальные сети</div>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm">
                    <Icon name="MessageCircle" size={16} className="mr-2" />
                    Telegram
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icon name="Globe" size={16} className="mr-2" />
                    VK
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-gradient-to-r from-primary/10 to-gold-100/50">
        <CardContent className="p-8 text-center">
          <Icon name="Users" size={48} className="mx-auto text-primary mb-4" />
          <h3 className="text-2xl font-bold mb-2">Присоединяйтесь к нашему сообществу!</h3>
          <p className="text-gray-600 mb-4">
            Более 500 детей уже участвуют в наших турнирах. Станьте частью большой шахматной семьи!
          </p>
          <Button size="lg" className="bg-primary hover:bg-gold-600 text-black">
            <Icon name="Trophy" size={20} className="mr-2" />
            Регистрация на турнир
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactsPage;