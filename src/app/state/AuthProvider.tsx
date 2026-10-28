import { useState, type ReactNode } from 'react';
import { AuthContext, type AuthUser } from './AuthContext';

const STORAGE_AUTH_KEY = 'catering_auth_user_v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_AUTH_KEY);
      if (stored) {
        return JSON.parse(stored) as AuthUser;
      }
    } catch {
      // Storage error or invalid JSON
    }
    return null;
  });

  const login = (credentials: { username: string; phoneNumber: string; password?: string }) => {
    const newUser: AuthUser = {
      username: credentials.username.trim(),
      phoneNumber: credentials.phoneNumber.trim(),
      loginTime: new Date().toISOString(),
    };
    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(newUser));
    } catch {
      // Storage quota or disabled
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_AUTH_KEY);
    } catch {
      // Storage quota or disabled
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

