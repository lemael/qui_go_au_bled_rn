import axios from 'axios';
import { apiClient, saveToken, clearToken, getToken, extractErrorMessage } from './api';
import { User } from '../types';

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
}

export interface UpdateProfileParams {
  userId: string;
  fullName?: string;
  phone?: string;
  address?: string;
  photoUri?: string;
}

const authService = {
  async signIn(params: SignInParams): Promise<User> {
    try {
      const res = await apiClient.post('/auth/login', params);
      await saveToken(res.data.token as string);
      return res.data.user as User;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async signUp(params: SignUpParams): Promise<User> {
    try {
      const res = await apiClient.post('/auth/register', {
        email: params.email,
        password: params.password,
        fullName: params.fullName,
        phone: params.phone,
        address: params.address,
      });
      await saveToken(res.data.token as string);
      return res.data.user as User;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async signOut(): Promise<void> {
    await clearToken();
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { email });
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = await getToken();
    if (!token) return null;
    try {
      const res = await apiClient.get('/auth/me');
      return res.data.user as User;
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        await clearToken();
      }
      return null;
    }
  },

  async updateProfile(params: UpdateProfileParams): Promise<User> {
    try {
      const formData = new FormData();
      if (params.fullName) formData.append('fullName', params.fullName);
      if (params.phone) formData.append('phone', params.phone);
      if (params.address) formData.append('address', params.address);
      if (params.photoUri) {
        const filename = params.photoUri.split('/').pop() ?? 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('photo', { uri: params.photoUri, name: filename, type } as unknown as Blob);
      }

      const res = await apiClient.patch(`/users/${params.userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.user as User;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async getUserById(userId: string): Promise<User> {
    try {
      const res = await apiClient.get(`/users/${userId}`);
      return res.data.user as User;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },
};

export default authService;
