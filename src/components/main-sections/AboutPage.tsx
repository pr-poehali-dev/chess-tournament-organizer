import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-6">
          О центре "Мир шахмат"
        </h1>
        <p className="text-xl text-gray-600 font-body">
          Развиваем шахматное мастерство детей через интерактивные онлайн-турниры
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Target" size={20} className="text-primary" />
              Наша миссия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 font-body">
              Создать безопасную и увлекательную среду для развития шахматных навыков детей, 
              где они могут соревноваться, учиться и находить новых друзей-единомышленников.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Eye" size={20} className="text-primary" />
              Наше видение
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 font-body">
              Стать ведущей платформой для детских шахматных соревнований в России, 
              воспитывая новое поколение стратегически мыслящих и творческих личностей.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6 text-center">
          Почему выбирают нас
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Users" size={32} className="text-black" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Опытные тренеры</h3>
            <p className="text-gray-600">Квалифицированные специалисты с многолетним опытом работы с детьми</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Shield" size={32} className="text-black" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Безопасность</h3>
            <p className="text-gray-600">Модерируемые турниры в защищенной онлайн-среде для детей</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Trophy" size={32} className="text-black" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Достижения</h3>
            <p className="text-gray-600">Официальные награды и сертификаты за участие и победы</p>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-gold-100/50">
        <CardHeader>
          <CardTitle className="text-center">Присоединяйтесь к нам!</CardTitle>
          <CardDescription className="text-center">
            Станьте частью большого шахматного сообщества
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm text-gray-600">Участников</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-gray-600">Турниров проведено</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">98%</div>
              <div className="text-sm text-gray-600">Довольных родителей</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;