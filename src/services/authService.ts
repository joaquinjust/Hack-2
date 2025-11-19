import api from './api';
import { LoginResponse, User } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';

export const authService = {
  async register(email: string, password: string, name: string) {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;
    
    if (data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    }
    
    return data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

