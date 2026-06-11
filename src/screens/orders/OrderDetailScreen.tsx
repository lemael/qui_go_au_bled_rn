import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, statusColors, statusLabels } from '../../constants/colors';
import { RootStackParamList, TransportOrder } from '../../types';
import { useAuthStore } from '../../store/auth.store';
import ordersService from '../../services/orders.service';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { formatDate, formatDateTime } from '../../utils/date';

type Route = RouteProp<RootStackParamList, 'OrderDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OrderDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<TransportOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersService
      .getOrderById(params.orderId)
      .then(setOrder)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [params.orderId]);

  async function handleStatusUpdate(status: string) {
    if (!order) return;
    try {
      const updated = await ordersService.updateOrderStatus(order.id, status);
      setOrder(updated);
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur');
    }
  }

  if (loading || !order) return <LoadingOverlay />;

  const isTransporter = order.transporterId === user?.id;
  const statusColor = statusColors[order.status] ?? Colors.grey500;
  const statusLabel = statusLabels[order.status] ?? order.status;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Order number & status */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{formatDateTime(order.createdAt)}</Text>
      </View>

      {/* Route */}
      <View style={styles.card}>
        <View style={styles.routeRow}>
          <View style={styles.routePoint}>
            <View style={styles.routeDot} />
            <Text style={styles.cityText}>{order.departureCity}</Text>
          </View>
          <Ionicons name="airplane" size={20} color={Colors.primary} style={{ flex: 1, textAlign: 'center' }} />
          <View style={[styles.routePoint, { justifyContent: 'flex-end' }]}>
            <Ionicons name="location" size={14} color={Colors.secondary} />
            <Text style={styles.cityText}>{order.arrivalCity}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.grey500} />
          <Text style={styles.infoText}>{formatDate(order.flightDate)}</Text>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.priceText}>{order.pricePerKg} €/kg</Text>
        </View>
      </View>

      {/* Parties */}
      <View style={styles.card}>
        <View style={styles.partyRow}>
          <View style={styles.partyItem}>
            <Text style={styles.partyLabel}>Client</Text>
            <Text style={styles.partyName}>{order.clientName}</Text>
          </View>
          <View style={styles.partyItem}>
            <Text style={styles.partyLabel}>Transporteur</Text>
            <Text style={styles.partyName}>{order.transporterName}</Text>
          </View>
        </View>
      </View>

      {/* Cancellation info */}
      {order.cancellationInfo && (
        <View style={[styles.card, styles.cancelCard]}>
          <Text style={styles.cancelTitle}>Annulation</Text>
          <Text style={styles.cancelText}>Motif : {order.cancellationInfo.reason}</Text>
          <Text style={styles.cancelBy}>Par : {order.cancellationInfo.authorName}</Text>
        </View>
      )}

      {/* Actions */}
      {isTransporter && order.status === 'ACCEPTED' && (
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => handleStatusUpdate('IN_PROGRESS')}
        >
          <Ionicons name="play-circle-outline" size={20} color={Colors.white} />
          <Text style={styles.startBtnLabel}>Démarrer le transport</Text>
        </TouchableOpacity>
      )}
      {isTransporter && order.status === 'IN_PROGRESS' && (
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: Colors.success }]}
          onPress={() => handleStatusUpdate('COMPLETED')}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
          <Text style={styles.startBtnLabel}>Marquer comme terminé</Text>
        </TouchableOpacity>
      )}

      {(order.status === 'ACCEPTED' || order.status === 'IN_PROGRESS') && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.navigate('CancelOrder', { orderId: order.id })}
        >
          <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
          <Text style={styles.cancelBtnLabel}>Annuler</Text>
        </TouchableOpacity>
      )}

      {order.reviewAuthorized && order.status === 'COMPLETED' && (
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: Colors.starActive }]}
          onPress={() => navigation.navigate('CreateReview', { orderId: order.id })}
        >
          <Ionicons name="star-outline" size={20} color={Colors.white} />
          <Text style={styles.startBtnLabel}>Laisser un avis</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 8,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { fontSize: 16, fontWeight: '700', color: Colors.grey900 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  dateText: { fontSize: 12, color: Colors.grey400 },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  routePoint: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  cityText: { fontSize: 16, fontWeight: '700', color: Colors.grey900 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: Colors.grey500 },
  sep: { color: Colors.grey300 },
  priceText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  partyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  partyItem: { gap: 4 },
  partyLabel: { fontSize: 11, color: Colors.grey400 },
  partyName: { fontSize: 15, fontWeight: '600', color: Colors.grey900 },
  cancelCard: { borderColor: `${Colors.error}40`, backgroundColor: `${Colors.error}08` },
  cancelTitle: { fontSize: 14, fontWeight: '700', color: Colors.error },
  cancelText: { fontSize: 13, color: Colors.grey700 },
  cancelBy: { fontSize: 12, color: Colors.grey500 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  startBtnLabel: { fontSize: 15, fontWeight: '600', color: Colors.white },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.error,
    gap: 8,
  },
  cancelBtnLabel: { fontSize: 15, fontWeight: '600', color: Colors.error },
});
