// In development (Android emulator): http://10.0.2.2:3000/api
// In development (iOS simulator / web): http://localhost:3000/api
// In production: set your Railway URL here

export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api'
  : 'https://your-production-url.railway.app/api';

export const APP_NAME = 'Qui Go au Bled';
export const APP_VERSION = '1.0.0';

export const PAGE_SIZE = 20;
export const MAX_WEIGHT_KG = 50;
export const MIN_PRICE_PER_KG = 1.0;
export const MAX_PRICE_PER_KG = 100.0;
export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const MAX_IMAGE_SIZE_MB = 5;
