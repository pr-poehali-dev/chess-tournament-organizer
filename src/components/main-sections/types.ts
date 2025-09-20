

export interface OrderForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  includeDelivery: boolean;
}

export interface Tournament {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  participants: number;
  maxParticipants: number;
  entryFee: number;
  timeControl: string;
  ageCategory: string;
  format: string;
  status: 'upcoming' | 'active' | 'finished';
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'success' | 'error';
export type ActiveSection = 'home' | 'tournaments' | 'play' | 'results' | 'stats' | 'rewards' | 'about' | 'contacts' | 'profile' | 'admin';