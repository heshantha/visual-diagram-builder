import { createContext } from 'react';
import type { User } from 'firebase/auth';
import type { UserDocument, UserRole } from '../types';

export interface AuthContextType {
  user: UserDocument | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: UserRole) => Promise<void>;
  logOut: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

