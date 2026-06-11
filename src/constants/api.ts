// In development (web): http://localhost:3000/api
// In production: set EXPO_PUBLIC_API_URL in Railway environment variables

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? 'http://localhost:3000/api' : 'https://your-backend.railway.app/api');

export const APP_NAME = 'Qui Go au Bled';
export const APP_VERSION = '1.0.0';

export const PAGE_SIZE = 20;
export const MAX_WEIGHT_KG = 50;
export const MIN_PRICE_PER_KG = 1.0;
export const MAX_PRICE_PER_KG = 100.0;
export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const MAX_IMAGE_SIZE_MB = 5;
