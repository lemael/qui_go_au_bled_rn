import { apiClient, extractErrorMessage } from './api';
import { Review } from '../types';

const reviewsService = {
  async getReviewsByTransporter(transporterId: string): Promise<Review[]> {
    try {
      const res = await apiClient.get(`/reviews/transporter/${transporterId}`);
      return res.data.reviews as Review[];
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  async createReview(params: {
    orderId: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    try {
      const res = await apiClient.post('/reviews', params);
      return res.data.review as Review;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },
};

export default reviewsService;
