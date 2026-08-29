import { create } from 'zustand';
import api from '../services/api';
import { disconnectSocket } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false, // Set to false initially so forms render ready by default
  error: null,

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('campusiq_token');
      const storedUser = localStorage.getItem('campusiq_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          set({
            token: storedToken,
            user: parsedUser,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } catch (e) {
          localStorage.removeItem('campusiq_token');
          localStorage.removeItem('campusiq_user');
        }
      }
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  login: async (emailOrData, passwordArg) => {
    set({ isLoading: true, error: null });

    // Handle both object ({ email, password }) and parameter (email, password) signatures
    let email, password;
    if (typeof emailOrData === 'object' && emailOrData !== null) {
      email = emailOrData.email;
      password = emailOrData.password;
    } else {
      email = emailOrData;
      password = passwordArg;
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('campusiq_token', token);
        localStorage.setItem('campusiq_user', JSON.stringify(user));
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Login failed. Please check your credentials.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('campusiq_token', token);
        localStorage.setItem('campusiq_user', JSON.stringify(user));
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('campusiq_token');
      localStorage.removeItem('campusiq_user');
    }
    disconnectSocket();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null, isLoading: false }),
}));