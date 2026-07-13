import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  updateUser: (updatedUser) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },
  checkAuth: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      if (userStr && token) {
        try {
          const user = JSON.parse(userStr);
          set({ user, isAuthenticated: true, isLoading: false });
          return;
        } catch (e) {
          // ignore
        }
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
