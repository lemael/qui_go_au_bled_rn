import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, requestStatusColors, requestStatusLabels } from '../../constants/colors';
import { RootStackParamList, TransportRequest } from '../../types';
import { useAuthStore } from '../../store/auth.store';
import requestsService from '../../services/requests.service';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { formatDate } from '../../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MyRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      const data = await requestsService.getMyRequests();
      setRequests(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  async function handleAccept(requestId: string) {
    try {
      await requestsService.acceptRequest(requestId);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'ACCEPTED' } : r))
      );
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur');
    }
  }

  async function handleReject(requestId: string) {
    Alert.alert('Refuser', 'Voulez-vous refuser cette demande ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Refuser',
        style: 'destructive',
        onPress: async () => {
          try {
            await requestsService.rejectRequest(requestId);
            setRequests((prev) =>
              prev.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED' } : r))
            );
          } catch (e) {
            Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur');
          }
        },
      },
    ]);
  }

  if (loading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadRequests(); }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState title="Aucune demande" subtitle="Vous n'avez pas encore de demandes." icon="mail-outline" />
        }
        renderItem={({ item }) => {
          const statusColor = requestStatusColors[item.status] ?? Colors.grey500;
          const statusLabel = requestStatusLabels[item.status] ?? item.status;
          const isTransporter = item.transporterId === user?.id;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.nameRow}>
                  <Ionicons name="person-outline" size={16} color={Colors.grey500} />
                  <Text style={styles.name}>
                    {isTransporter ? item.clientName : item.transporterName}
                  </Text>
                  <Text style={styles.roleLabel}>
                    {isTransporter ? '(Client)' : '(Transporteur)'}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
                  <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
                </View>
              </View>
              {item.message ? (
                <Text style={styles.message} numberOfLines={2}>
                  {item.message}
                </Text>
              ) : null}
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>

              {/* Transporter actions on pending requests */}
              {isTransporter && item.status === 'PENDING' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => handleAccept(item.id)}
                  >
                    <Text style={styles.acceptBtnText}>Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleReject(item.id)}
                  >
                    <Text style={styles.rejectBtnText}>Refuser</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.grey900 },
  roleLabel: { fontSize: 12, color: Colors.grey400 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  message: { fontSize: 13, color: Colors.grey600, lineHeight: 20 },
  date: { fontSize: 12, color: Colors.grey400 },
  actions: { flexDirection: 'row', gap: 10, paddingTop: 8 },
  actionBtn: { flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  acceptBtn: { backgroundColor: `${Colors.success}20` },
  acceptBtnText: { fontSize: 13, fontWeight: '600', color: Colors.success },
  rejectBtn: { backgroundColor: `${Colors.error}15` },
  rejectBtnText: { fontSize: 13, fontWeight: '600', color: Colors.error },
});
