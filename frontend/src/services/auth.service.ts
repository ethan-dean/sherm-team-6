import { supabase } from '../lib/supabase';
import type { User, LoginCredentials, RegisterData } from '../types/interview';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      role: 'recruiter',
      createdAt: data.user.created_at,
    };

    localStorage.setItem('authToken', data.session.access_token);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, token: data.session.access_token };
  },

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!authData.user || !authData.session) {
      throw new Error('Registration failed');
    }

    const user: User = {
      id: authData.user.id,
      email: authData.user.email!,
      role: 'recruiter',
      createdAt: authData.user.created_at,
    };

    localStorage.setItem('authToken', authData.session.access_token);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, token: authData.session.access_token };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },
};
