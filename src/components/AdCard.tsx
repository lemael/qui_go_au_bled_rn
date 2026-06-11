import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransportAd } from '../types';
import { Colors, adStatusLabels } from '../constants/colors';
import { StarRating } from './StarRating';
import { formatDate } from '../utils/date';

interface AdCardProps {
  ad: TransportAd;
  onPress: () => void;
}

export function AdCard({ ad, onPress }: AdCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Transporter row */}
      <View style={styles.transporterRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(ad.transporterName)}
          </Text>
        </View>
        <View style={styles.transporterInfo}>
          <Text style={styles.transporterName}>{ad.transporterName}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={ad.transporterRating} size={12} />
            <Text style={styles.reviewCount}>
              {' '}({ad.transporterReviews})
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${Colors.success}20` }]}>
          <Text style={[styles.statusText, { color: Colors.success }]}>
            {adStatusLabels[ad.status] ?? ad.status}
          </Text>
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeRow}>
        <View style={styles.routePoint}>
          <Ionicons name="radio-button-on" size={12} color={Colors.primary} />
          <Text style={styles.cityText}>{ad.departureCity}</Text>
        </View>
        <View style={styles.routeLine} />
        <Ionicons name="airplane" size={18} color={Colors.primary} />
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <Ionicons name="location" size={12} color={Colors.secondary} />
          <Text style={styles.cityText}>{ad.arrivalCity}</Text>
        </View>
      </View>

      {/* Date & price */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.grey500} />
          <Text style={styles.footerText}>{formatDate(ad.flightDate)}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={14} color={Colors.grey500} />
          <Text style={styles.footerText}>{ad.flightTime}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="scale-outline" size={14} color={Colors.grey500} />
          <Text style={styles.footerText}>{ad.maxWeightKg} kg</Text>
        </View>
        <View style={[styles.priceBadge]}>
          <Text style={styles.priceText}>{ad.pricePerKg} €/kg</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 12,
  },
  transporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  transporterInfo: {
    flex: 1,
  },
  transporterName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.grey900,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewCount: {
    fontSize: 11,
    color: Colors.grey500,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grey50,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.grey300,
  },
  cityText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.grey800,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: Colors.grey500,
  },
  priceBadge: {
    marginLeft: 'auto',
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
