'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          // Validate token against backend instead of trusting localStorage
          const data = await api.validateToken();
          if (data.user?.role === 'super_admin') {
            setUser(data.user);
          } else {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
          }
        } catch {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    try {
      const data = await api.login(credentials);

      const token = data.session?.access_token;
      const userData = data.user;

      if (!userData || !token) {
        throw new Error('Login failed: no user profile returned');
      }

      // Only allow super_admin users to access the super admin panel
      if (userData.role !== 'super_admin') {
        throw new Error('Access denied: Super admin privileges required');
      }

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      setUser(userData);
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    router.push('/login');
  };

  // Protect routes
  useEffect(() => {
    if (!isLoading && !user && !pathname.startsWith('/login')) {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
