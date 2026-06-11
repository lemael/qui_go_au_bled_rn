export const Colors = {
  // Primary
  primary: '#1E6FD9',
  primaryLight: '#4A8FFF',
  primaryDark: '#0D4FA8',

  // Secondary
  secondary: '#FF6B35',
  secondaryLight: '#FF8F63',
  secondaryDark: '#CC4B18',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Order status
  pending: '#F59E0B',
  accepted: '#3B82F6',
  rejected: '#EF4444',
  inProgress: '#8B5CF6',
  completed: '#22C55E',
  cancelled: '#6B7280',

  // Neutral
  white: '#FFFFFF',
  black: '#0F172A',
  grey50: '#F8FAFC',
  grey100: '#F1F5F9',
  grey200: '#E2E8F0',
  grey300: '#CBD5E1',
  grey400: '#94A3B8',
  grey500: '#64748B',
  grey600: '#475569',
  grey700: '#334155',
  grey800: '#1E293B',
  grey900: '#0F172A',

  // Star
  starActive: '#FBBF24',
  starInactive: '#E2E8F0',

  // Background
  scaffoldBackground: '#F8FAFC',
  cardBackground: '#FFFFFF',
} as const;

export const statusColors: Record<string, string> = {
  PENDING: Colors.pending,
  ACCEPTED: Colors.accepted,
  REJECTED: Colors.rejected,
  IN_PROGRESS: Colors.inProgress,
  COMPLETED: Colors.completed,
  CANCELLED: Colors.cancelled,
};

export const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  ACCEPTED: 'Accepté',
  REJECTED: 'Refusé',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

export const adStatusLabels: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  expired: 'Expiré',
  pending: 'En attente',
  rejected: 'Refusé',
};

export const requestStatusLabels: Record<string, string> = {
  PENDING: 'En attente',
  ACCEPTED: 'Accepté',
  REJECTED: 'Refusé',
};

export const requestStatusColors: Record<string, string> = {
  PENDING: Colors.pending,
  ACCEPTED: Colors.accepted,
  REJECTED: Colors.rejected,
};
