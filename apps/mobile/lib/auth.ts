import { createContext, useContext } from 'react';

export type User = {
  id: number;
  username: string;
  phone: string;
  subscriptionStatus: 'free' | 'active' | 'cancelled' | 'expired';
};

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPaid: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  register: (phone: string, username: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isPaid: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
