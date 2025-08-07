import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { OrderForm, PaymentStatus } from './types';

interface RewardsShopProps {
  rewardCart: {[key: string]: number};
  orderForm: OrderForm;
  showOrderForm: boolean;
  paymentStatus: PaymentStatus;
  onAddToCart: (itemId: string) => void;
  onRemoveFromCart: (itemId: string) => void;
  onShowOrderForm: (show: boolean) => void;
  onOrderFormChange: (form: OrderForm) => void;
  onOrderSubmit: () => void;
}

const RewardsShop: React.FC<RewardsShopProps> = ({
  rewardCart,
  orderForm,
  showOrderForm,
  paymentStatus,
  onAddToCart,
  onRemoveFromCart,
  onShowOrderForm,
  onOrderFormChange,
  onOrderSubmit
}) => {
  const getTotalItems = () => {
    return Object.values(rewardCart).reduce((sum, count) => sum + count, 0);
  };

  const getTotalPrice = () => {
    const itemsTotal = Object.values(rewardCart).reduce((sum, count) => sum + count, 0) * 300;
    const deliveryTotal = orderForm.includeDelivery ? 200 : 0;
    return itemsTotal + deliveryTotal;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">Награды и подарки</h1>
        <p className="text-lg text-gray-600">Заказывайте награды за участие в турнирах</p>
      </div>
      
      {/* Корзина */}
      {getTotalItems() > 0 && (
        <div className="mb-8 bg-primary/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="ShoppingCart" size={20} className="text-primary" />
              <span className="font-semibold">В корзине: {getTotalItems()} товаров</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-primary">{getTotalPrice()} ₽</span>
              <Button onClick={() => onShowOrderForm(true)}>
                <Icon name="CreditCard" size={16} className="mr-2" />
                Оформить заказ
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 10 }, (_, index) => {
          const itemId = `reward-${index}`;
          const inCart = rewardCart[itemId] || 0;
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center relative">
                  <Icon name="Gift" size={48} className="text-gray-400" />
                  <span className="ml-2 text-gray-500">Фото {index + 1}</span>
                  {inCart > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-primary text-white">
                      {inCart}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">Награда {index + 1}</h3>
                <p className="text-gray-600 text-sm mb-3">Описание награды будет добавлено позже</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-primary">300 ₽</span>
                  <Badge variant="secondary" className="bg-gold-100 text-gold-800">
                    {10 + index * 5} очков
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {inCart > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveFromCart(itemId)}
                    >
                      <Icon name="Minus" size={14} />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => onAddToCart(itemId)}
                    className="flex-1"
                  >
                    <Icon name="Plus" size={14} className="mr-1" />
                    {inCart > 0 ? 'Добавить ещё' : 'В корзину'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Форма заказа */}
      {showOrderForm && (
        <Dialog open={showOrderForm} onOpenChange={onShowOrderForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Оформление заказа</DialogTitle>
              <DialogDescription>
                Заполните данные для оформления заказа
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Полное имя *</Label>
                <Input
                  id="name"
                  value={orderForm.name}
                  onChange={(e) => onOrderFormChange({ ...orderForm, name: e.target.value })}
                  placeholder="Введите ваше полное имя"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  value={orderForm.phone}
                  onChange={(e) => onOrderFormChange({ ...orderForm, phone: e.target.value })}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={orderForm.email}
                  onChange={(e) => onOrderFormChange({ ...orderForm, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Адрес доставки</Label>
                <Textarea
                  id="address"
                  value={orderForm.address}
                  onChange={(e) => onOrderFormChange({ ...orderForm, address: e.target.value })}
                  placeholder="Введите адрес для доставки"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id="delivery"
                  checked={orderForm.includeDelivery}
                  onChange={(e) => onOrderFormChange({ ...orderForm, includeDelivery: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="delivery" className="flex-1">
                  Добавить доставку (+200 ₽)
                </Label>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Товары ({getTotalItems()} шт.):</span>
                  <span>{Object.values(rewardCart).reduce((sum, count) => sum + count, 0) * 300} ₽</span>
                </div>
                {orderForm.includeDelivery && (
                  <div className="flex justify-between items-center mb-2">
                    <span>Доставка:</span>
                    <span>200 ₽</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Итого:</span>
                  <span className="text-primary">{getTotalPrice()} ₽</span>
                </div>
              </div>
              
              <Button
                onClick={onOrderSubmit}
                className="w-full"
                disabled={paymentStatus === 'processing'}
              >
                {paymentStatus === 'processing' ? (
                  <>Обработка платежа...</>
                ) : (
                  <>
                    <Icon name="CreditCard" size={16} className="mr-2" />
                    Оплатить {getTotalPrice()} ₽
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <div className="mt-12 bg-gradient-to-r from-primary/10 to-gold-100/50 rounded-lg p-6">
        <div className="text-center">
          <Icon name="Medal" size={32} className="mx-auto text-gold-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Как заказать награды?</h2>
          <p className="text-gray-600">
            Добавляйте товары в корзину, оформляйте заказ и получайте награды с доставкой!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RewardsShop;