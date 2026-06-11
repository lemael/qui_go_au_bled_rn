import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RootStackParamList, User, TransportAd } from '../../types';
import authService from '../../services/auth.service';
import adsService from '../../services/ads.service';
import { StarRating } from '../../components/StarRating';
import { AdCard } from '../../components/AdCard';
import { LoadingOverlay } from '../../components/LoadingOverlay';

type Route = RouteProp<RootStackParamList, 'TransporterProfile'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function TransporterProfileScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const [user, setUser] = useState<User | null>(null);
  const [ads, setAds] = useState<TransportAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authService.getUserById(params.userId),
      adsService.getActiveAds(),
    ])
      .then(([u, allAds]) => {
        setUser(u);
        setAds(allAds.filter((a) => a.transporterId === params.userId));
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [params.userId]);

  if (loading || !user) return <LoadingOverlay />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user.fullName)}</Text>
        </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={user.averageRating} />
          <Text style={styles.ratingText}>
            {user.averageRating.toFixed(1)} ({user.totalReviews} avis)
          </Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>Transporteur</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={Colors.grey500} />
          <Text style={styles.infoText}>{user.address}</Text>
        </View>
      </View>

      {/* Reviews button */}
      <View
        style={styles.actionRow}
      >
        <Text
          style={styles.reviewsLink}
          onPress={() => navigation.navigate('Reviews', { transporterId: user.id })}
        >
          Voir tous les avis →
        </Text>
      </View>

      {/* Active ads */}
      {ads.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Annonces actives</Text>
          {ads.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              onPress={() => navigation.navigate('AdDetail', { adId: ad.id })}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: Colors.primary },
  name: { fontSize: 22, fontWeight: '700', color: Colors.grey900 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontSize: 14, color: Colors.grey600 },
  roleBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },
  roleBadgeText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 10,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, color: Colors.grey700, flex: 1 },
  actionRow: { alignItems: 'flex-end' },
  reviewsLink: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.grey900 },
});
