import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  AuthContext,
  type AuthUser,
  type RegisteredUser,
  type UserRole,
  type LoginResult,
} from './AuthContext';
import {
  getInitialCloudConfig,
  fetchUsersFromCloud,
  pushUsersToCloud,
  onBroadcastUpdate,
} from '../lib/cloudSync';

const STORAGE_AUTH_KEY = 'catering_auth_user_v1';
const STORAGE_USERS_KEY = 'catering_registered_users_v1';

const ROOT_ADMIN: RegisteredUser = {
  username: 'krishnajith',
  passwordHash: btoa('kps@krishnajith'),
  phoneNumber: '8089608409',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function normalizePhone(p: string): string {
  return p.replace(/[\s\-()]/g, '').replace(/^\+/, '');
}

function loadLocalUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    let list: RegisteredUser[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];

    // Ensure root admin always exists with 'admin' role
    const adminIdx = list.findIndex(
      u => u.username.toLowerCase() === ROOT_ADMIN.username.toLowerCase()
    );
    if (adminIdx === -1) {
      list.unshift(ROOT_ADMIN);
    } else {
      list[adminIdx] = {
        ...list[adminIdx],
        role: 'admin',
        passwordHash: ROOT_ADMIN.passwordHash,
        phoneNumber: ROOT_ADMIN.phoneNumber,
      };
    }

    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
    return list;
  } catch {
    return [ROOT_ADMIN];
  }
}

function saveLocalUsers(users: RegisteredUser[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [allUsers, setAllUsers] = useState<RegisteredUser[]>(() => loadLocalUsers());

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        const users = loadLocalUsers();
        const found = users.find(
          u => u.username.toLowerCase() === parsed.username.toLowerCase()
        );
        if (found) {
          return {
            username: found.username,
            phoneNumber: found.phoneNumber,
            role: found.role,
            loginTime: parsed.loginTime || new Date().toISOString(),
          };
        }
      }
    } catch {
      // Storage error or invalid JSON
    }
    return null;
  });

  // Sync users with cloud on load or when cloud is enabled
  useEffect(() => {
    const cloudConfig = getInitialCloudConfig();
    if (!cloudConfig.enabled || !cloudConfig.firebaseUrl) return;

    fetchUsersFromCloud(cloudConfig).then(remoteUsers => {
      if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
        const mergedMap = new Map<string, RegisteredUser>();
        // Add root admin first
        mergedMap.set(ROOT_ADMIN.username.toLowerCase(), ROOT_ADMIN);

        // Add local users
        loadLocalUsers().forEach(u => mergedMap.set(u.username.toLowerCase(), u));

        // Add remote users
        (remoteUsers as RegisteredUser[]).forEach(u => {
          if (u && u.username) {
            const key = u.username.toLowerCase();
            if (key !== ROOT_ADMIN.username.toLowerCase()) {
              mergedMap.set(key, u);
            }
          }
        });

        const merged = Array.from(mergedMap.values());
        saveLocalUsers(merged);
        setAllUsers(merged);
      } else {
        // Initialize cloud with current local users
        pushUsersToCloud(loadLocalUsers(), cloudConfig);
      }
    });

    const unsubscribe = onBroadcastUpdate(data => {
      if (data.type === 'USERS_MUTATED') {
        const updated = loadLocalUsers();
        setAllUsers(updated);
      }
    });

    return unsubscribe;
  }, []);

  const login = useCallback(
    (credentials: {
      username: string;
      phoneNumber: string;
      password: string;
    }): LoginResult => {
      const trimmedUser = credentials.username.trim();
      const trimmedPass = credentials.password;
      const cleanPhone = normalizePhone(credentials.phoneNumber);

      const users = loadLocalUsers();
      const found = users.find(
        u => u.username.toLowerCase() === trimmedUser.toLowerCase()
      );

      if (!found) {
        return {
          success: false,
          reason: 'not_found',
          message:
            'No registered account found with this username. Only registered staff can access Catering Hub. Contact admin.',
        };
      }

      // Check password
      const hash = btoa(trimmedPass);
      if (found.passwordHash !== hash && found.passwordHash !== trimmedPass) {
        return {
          success: false,
          reason: 'wrong_password',
          message: 'Incorrect password. Please try again.',
        };
      }

      // Check phone number digits
      const registeredPhone = normalizePhone(found.phoneNumber);
      if (registeredPhone !== cleanPhone) {
        return {
          success: false,
          reason: 'wrong_phone',
          message: 'Phone number does not match registered account.',
        };
      }

      // Successful login
      const now = new Date().toISOString();
      const updatedUsers = users.map(u =>
        u.username.toLowerCase() === found.username.toLowerCase()
          ? { ...u, lastLoginAt: now }
          : u
      );
      saveLocalUsers(updatedUsers);
      setAllUsers(updatedUsers);

      const cloudConfig = getInitialCloudConfig();
      if (cloudConfig.enabled && cloudConfig.firebaseUrl) {
        pushUsersToCloud(updatedUsers, cloudConfig);
      }

      const authUser: AuthUser = {
        username: found.username,
        phoneNumber: found.phoneNumber,
        role: found.role,
        loginTime: now,
      };

      setUser(authUser);
      try {
        localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(authUser));
      } catch {
        // Storage quota
      }

      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_AUTH_KEY);
    } catch {
      // Storage error
    }
  }, []);

  const addUser = useCallback(
    (newUserData: {
      username: string;
      phoneNumber: string;
      password: string;
      role: UserRole;
    }): { success: boolean; error?: string } => {
      const trimmedUser = newUserData.username.trim();
      if (!trimmedUser || trimmedUser.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters' };
      }
      if (!newUserData.password || newUserData.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }
      const cleanPhone = normalizePhone(newUserData.phoneNumber);
      if (!cleanPhone || cleanPhone.length < 7) {
        return { success: false, error: 'Valid phone number is required (min 7 digits)' };
      }

      const current = loadLocalUsers();
      if (current.some(u => u.username.toLowerCase() === trimmedUser.toLowerCase())) {
        return { success: false, error: `Username "${trimmedUser}" is already registered` };
      }

      const newUser: RegisteredUser = {
        username: trimmedUser,
        passwordHash: btoa(newUserData.password),
        phoneNumber: newUserData.phoneNumber.trim(),
        role: newUserData.role,
        createdAt: new Date().toISOString(),
      };

      const updated = [...current, newUser];
      saveLocalUsers(updated);
      setAllUsers(updated);

      const cloudConfig = getInitialCloudConfig();
      if (cloudConfig.enabled && cloudConfig.firebaseUrl) {
        pushUsersToCloud(updated, cloudConfig);
      }

      return { success: true };
    },
    []
  );

  const updateUserRole = useCallback(
    (targetUsername: string, newRole: UserRole) => {
      if (targetUsername.toLowerCase() === ROOT_ADMIN.username.toLowerCase()) {
        return; // Root admin role cannot be changed
      }

      const current = loadLocalUsers();
      const updated = current.map(u =>
        u.username.toLowerCase() === targetUsername.toLowerCase()
          ? { ...u, role: newRole }
          : u
      );

      saveLocalUsers(updated);
      setAllUsers(updated);

      // If the currently logged in user is being modified, update active session
      if (user && user.username.toLowerCase() === targetUsername.toLowerCase()) {
        const updatedUser: AuthUser = { ...user, role: newRole };
        setUser(updatedUser);
        try {
          localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(updatedUser));
        } catch {
          // ignore
        }
      }

      const cloudConfig = getInitialCloudConfig();
      if (cloudConfig.enabled && cloudConfig.firebaseUrl) {
        pushUsersToCloud(updated, cloudConfig);
      }
    },
    [user]
  );

  const deleteUser = useCallback(
    (targetUsername: string): { success: boolean; error?: string } => {
      if (targetUsername.toLowerCase() === ROOT_ADMIN.username.toLowerCase()) {
        return { success: false, error: 'Primary admin account cannot be deleted' };
      }

      const current = loadLocalUsers();
      const updated = current.filter(
        u => u.username.toLowerCase() !== targetUsername.toLowerCase()
      );

      saveLocalUsers(updated);
      setAllUsers(updated);

      const cloudConfig = getInitialCloudConfig();
      if (cloudConfig.enabled && cloudConfig.firebaseUrl) {
        pushUsersToCloud(updated, cloudConfig);
      }

      return { success: true };
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        allUsers,
        addUser,
        updateUserRole,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
