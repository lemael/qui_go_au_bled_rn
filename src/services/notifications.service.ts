import { apiClient, extractErrorMessage } from './api';
import { AppNotification } from '../types';

const notificationsService = {
  async getMyNotifications(): Promise<AppNotification[]> {
    try {
      const res = await apiClient.get('/notifications');
      return res.data.notifications as AppNotification[];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },
};

export default notificationsService;
