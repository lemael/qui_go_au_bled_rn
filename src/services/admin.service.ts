import { apiClient, extractErrorMessage } from './api';
import { AdminStats, User, TransportAd, TransportOrder } from '../types';

const adminService = {
  async getStats(): Promise<AdminStats> {
    try {
      const res = await apiClient.get('/admin/stats');
      return res.data.stats as AdminStats;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const res = await apiClient.get('/admin/users');
      return res.data.users as User[];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async getAllAds(): Promise<TransportAd[]> {
    try {
      const res = await apiClient.get('/admin/ads');
      return res.data.ads as TransportAd[];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async getPendingAds(): Promise<TransportAd[]> {
    try {
      const res = await apiClient.get('/admin/ads/pending');
      return res.data.ads as TransportAd[];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async approveAd(adId: string): Promise<TransportAd> {
    try {
      const res = await apiClient.patch(`/admin/ads/${adId}/approve`);
      return res.data.ad as TransportAd;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async rejectAd(adId: string): Promise<TransportAd> {
    try {
      const res = await apiClient.patch(`/admin/ads/${adId}/reject`);
      return res.data.ad as TransportAd;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async getAllOrders(): Promise<TransportOrder[]> {
    try {
      const res = await apiClient.get('/admin/orders');
      return res.data.orders as TransportOrder[];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async deleteAd(adId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/ads/${adId}`);
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },
};

export default adminService;
