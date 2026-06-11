import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { RootStackParamList, TransportAd } from '../../types';
import { useAuthStore } from '../../store/auth.store';
import { isTransporter } from '../../types';
import adsService from '../../services/ads.service';
import { AdCard } from '../../components/AdCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const [ads, setAds] = useState<TransportAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAds = useCallback(async () => {
    try {
      setError(null);
      const data = await adsService.getActiveAds();
      setAds(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAds(); }, [loadAds]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAds();
  };

  const firstName = user?.fullName.split(' ')[0] ?? '';
  const canCreateAd = user ? isTransporter(user) : false;

  if (loading) return <LoadingOverlay message="Chargement des annonces..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={ads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <>
            {/* App Bar */}
            <View style={styles.appBar}>
              <View>
                <Text style={styles.greeting}>Bonjour, {firstName} 👋</Text>
                <Text style={styles.greetingSub}>Trouvez un transporteur de confiance</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={styles.notifBtn}
              >
                <Ionicons name="notifications-outline" size={24} color={Colors.grey700} />
              </TouchableOpacity>
            </View>

            {/* Search Banner */}
            <Pressable onPress={() => (navigation as any).navigate('Search')} style={styles.bannerWrapper}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
              >
                <Text style={styles.bannerTitle}>Où voulez-vous envoyer ?</Text>
                <View style={styles.bannerSearchBar}>
                  <Ionicons name="search" size={18} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.bannerSearchText}>
                    Rechercher une destination...
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Transporter Quick Actions */}
            {canCreateAd && (
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => navigation.navigate('CreateAd')}
                >
                  <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                  <Text style={styles.quickActionLabel}>Nouvelle annonce</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => navigation.navigate('MyAds')}
                >
                  <Ionicons name="list-outline" size={24} color={Colors.primary} />
                  <Text style={styles.quickActionLabel}>Mes annonces</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => navigation.navigate('MyRequests')}
                >
                  <Ionicons name="mail-outline" size={24} color={Colors.primary} />
                  <Text style={styles.quickActionLabel}>Demandes</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.sectionTitle}>Annonces récentes</Text>
          </>
        }
        ListEmptyComponent={
          error ? (
            <EmptyState title="Erreur" subtitle={error} icon="alert-circle-outline" />
          ) : (
            <EmptyState
              title="Aucune annonce disponible"
              subtitle="Revenez bientôt pour trouver un transporteur."
              icon="airplane-outline"
            />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <AdCard
              ad={item}
              onPress={() => navigation.navigate('AdDetail', { adId: item.id })}
            />
          </View>
        )}
      />

      {canCreateAd && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateAd')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color={Colors.white} />
          <Text style={styles.fabLabel}>Publier</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  list: { paddingBottom: 100 },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: Colors.white,
  },
  greeting: { fontSize: 18, fontWeight: '700', color: Colors.grey900 },
  greetingSub: { fontSize: 12, color: Colors.grey500, marginTop: 2 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerWrapper: { paddingHorizontal: 16, paddingTop: 16 },
  banner: {
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  bannerSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  bannerSearchText: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.grey200,
    paddingVertical: 14,
    gap: 6,
  },
  quickActionLabel: { fontSize: 12, fontWeight: '500', color: Colors.grey700 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.grey900,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cardWrapper: { paddingHorizontal: 16, paddingBottom: 12 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: 6,
  },
  fabLabel: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
