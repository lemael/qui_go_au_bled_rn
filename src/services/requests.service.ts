import { apiClient, extractErrorMessage } from './api';
import { TransportRequest } from '../types';

const requestsService = {
  async getMyRequests(): Promise<TransportRequest[]> {
    try {
      const res = await apiClient.get('/requests');
      return res.data.requests as TransportRequest[];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async getRequestById(requestId: string): Promise<TransportRequest> {
    try {
      const res = await apiClient.get(`/requests/${requestId}`);
      return res.data.request as TransportRequest;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async createRequest(adId: string, message?: string): Promise<TransportRequest> {
    try {
      const res = await apiClient.post('/requests', { adId, message });
      return res.data.request as TransportRequest;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async acceptRequest(requestId: string): Promise<TransportRequest> {
    try {
      const res = await apiClient.patch(`/requests/${requestId}/accept`);
      return res.data.request as TransportRequest;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async rejectRequest(requestId: string): Promise<TransportRequest> {
    try {
      const res = await apiClient.patch(`/requests/${requestId}/reject`);
      return res.data.request as TransportRequest;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },
};

export default requestsService;
