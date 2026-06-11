import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { confirmAlert, showAlert } from '../../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AdminStats, User, TransportAd } from '../../types';
import adminService from '../../services/admin.service';
import { useAuthStore } from '../../store/auth.store';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export function AdminScreen() {
  const { signOut } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [ads, setAds] = useState<TransportAd[]>([]);
  const [pendingAds, setPendingAds] = useState<TransportAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'stats' | 'users' | 'ads' | 'pending'>('stats');

  async function load() {
    try {
      const [s, u, a, p] = await Promise.all([
        adminService.getStats(),
        adminService.getAllUsers(),
        adminService.getAllAds(),
        adminService.getPendingAds(),
      ]);
      setStats(s);
      setUsers(u);
      setAds(a);
      setPendingAds(p);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDeleteUser(userId: string) {
    confirmAlert('Supprimer', 'Supprimer cet utilisateur ?', async () => {
      try {
        await adminService.deleteUser(userId);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } catch (e) {
        showAlert('Erreur', e instanceof Error ? e.message : 'Erreur');
      }
    }, 'Supprimer', true);
  }

  async function handleDeleteAd(adId: string) {
    confirmAlert('Supprimer', 'Supprimer cette annonce ?', async () => {
      try {
        await adminService.deleteAd(adId);
        setAds((prev) => prev.filter((a) => a.id !== adId));
        setPendingAds((prev) => prev.filter((a) => a.id !== adId));
      } catch (e) {
        showAlert('Erreur', e instanceof Error ? e.message : 'Erreur');
      }
    }, 'Supprimer', true);
  }

  async function handleApproveAd(adId: string) {
    try {
      await adminService.approveAd(adId);
      setPendingAds((prev) => prev.filter((a) => a.id !== adId));
      load();
    } catch (e) {
      showAlert('Erreur', e instanceof Error ? e.message : 'Erreur');
    }
  }

  async function handleRejectAd(adId: string) {
    confirmAlert('Refuser', 'Refuser cette annonce ?', async () => {
      try {
        await adminService.rejectAd(adId);
        setPendingAds((prev) => prev.filter((a) => a.id !== adId));
      } catch (e) {
        showAlert('Erreur', e instanceof Error ? e.message : 'Erreur');
      }
    }, 'Refuser', true);
  }

  if (loading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {(['stats', 'users', 'pending', 'ads'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'stats' ? 'Stats' : t === 'users' ? 'Users' : t === 'pending' ? `En attente${pendingAds.length ? ` (${pendingAds.length})` : ''}` : 'Annonces'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'stats' && stats && (
        <ScrollView
          contentContainerStyle={styles.statsContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        >
          <View style={styles.statsGrid}>
            <AdminStatCard label="Utilisateurs" value={stats.totalUsers} icon="people-outline" color={Colors.primary} />
            <AdminStatCard label="Annonces" value={stats.totalAds} icon="megaphone-outline" color={Colors.secondary} />
            <AdminStatCard label="Commandes" value={stats.totalOrders} icon="car-outline" color={Colors.success} />
            <AdminStatCard label="Demandes" value={stats.totalRequests} icon="mail-outline" color={Colors.warning} />
            <AdminStatCard label="Avis" value={stats.totalReviews} icon="star-outline" color={Colors.starActive} />
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={18} color={Colors.white} />
            <Text style={styles.logoutBtnText}>Déconnexion</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {tab === 'users' && (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <View style={styles.listCard}>
              <View style={styles.listCardContent}>
                <Text style={styles.listTitle}>{item.fullName}</Text>
                <Text style={styles.listSub}>{item.email}</Text>
                <Text style={styles.listSub2}>{item.role}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteUser(item.id)}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {tab === 'pending' && (
        <FlatList
          data={pendingAds}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucune annonce en attente</Text>}
          renderItem={({ item }) => (
            <View style={styles.listCard}>
              <View style={styles.listCardContent}>
                <Text style={styles.listTitle}>{item.departureCity} → {item.arrivalCity}</Text>
                <Text style={styles.listSub}>{item.transporterName}</Text>
                <Text style={styles.listSub2}>{item.flightDate} · {item.maxWeightKg} kg · {item.pricePerKg} €/kg</Text>
                {item.description ? <Text style={styles.listSub2} numberOfLines={2}>{item.description}</Text> : null}
              </View>
              <View style={styles.pendingActions}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApproveAd(item.id)}>
                  <Ionicons name="checkmark-outline" size={18} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectAd(item.id)}>
                  <Ionicons name="close-outline" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {tab === 'ads' && (
        <FlatList
          data={ads}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <View style={styles.listCard}>
              <View style={styles.listCardContent}>
                <Text style={styles.listTitle}>{item.departureCity} → {item.arrivalCity}</Text>
                <Text style={styles.listSub}>{item.transporterName}</Text>
                <Text style={styles.listSub2}>{item.status}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteAd(item.id)}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

function AdminStatCard({ label, value, icon, color }: { label: string; value: number; icon: keyof typeof Ionicons.glyphMap; color: string }) {
  return (
    <View style={[statStyles.card]}>
      <View style={[statStyles.icon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey200,
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, color: Colors.grey500, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  statsContent: { padding: 20, gap: 20, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  logoutBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
  listContent: { padding: 16, gap: 10, paddingBottom: 32 },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 12,
  },
  listCardContent: { flex: 1, gap: 3 },
  listTitle: { fontSize: 14, fontWeight: '600', color: Colors.grey900 },
  listSub: { fontSize: 12, color: Colors.grey500 },
  listSub2: { fontSize: 11, color: Colors.grey400 },
  emptyText: { textAlign: 'center', color: Colors.grey400, marginTop: 40, fontSize: 14 },
  pendingActions: { flexDirection: 'column', gap: 6 },
  approveBtn: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: Colors.error,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  },
  icon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  value: { fontSize: 24, fontWeight: '700', color: Colors.grey900 },
  label: { fontSize: 12, color: Colors.grey500 },
});
