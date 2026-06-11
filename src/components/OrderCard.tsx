import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransportOrder } from '../types';
import { Colors, statusColors, statusLabels } from '../constants/colors';
import { formatDate } from '../utils/date';

interface OrderCardProps {
  order: TransportOrder;
  currentUserId: string;
  onPress: () => void;
}

export function OrderCard({ order, currentUserId, onPress }: OrderCardProps) {
  const isTransporter = order.transporterId === currentUserId;
  const otherName = isTransporter ? order.clientName : order.transporterName;
  const statusColor = statusColors[order.status] ?? Colors.grey500;
  const statusLabel = statusLabels[order.status] ?? order.status;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routePoint}>
          <Ionicons name="radio-button-on" size={12} color={Colors.primary} />
          <Text style={styles.cityText}>{order.departureCity}</Text>
        </View>
        <Ionicons name="airplane" size={16} color={Colors.primary} style={{ marginHorizontal: 4 }} />
        <View style={styles.routePoint}>
          <Ionicons name="location" size={12} color={Colors.secondary} />
          <Text style={styles.cityText}>{order.arrivalCity}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={13} color={Colors.grey500} />
          <Text style={styles.footerText}>{formatDate(order.flightDate)}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="person-outline" size={13} color={Colors.grey500} />
          <Text style={styles.footerText}>{otherName}</Text>
        </View>
        <Text style={styles.price}>{order.pricePerKg} €/kg</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.grey900,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  cityText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grey800,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  price: {
    marginLeft: 'auto',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
