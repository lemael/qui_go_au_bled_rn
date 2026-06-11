import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { useAuthStore } from '../../store/auth.store';
import ordersService from '../../services/orders.service';
import { LoadingOverlay } from '../../components/LoadingOverlay';

interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  successRate: number;
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadStats() {
    try {
      const orders = await ordersService.getMyOrders();
      const total = orders.length;
      const completed = orders.filter((o) => o.status === 'COMPLETED').length;
      const cancelled = orders.filter((o) => o.status === 'CANCELLED').length;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      setStats({ totalOrders: total, completedOrders: completed, cancelledOrders: cancelled, successRate: rate });
    } catch {
      setStats({ totalOrders: 0, completedOrders: 0, cancelledOrders: 0, successRate: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadStats(); }, []);

  if (loading) return <LoadingOverlay />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadStats(); }} tintColor={Colors.primary} />
      }
    >
      <Text style={styles.pageTitle}>Vos statistiques</Text>

      {/* Stats grid */}
      <View style={styles.grid}>
        <StatCard title="Total transports" value={`${stats?.totalOrders ?? 0}`} icon="car-outline" color={Colors.primary} />
        <StatCard title="Réussis" value={`${stats?.completedOrders ?? 0}`} icon="checkmark-circle-outline" color={Colors.success} />
        <StatCard title="Annulations" value={`${stats?.cancelledOrders ?? 0}`} icon="close-circle-outline" color={Colors.error} />
        <StatCard
          title="Taux réussite"
          value={`${(stats?.successRate ?? 0).toFixed(0)}%`}
          icon="trending-up-outline"
          color={Colors.inProgress}
        />
      </View>

      {/* Rating card */}
      <View style={styles.ratingCard}>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Note moyenne</Text>
          <View style={styles.ratingValue}>
            <Ionicons name="star" size={20} color={Colors.starActive} />
            <Text style={styles.ratingNumber}>{(user?.averageRating ?? 0).toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Nombre d'avis</Text>
          <Text style={styles.reviewCount}>{user?.totalReviews ?? 0} avis</Text>
        </View>
      </View>

      {/* Performance bars */}
      {(stats?.totalOrders ?? 0) > 0 && (
        <View style={styles.performanceCard}>
          <Text style={styles.performanceTitle}>Performance</Text>
          <View style={{ height: 16 }} />
          <ProgressBar
            label="Taux de réussite"
            value={(stats?.successRate ?? 0) / 100}
            color={Colors.success}
          />
          <View style={{ height: 10 }} />
          <ProgressBar
            label="Taux d'annulation"
            value={stats && stats.totalOrders > 0 ? stats.cancelledOrders / stats.totalOrders : 0}
            color={Colors.error}
          />
        </View>
      )}

      {/* Reviews button */}
      {user && (
        <View style={styles.reviewsBtn}>
          <Text
            style={styles.reviewsBtnText}
            onPress={() => navigation.navigate('Reviews', { transporterId: user.id })}
          >
            Voir tous mes avis →
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: keyof typeof Ionicons.glyphMap; color: string }) {
  return (
    <View style={[statStyles.card]}>
      <View style={[statStyles.iconWrapper, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.title}>{title}</Text>
    </View>
  );
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  const percent = Math.min(100, Math.max(0, value * 100));
  return (
    <View>
      <View style={progStyles.header}>
        <Text style={progStyles.label}>{label}</Text>
        <Text style={[progStyles.percent, { color }]}>{percent.toFixed(0)}%</Text>
      </View>
      <View style={progStyles.track}>
        <View style={[progStyles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: Colors.grey900 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  ratingCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 10,
  },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingLabel: { fontSize: 14, color: Colors.grey700 },
  ratingValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingNumber: { fontSize: 18, fontWeight: '700', color: Colors.grey900 },
  reviewCount: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.grey100 },
  performanceCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
  performanceTitle: { fontSize: 16, fontWeight: '600', color: Colors.grey900 },
  reviewsBtn: { alignItems: 'flex-end' },
  reviewsBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});

const statStyles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 6,
    alignItems: 'flex-start',
  },
  iconWrapper: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 24, fontWeight: '700', color: Colors.grey900 },
  title: { fontSize: 12, color: Colors.grey500 },
});

const progStyles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, color: Colors.grey600 },
  percent: { fontSize: 13, fontWeight: '600' },
  track: { height: 8, backgroundColor: Colors.grey100, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
