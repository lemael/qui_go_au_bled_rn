import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AppNotification } from '../../types';
import notificationsService from '../../services/notifications.service';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { formatDateTime } from '../../utils/date';

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationsService.getMyNotifications();
      setNotifications(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  async function handleMarkAllRead() {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent
    }
  }

  async function handleMarkRead(notifId: string) {
    try {
      await notificationsService.markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      );
    } catch {
      // silent
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.topBar}>
          <Text style={styles.unreadText}>{unreadCount} non lue(s)</Text>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllBtn}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadNotifications(); }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Aucune notification"
            subtitle="Vous n'avez pas de notifications pour l'instant."
            icon="notifications-outline"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.isRead && styles.cardUnread]}
            onPress={() => !item.isRead && handleMarkRead(item.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: item.isRead ? Colors.grey300 : Colors.primary }]} />
            <View style={styles.cardContent}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifBody}>{item.body}</Text>
              <Text style={styles.notifDate}>{formatDateTime(item.createdAt)}</Text>
            </View>
            {!item.isRead && (
              <View style={styles.unreadBadge} />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey100,
  },
  unreadText: { fontSize: 13, color: Colors.grey600 },
  markAllBtn: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  list: { padding: 16, gap: 10, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 12,
    alignItems: 'flex-start',
  },
  cardUnread: {
    borderColor: `${Colors.primary}40`,
    backgroundColor: `${Colors.primary}05`,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  cardContent: { flex: 1, gap: 4 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: Colors.grey900 },
  notifBody: { fontSize: 13, color: Colors.grey600, lineHeight: 20 },
  notifDate: { fontSize: 11, color: Colors.grey400 },
  unreadBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 4 },
});
