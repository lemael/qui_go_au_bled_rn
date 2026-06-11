import { apiClient, extractErrorMessage } from './api';
import { TransportOrder } from '../types';

const ordersService = {
  async getMyOrders(): Promise<TransportOrder[]> {
    try {
      const res = await apiClient.get('/orders');
      return res.data.orders as TransportOrder[];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async getOrderById(orderId: string): Promise<TransportOrder> {
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      return res.data.order as TransportOrder;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<TransportOrder> {
    try {
      const res = await apiClient.patch(`/orders/${orderId}/status`, { status });
      return res.data.order as TransportOrder;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async cancelOrder(orderId: string, reason: string): Promise<TransportOrder> {
    try {
      const res = await apiClient.patch(`/orders/${orderId}/cancel`, { reason });
      return res.data.order as TransportOrder;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },
};

export default ordersService;
