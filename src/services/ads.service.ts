import { apiClient, extractErrorMessage } from './api';
import { TransportAd } from '../types';

export interface CreateAdParams {
  departureCity: string;
  arrivalCity: string;
  flightDate: string;
  flightTime: string;
  maxWeightKg: number;
  pricePerKg: number;
  description: string;
}

export interface SearchAdsParams {
  departureCity?: string;
  arrivalCity?: string;
  flightDate?: string;
}

const adsService = {
  async getActiveAds(): Promise<TransportAd[]> {
    try {
      const res = await apiClient.get('/ads');
      return res.data.ads as TransportAd[];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async searchAds(params: SearchAdsParams): Promise<TransportAd[]> {
    try {
      const res = await apiClient.get('/ads/search', { params });
      return res.data.ads as TransportAd[];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async getAdById(adId: string): Promise<TransportAd> {
    try {
      const res = await apiClient.get(`/ads/${adId}`);
      return res.data.ad as TransportAd;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async getMyAds(): Promise<TransportAd[]> {
    try {
      const res = await apiClient.get('/ads/my');
      return res.data.ads as TransportAd[];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async createAd(params: CreateAdParams): Promise<TransportAd> {
    try {
      const res = await apiClient.post('/ads', params);
      return res.data.ad as TransportAd;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async deleteAd(adId: string): Promise<void> {
    try {
      await apiClient.delete(`/ads/${adId}`);
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async toggleAdStatus(adId: string, status: 'active' | 'inactive'): Promise<TransportAd> {
    try {
      const res = await apiClient.patch(`/ads/${adId}/status`, { status });
      return res.data.ad as TransportAd;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },
};

export default adsService;
