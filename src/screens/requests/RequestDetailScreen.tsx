import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { confirmAlert, showAlert } from '../../utils/alert';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, requestStatusColors, requestStatusLabels } from '../../constants/colors';
import { RootStackParamList, TransportRequest } from '../../types';
import { useAuthStore } from '../../store/auth.store';
import requestsService from '../../services/requests.service';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { formatDateTime } from '../../utils/date';

type Route = RouteProp<RootStackParamList, 'RequestDetail'>;

export function RequestDetailScreen() {
  const { params } = useRoute<Route>();
  const { user } = useAuthStore();
  const [request, setRequest] = useState<TransportRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestsService
      .getRequestById(params.requestId)
      .then(setRequest)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [params.requestId]);

  async function handleAccept() {
    if (!request) return;
    try {
      const updated = await requestsService.acceptRequest(request.id);
      setRequest(updated);
    } catch (e) {
      showAlert('Erreur', e instanceof Error ? e.message : 'Erreur');
    }
  }

  async function handleReject() {
    if (!request) return;
    confirmAlert('Refuser', 'Confirmer le refus ?', async () => {
      try {
        const updated = await requestsService.rejectRequest(request.id);
        setRequest(updated);
      } catch (e) {
        showAlert('Erreur', e instanceof Error ? e.message : 'Erreur');
      }
    }, 'Refuser', true);
  }

  if (loading || !request) return <LoadingOverlay />;

  const statusColor = requestStatusColors[request.status] ?? Colors.grey500;
  const statusLabel = requestStatusLabels[request.status] ?? request.status;
  const isTransporter = request.transporterId === user?.id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status */}
      <View style={styles.statusCard}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
        <Text style={styles.date}>{formatDateTime(request.createdAt)}</Text>
      </View>

      {/* Parties */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.partyItem}>
            <Text style={styles.partyLabel}>Client</Text>
            <Text style={styles.partyName}>{request.clientName}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={Colors.grey400} />
          <View style={styles.partyItem}>
            <Text style={styles.partyLabel}>Transporteur</Text>
            <Text style={styles.partyName}>{request.transporterName}</Text>
          </View>
        </View>
      </View>

      {/* Message */}
      {request.message ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Message</Text>
          <Text style={styles.messageText}>{request.message}</Text>
        </View>
      ) : null}

      {/* Actions for transporter on pending */}
      {isTransporter && request.status === 'PENDING' && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={handleAccept}>
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.btnLabel}>Accepter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={handleReject}>
            <Ionicons name="close-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.btnLabel}>Refuser</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 14, fontWeight: '600' },
  date: { fontSize: 12, color: Colors.grey400 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  partyItem: { flex: 1, gap: 4 },
  partyLabel: { fontSize: 12, color: Colors.grey400 },
  partyName: { fontSize: 15, fontWeight: '600', color: Colors.grey900 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.grey900 },
  messageText: { fontSize: 14, color: Colors.grey600, lineHeight: 22 },
  actions: { gap: 10 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    gap: 8,
  },
  acceptBtn: { backgroundColor: Colors.success },
  rejectBtn: { backgroundColor: Colors.error },
  btnLabel: { fontSize: 16, fontWeight: '600', color: Colors.white },
});
