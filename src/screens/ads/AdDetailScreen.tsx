import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { showAlert } from '../../utils/alert';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RootStackParamList, TransportAd } from '../../types';
import { useAuthStore } from '../../store/auth.store';
import adsService from '../../services/ads.service';
import requestsService from '../../services/requests.service';
import { StarRating } from '../../components/StarRating';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { formatDate } from '../../utils/date';

type Route = RouteProp<RootStackParamList, 'AdDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function AdDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const [ad, setAd] = useState<TransportAd | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    adsService
      .getAdById(params.adId)
      .then(setAd)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [params.adId]);

  async function handleShare() {
    if (!ad) return;
    const text =
      `Voyage de ${ad.departureCity} vers ${ad.arrivalCity} le ${formatDate(ad.flightDate)} — ` +
      `Je peux transporter jusqu'à ${ad.maxWeightKg}kg à ${ad.pricePerKg}€/kg. ` +
      `Contactez-moi via Qui Go au Bled !`;
    Share.share({ message: text });
  }

  async function handleSendRequest() {
    if (!ad) return;
    setSending(true);
    try {
      await requestsService.createRequest(ad.id);
      showAlert('Succès', 'Votre demande a été envoyée au transporteur.', () =>
        navigation.navigate('MyRequests')
      );
    } catch (e) {
      showAlert('Erreur', e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSending(false);
    }
  }

  if (loading || !ad) return <LoadingOverlay />;

  const isOwnAd = ad.transporterId === user?.id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Share button in header */}
      <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
        <Ionicons name="share-outline" size={22} color={Colors.grey700} />
        <Text style={styles.shareBtnLabel}>Partager</Text>
      </TouchableOpacity>

      {/* Transporter card */}
      <View style={styles.card}>
        <View style={styles.transporterRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(ad.transporterName)}</Text>
          </View>
          <View style={styles.transporterInfo}>
            <Text style={styles.transporterName}>{ad.transporterName}</Text>
            <View style={styles.ratingRow}>
              <StarRating rating={ad.transporterRating} />
              <Text style={styles.reviewCount}> ({ad.transporterReviews} avis)</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('TransporterProfile', { userId: ad.transporterId })
            }
            style={styles.profileBtn}
          >
            <Text style={styles.profileBtnText}>Voir profil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Route card */}
      <View style={styles.card}>
        <View style={styles.routeRow}>
          <View style={styles.routePoint}>
            <View style={styles.routeDotPrimary} />
            <Text style={styles.routeCity}>{ad.departureCity}</Text>
          </View>
          <Ionicons name="airplane" size={22} color={Colors.primary} style={{ flex: 1, textAlign: 'center' }} />
          <View style={[styles.routePoint, { justifyContent: 'flex-end' }]}>
            <Ionicons name="location" size={14} color={Colors.secondary} />
            <Text style={styles.routeCity}>{ad.arrivalCity}</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={15} color={Colors.grey500} />
          <Text style={styles.dateText}>{formatDate(ad.flightDate)}</Text>
          <Ionicons name="time-outline" size={15} color={Colors.grey500} />
          <Text style={styles.dateText}>{ad.flightTime}</Text>
        </View>
      </View>

      {/* Pricing */}
      <View style={[styles.card, styles.pricingRow]}>
        <View style={styles.pricingItem}>
          <Ionicons name="scale-outline" size={20} color={Colors.primary} />
          <Text style={styles.pricingLabel}>Poids max</Text>
          <Text style={styles.pricingValue}>{ad.maxWeightKg} kg</Text>
        </View>
        <View style={styles.pricingDivider} />
        <View style={styles.pricingItem}>
          <Ionicons name="cash-outline" size={20} color={Colors.primary} />
          <Text style={styles.pricingLabel}>Prix / kg</Text>
          <Text style={styles.pricingValue}>{ad.pricePerKg} €</Text>
        </View>
      </View>

      {/* Description */}
      {ad.description ? (
        <View style={styles.card}>
          <Text style={styles.descTitle}>Description</Text>
          <Text style={styles.descText}>{ad.description}</Text>
        </View>
      ) : null}

      {/* Actions */}
      {!isOwnAd && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary, sending && styles.btnDisabled]}
            onPress={handleSendRequest}
            disabled={sending}
          >
            <Ionicons name="send-outline" size={20} color={Colors.white} />
            <Text style={styles.actionBtnLabel}>Envoyer une demande</Text>
          </TouchableOpacity>
        </View>
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
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: Colors.grey100,
    borderRadius: 8,
    marginBottom: 4,
  },
  shareBtnLabel: { fontSize: 13, color: Colors.grey700 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
  transporterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  transporterInfo: { flex: 1 },
  transporterName: { fontSize: 16, fontWeight: '600', color: Colors.grey900 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  reviewCount: { fontSize: 12, color: Colors.grey500 },
  profileBtn: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  profileBtnText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  routePoint: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeDotPrimary: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  routeCity: { fontSize: 16, fontWeight: '700', color: Colors.grey900 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 14, color: Colors.grey600 },
  pricingRow: { flexDirection: 'row', alignItems: 'center' },
  pricingItem: { flex: 1, alignItems: 'center', gap: 4 },
  pricingLabel: { fontSize: 12, color: Colors.grey500 },
  pricingValue: { fontSize: 18, fontWeight: '700', color: Colors.grey900 },
  pricingDivider: { width: 1, height: 50, backgroundColor: Colors.grey200 },
  descTitle: { fontSize: 14, fontWeight: '600', color: Colors.grey900, marginBottom: 8 },
  descText: { fontSize: 14, color: Colors.grey600, lineHeight: 22 },
  actions: { gap: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 52,
    gap: 8,
  },
  actionBtnPrimary: { backgroundColor: Colors.primary },
  actionBtnLabel: { fontSize: 16, fontWeight: '600', color: Colors.white },
  btnDisabled: { opacity: 0.5 },
});
