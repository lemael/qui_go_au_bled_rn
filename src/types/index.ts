// ─── User ────────────────────────────────────────────────────────────────────
export type UserRole = 'transporter' | 'client' | 'both' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  photoUrl?: string;
  role: UserRole;
  averageRating: number;
  totalReviews: number;
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

export function isTransporter(user: User): boolean {
  return user.role === 'transporter' || user.role === 'both';
}

export function isClient(user: User): boolean {
  return user.role === 'client' || user.role === 'both';
}

export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Transport Ad ─────────────────────────────────────────────────────────────
export type AdStatus = 'active' | 'inactive' | 'expired' | 'pending' | 'rejected';

export interface TransportAd {
  id: string;
  transporterId: string;
  transporterName: string;
  transporterPhotoUrl?: string;
  transporterRating: number;
  transporterReviews: number;
  departureCity: string;
  arrivalCity: string;
  flightDate: string;
  flightTime: string;
  maxWeightKg: number;
  pricePerKg: number;
  description: string;
  status: AdStatus;
  totalPackagesCarried: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Transport Request ────────────────────────────────────────────────────────
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface TransportRequest {
  id: string;
  adId: string;
  transporterId: string;
  transporterName: string;
  clientId: string;
  clientName: string;
  clientPhotoUrl?: string;
  message?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Transport Order ──────────────────────────────────────────────────────────
export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CancellationInfo {
  authorId: string;
  authorName: string;
  reason: string;
  cancelledAt: string;
}

export interface TransportOrder {
  id: string;
  orderNumber: string;
  adId: string;
  requestId: string;
  transporterId: string;
  transporterName: string;
  transporterPhotoUrl?: string;
  clientId: string;
  clientName: string;
  clientPhotoUrl?: string;
  departureCity: string;
  arrivalCity: string;
  flightDate: string;
  pricePerKg: number;
  status: OrderStatus;
  reviewAuthorized: boolean;
  cancellationInfo?: CancellationInfo;
  createdAt: string;
  updatedAt: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  orderId: string;
  transporterId: string;
  clientId: string;
  clientName: string;
  clientPhotoUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  data?: Record<string, string>;
  createdAt: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalAds: number;
  totalOrders: number;
  totalRequests: number;
  totalReviews: number;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
  Main: undefined;
  AdDetail: { adId: string };
  CreateAd: undefined;
  MyAds: undefined;
  TransporterProfile: { userId: string };
  MyRequests: undefined;
  RequestDetail: { requestId: string };
  MyTransports: undefined;
  OrderDetail: { orderId: string };
  CancelOrder: { orderId: string };
  Dashboard: undefined;
  Reviews: { transporterId: string };
  CreateReview: { orderId: string };
  Notifications: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Admin: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  MyTransports: undefined;
  Notifications: undefined;
  Profile: undefined;
};
