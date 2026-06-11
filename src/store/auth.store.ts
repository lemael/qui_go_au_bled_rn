import { create } from 'zustand';
import { User } from '../types';
import authService, {
  SignInParams,
  SignUpParams,
  UpdateProfileParams,
} from '../services/auth.service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthActions {
  initialize: () => Promise<void>;
  signIn: (params: SignInParams) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (params: UpdateProfileParams) => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isLoading: false, isInitialized: true });
    } catch {
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  signIn: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.signIn(params);
      set({ user, isLoading: false, error: null });
    } catch (e) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : 'Erreur de connexion',
      });
      throw e;
    }
  },

  signUp: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.signUp(params);
      set({ user, isLoading: false, error: null });
    } catch (e) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : "Erreur d'inscription",
      });
      throw e;
    }
  },

  signOut: async () => {
    await authService.signOut();
    set({ user: null, error: null });
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resetPassword(email);
      set({ isLoading: false });
    } catch (e) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : 'Erreur de réinitialisation',
      });
      throw e;
    }
  },

  updateProfile: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.updateProfile(params);
      set({ user, isLoading: false, error: null });
    } catch (e) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : 'Erreur de mise à jour',
      });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));
