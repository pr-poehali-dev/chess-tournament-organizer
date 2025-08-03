export interface UserData {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  fcrId: string; // ID ФШР
  educationalInstitution: string;
  trainerName: string;
  representativeEmail: string;
  representativePhone: string;
  userType: 'child' | 'parent' | 'trainer';
  registrationDate: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserData | null;
  userType: 'child' | 'parent' | 'trainer' | null;
}