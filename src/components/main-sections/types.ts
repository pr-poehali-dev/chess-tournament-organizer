export interface RegistrationData {
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  fcrId: string;
  educationalInstitution: string;
  trainerName: string;
  representativeEmail: string;
  representativePhone: string;
  userType: 'child' | 'parent' | 'trainer';
  password: string;
}

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
  description: string;
  participants: number;
  maxParticipants: number;
  entryFee: number;
  timeControl: string;
  format: string;
  location: string;
  status: 'upcoming' | 'active' | 'finished';
  prizePool: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'success' | 'error';
export type ActiveSection = 'home' | 'tournaments' | 'play' | 'results' | 'rewards' | 'about' | 'contacts' | 'profile';