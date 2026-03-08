import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import api from '../lib/axios';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  sendOtp: (email: string, purpose: 'register' | 'forgot_password') => Promise<void>;
  register: (email: string, password: string, name: string, otp: string, avatarUrlOrFile?: string | File) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<{ user: User & { _id?: string } }>('/auth/me');
      const u = data.user;
      setUser({ ...u, id: String((u as any).id ?? (u as any)._id ?? '') });
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }, []);

  const sendOtp = useCallback(async (email: string, purpose: 'register' | 'forgot_password') => {
    await api.post<{ message: string }>('/auth/send-otp', { email, purpose });
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, otp: string, avatarUrlOrFile?: string | File) => {
    if (avatarUrlOrFile instanceof File) {
      const form = new FormData();
      form.append('email', email);
      form.append('password', password);
      form.append('name', name);
      form.append('otp', otp);
      form.append('avatar', avatarUrlOrFile);
      const { data } = await api.post<{ token: string; user: User }>('/auth/register', form, {
        headers: { 'Content-Type': undefined },
      });
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } else {
      const { data } = await api.post<{ token: string; user: User }>('/auth/register', { email, password, name, otp, avatarUrl: avatarUrlOrFile });
      localStorage.setItem('token', data.token);
      setUser(data.user);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, sendOtp, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
