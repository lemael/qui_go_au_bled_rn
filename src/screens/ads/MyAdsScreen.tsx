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
import { Colors, adStatusLabels } from '../../constants/colors';
import { RootStackParamList, TransportAd } from '../../types';
import adsService from '../../services/ads.service';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { formatDate } from '../../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MyAdsScreen() {
  const navigation = useNavigation<Nav>();
  const [ads, setAds] = useState<TransportAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAds = useCallback(async () => {
    try {
      const data = await adsService.getMyAds();
      setAds(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAds(); }, [loadAds]);

  async function handleDelete(adId: string) {
    Alert.alert('Supprimer', 'Êtes-vous sûr de vouloir supprimer cette annonce ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await adsService.deleteAd(adId);
            setAds((prev) => prev.filter((a) => a.id !== adId));
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
        data={ads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAds(); }} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            title="Aucune annonce"
            subtitle="Publiez votre première annonce pour commencer."
            icon="megaphone-outline"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.routeRow}>
                <Text style={styles.city}>{item.departureCity}</Text>
                <Ionicons name="airplane" size={16} color={Colors.primary} />
                <Text style={styles.city}>{item.arrivalCity}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: item.status === 'active' ? `${Colors.success}20` : `${Colors.grey400}20` },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: item.status === 'active' ? Colors.success : Colors.grey500 },
                  ]}
                >
                  {adStatusLabels[item.status] ?? item.status}
                </Text>
              </View>
            </View>
            <View style={styles.cardInfo}>
              <Ionicons name="calendar-outline" size={13} color={Colors.grey500} />
              <Text style={styles.infoText}>{formatDate(item.flightDate)}</Text>
              <Text style={styles.separator}>·</Text>
              <Text style={styles.infoText}>{item.maxWeightKg} kg</Text>
              <Text style={styles.separator}>·</Text>
              <Text style={styles.infoText}>{item.pricePerKg} €/kg</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('AdDetail', { adId: item.id })}
              >
                <Ionicons name="eye-outline" size={16} color={Colors.primary} />
                <Text style={[styles.actionText, { color: Colors.primary }]}>Voir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={16} color={Colors.error} />
                <Text style={[styles.actionText, { color: Colors.error }]}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateAd')}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  list: { padding: 16, paddingBottom: 80, gap: 12 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  city: { fontSize: 15, fontWeight: '700', color: Colors.grey900 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  infoText: { fontSize: 12, color: Colors.grey500 },
  separator: { color: Colors.grey300, fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: Colors.grey100, paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 13, fontWeight: '500' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
