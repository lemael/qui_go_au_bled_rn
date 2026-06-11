import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { RootStackParamList, TransportOrder } from '../../types';
import { useAuthStore } from '../../store/auth.store';
import ordersService from '../../services/orders.service';
import { OrderCard } from '../../components/OrderCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function MyTransportsScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<TransportOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await ordersService.getMyOrders();
      setOrders(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  if (loading) return <LoadingOverlay />;

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadOrders(); }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Aucun transport"
            subtitle="Vos transports apparaîtront ici."
            icon="car-outline"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <OrderCard
              order={item}
              currentUserId={user?.id ?? ''}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  list: { padding: 16, paddingBottom: 32 },
  cardWrapper: { marginBottom: 12 },
});
