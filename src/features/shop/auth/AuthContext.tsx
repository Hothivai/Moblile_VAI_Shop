import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import type { User } from '../database/database';

export type AuthContextValue = {
  user: User | null;
  isReady: boolean;
  setUser: (user: User | null) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('loggedInUser');
        if (!storedUser) return;

        const parsedUser: unknown = JSON.parse(storedUser);
        if (!isStoredUser(parsedUser)) {
          throw new Error('Dữ liệu người dùng đã lưu không hợp lệ.');
        }
        if (isActive) setUser(parsedUser);
      } catch (error) {
        console.error('Error loading logged-in user:', error);
        if (isActive) {
          Alert.alert('Lỗi', 'Không thể đọc thông tin người dùng đã đăng nhập.');
        }
      } finally {
        if (isActive) setIsReady(true);
      }
    };

    void loadUser();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isReady, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthContext.Provider.');
  }
  return context;
}

export function isStoredUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const user = value as Partial<User>;
  return (
    typeof user.id === 'number' &&
    typeof user.username === 'string' &&
    typeof user.password === 'string' &&
    typeof user.role === 'string'
  );
}
