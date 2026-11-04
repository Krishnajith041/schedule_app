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

export type LoginResult =
  | { success: true }
  | { success: false; reason: 'not_found' | 'wrong_password' | 'wrong_phone'; message: string };

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; phoneNumber: string; password: string }) => LoginResult;
  logout: () => void;
  // User Registry Management (Admin functions)
  allUsers: RegisteredUser[];
  addUser: (newUser: { username: string; phoneNumber: string; password: string; role: UserRole }) => { success: boolean; error?: string };
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
