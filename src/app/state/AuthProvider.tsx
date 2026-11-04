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
  saveCloudSyncConfig,
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

  const refreshUsers = useCallback(async () => {
    const cloudConfig = getInitialCloudConfig();
    let local = loadLocalUsers();

    if (cloudConfig.enabled && cloudConfig.firebaseUrl) {
      try {
        const remoteUsers = await fetchUsersFromCloud(cloudConfig);
        if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
          const mergedMap = new Map<string, RegisteredUser>();
          mergedMap.set(ROOT_ADMIN.username.toLowerCase(), ROOT_ADMIN);
          local.forEach(u => mergedMap.set(u.username.toLowerCase(), u));
          (remoteUsers as RegisteredUser[]).forEach(u => {
            if (u && u.username) {
              const key = u.username.toLowerCase();
              if (key !== ROOT_ADMIN.username.toLowerCase()) {
                mergedMap.set(key, u);
              }
            }
          });
          local = Array.from(mergedMap.values());
          saveLocalUsers(local);
        }
      } catch (err) {
        console.warn('Failed syncing users from cloud', err);
      }
    }
    setAllUsers(local);
  }, []);

  // Sync users with cloud on load, on broadcast, and on 4-second auto-poll interval
  useEffect(() => {
    refreshUsers();

    const interval = setInterval(() => {
      refreshUsers();
    }, 4000);

    const unsubscribe = onBroadcastUpdate(data => {
      if (data.type === 'USERS_MUTATED') {
        refreshUsers();
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [refreshUsers]);

  const login = useCallback(
    async (credentials: {
      username: string;
      password: string;
    }): Promise<LoginResult> => {
      const trimmedUser = credentials.username.trim();
      const trimmedPass = credentials.password;

      if (!trimmedUser) {
        return { success: false, reason: 'invalid_input', message: 'User name is required.' };
      }
      if (!trimmedPass) {
        return { success: false, reason: 'invalid_input', message: 'Password is required.' };
      }

      let users = loadLocalUsers();
      let found = users.find(
        u => u.username.toLowerCase() === trimmedUser.toLowerCase()
      );

      // If user not found in local storage, check if cloud sync has it
      if (!found) {
        const cloudConfig = getInitialCloudConfig();
        if (cloudConfig.enabled && cloudConfig.firebaseUrl) {
          try {
            const remoteUsers = await fetchUsersFromCloud(cloudConfig);
            if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
              const mergedMap = new Map<string, RegisteredUser>();
              mergedMap.set(ROOT_ADMIN.username.toLowerCase(), ROOT_ADMIN);
              users.forEach(u => mergedMap.set(u.username.toLowerCase(), u));
              (remoteUsers as RegisteredUser[]).forEach(u => {
                if (u && u.username) {
                  mergedMap.set(u.username.toLowerCase(), u);
                }
              });
              users = Array.from(mergedMap.values());
              saveLocalUsers(users);
              setAllUsers(users);
              found = users.find(
                u => u.username.toLowerCase() === trimmedUser.toLowerCase()
              );
            }
          } catch {
            // ignore network issues during fallback
          }
        }
      }

      if (!found) {
        return {
          success: false,
          reason: 'not_found',
          message: `No registered account found with username "${trimmedUser}". Please check spelling, or tap Sign Up above to register a new account.`,
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

      // Successful login
      const now = new Date().toISOString();
      const updatedUsers = users.map(u =>
        u.username.toLowerCase() === found!.username.toLowerCase()
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

  const signup = useCallback(
    async (data: {
      username: string;
      password: string;
      phoneNumber: string;
    }): Promise<LoginResult> => {
      const trimmedUser = data.username.trim();
      const trimmedPass = data.password;
      const cleanPhone = normalizePhone(data.phoneNumber);

      if (!trimmedUser || trimmedUser.length < 3) {
        return {
          success: false,
          reason: 'invalid_input',
          message: 'User name must be at least 3 characters.',
        };
      }
      if (!trimmedPass || trimmedPass.length < 6) {
        return {
          success: false,
          reason: 'invalid_input',
          message: 'Password must be at least 6 characters.',
        };
      }
      if (!cleanPhone || cleanPhone.length < 7) {
        return {
          success: false,
          reason: 'invalid_input',
          message: 'Enter a valid phone number (at least 7 digits).',
        };
      }

      let currentUsers = loadLocalUsers();

      // Check remote users first if cloud enabled
      const cloudConfig = getInitialCloudConfig();
      if (cloudConfig.enabled && cloudConfig.firebaseUrl) {
        try {
          const remoteUsers = await fetchUsersFromCloud(cloudConfig);
          if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
            const mergedMap = new Map<string, RegisteredUser>();
            mergedMap.set(ROOT_ADMIN.username.toLowerCase(), ROOT_ADMIN);
            currentUsers.forEach(u => mergedMap.set(u.username.toLowerCase(), u));
            (remoteUsers as RegisteredUser[]).forEach(u => {
              if (u && u.username) mergedMap.set(u.username.toLowerCase(), u);
            });
            currentUsers = Array.from(mergedMap.values());
            saveLocalUsers(currentUsers);
            setAllUsers(currentUsers);
          }
        } catch {
          // ignore
        }
      }

      const existing = currentUsers.find(
        u => u.username.toLowerCase() === trimmedUser.toLowerCase()
      );
      if (existing) {
        return {
          success: false,
          reason: 'user_exists',
          message: `Username "${trimmedUser}" is already registered. Please switch to Sign In.`,
        };
      }

      const now = new Date().toISOString();
      const newUser: RegisteredUser = {
        username: trimmedUser,
        passwordHash: btoa(trimmedPass),
        phoneNumber: data.phoneNumber.trim(),
        role: 'staff', // New public registrations get Staff role
        createdAt: now,
        lastLoginAt: now,
      };

      const updatedUsers = [...currentUsers, newUser];
      saveLocalUsers(updatedUsers);
      setAllUsers(updatedUsers);

      // Automatically enable and connect to cloud sync upon registration
      if (!cloudConfig.enabled) {
        cloudConfig.enabled = true;
        saveCloudSyncConfig(cloudConfig);
      }

      if (cloudConfig.firebaseUrl) {
        pushUsersToCloud(updatedUsers, cloudConfig);
      }

      const authUser: AuthUser = {
        username: newUser.username,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
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

      // Automatically enable and connect to cloud sync
      const cloudConfig = getInitialCloudConfig();
      if (!cloudConfig.enabled) {
        cloudConfig.enabled = true;
        saveCloudSyncConfig(cloudConfig);
      }

      if (cloudConfig.firebaseUrl) {
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
        signup,
        logout,
        allUsers,
        refreshUsers,
        addUser,
        updateUserRole,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
