import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RootStackParamList, Review } from '../../types';
import reviewsService from '../../services/reviews.service';
import { StarRating } from '../../components/StarRating';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { formatDate } from '../../utils/date';

type Route = RouteProp<RootStackParamList, 'Reviews'>;

export function ReviewsScreen() {
  const { params } = useRoute<Route>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadReviews() {
    try {
      const data = await reviewsService.getReviewsByTransporter(params.transporterId);
      setReviews(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadReviews(); }, [params.transporterId]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (loading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      {/* Summary */}
      {reviews.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.avgNumber}>{avgRating.toFixed(1)}</Text>
          <StarRating rating={avgRating} size={20} />
          <Text style={styles.totalText}>{reviews.length} avis</Text>
        </View>
      )}

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadReviews(); }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState title="Aucun avis" subtitle="Ce transporteur n'a pas encore d'avis." icon="star-outline" />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.clientRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(item.clientName)}</Text>
                </View>
                <View>
                  <Text style={styles.clientName}>{item.clientName}</Text>
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
              <StarRating rating={item.rating} size={14} />
            </View>
            {item.comment ? (
              <Text style={styles.comment}>{item.comment}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  summary: {
    backgroundColor: Colors.white,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey100,
  },
  avgNumber: { fontSize: 40, fontWeight: '700', color: Colors.grey900 },
  totalText: { fontSize: 14, color: Colors.grey500 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  clientName: { fontSize: 14, fontWeight: '600', color: Colors.grey900 },
  date: { fontSize: 12, color: Colors.grey400 },
  comment: { fontSize: 14, color: Colors.grey600, lineHeight: 22 },
});
