import { createContext, useContext } from 'react';

export type UserRole = 'admin' | 'staff' | 'viewer';

export interface RegisteredUser {
  username: string; // unique identifier
  passwordHash: string; // encoded password
  phoneNumber: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthUser {
  username: string;
  phoneNumber: string;
  role: UserRole;
  loginTime: string;
}

export interface LoginResult {
  success: boolean;
  reason?: 'not_found' | 'wrong_password' | 'wrong_phone' | 'user_exists' | 'invalid_input';
  message?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<LoginResult>;
  signup: (data: { username: string; password: string; phoneNumber: string }) => Promise<LoginResult>;
  logout: () => void;
  // User Registry Management (Admin functions)
  allUsers: RegisteredUser[];
  refreshUsers: () => Promise<void>;
  addUser: (newUser: {
    username: string;
    phoneNumber: string;
    password: string;
    role: UserRole;
  }) => { success: boolean; error?: string };
  updateUserRole: (username: string, role: UserRole) => void;
  deleteUser: (username: string) => { success: boolean; error?: string };
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
