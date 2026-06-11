import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { useAuthStore } from '../../store/auth.store';
import { isTransporter as checkTransporter } from '../../types';
import { StarRating } from '../../components/StarRating';
import { LoadingOverlay } from '../../components/LoadingOverlay';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuthStore();
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!user) return <LoadingOverlay />;

  const isTransporter = checkTransporter(user);

  function handleSignOut() {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="create-outline" size={24} color={Colors.grey700} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={Colors.grey700} />
        </TouchableOpacity>
      </View>

      {/* Avatar & name */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user.fullName)}</Text>
        </View>
        <Text style={styles.name}>{user.fullName}</Text>

        {/* Role badges */}
        <View style={styles.rolesRow}>
          {(user.role === 'client' || user.role === 'both') && (
            <View style={[styles.roleBadge, { backgroundColor: `${Colors.secondary}15` }]}>
              <Text style={[styles.roleBadgeText, { color: Colors.secondary }]}>Client</Text>
            </View>
          )}
          {isTransporter && (
            <View style={[styles.roleBadge, { backgroundColor: `${Colors.primary}15` }]}>
              <Text style={[styles.roleBadgeText, { color: Colors.primary }]}>Transporteur</Text>
            </View>
          )}
        </View>

        {isTransporter && (
          <View style={styles.ratingRow}>
            <StarRating rating={user.averageRating} />
            <Text style={styles.ratingText}>({user.totalReviews} avis)</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <InfoRow icon="mail-outline" label="Email" value={user.email} />
        <View style={styles.separator} />
        <InfoRow icon="call-outline" label="Téléphone" value={user.phone} />
        <View style={styles.separator} />
        <InfoRow icon="location-outline" label="Adresse" value={user.address} />
      </View>

      {/* Transporter actions */}
      {isTransporter && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Ionicons name="stats-chart-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Tableau de bord</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Reviews', { transporterId: user.id })}
          >
            <Ionicons name="star-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Mes avis</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* My requests */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('MyRequests')}
      >
        <Ionicons name="mail-outline" size={20} color={Colors.grey600} />
        <Text style={styles.menuItemText}>Mes demandes</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.grey400} />
      </TouchableOpacity>

      {isTransporter && (
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyAds')}
        >
          <Ionicons name="megaphone-outline" size={20} color={Colors.grey600} />
          <Text style={styles.menuItemText}>Mes annonces</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.grey400} />
        </TouchableOpacity>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={18} color={Colors.grey400} />
      <View>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  content: { padding: 20, gap: 14, paddingBottom: 60 },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    paddingTop: 8,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
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
  rolesRow: { flexDirection: 'row', gap: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleBadgeText: { fontSize: 13, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 13, color: Colors.grey500 },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grey200,
    gap: 10,
  },
  separator: { height: 1, backgroundColor: Colors.grey100 },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grey200,
    paddingVertical: 12,
    gap: 6,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grey200,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: { flex: 1, fontSize: 15, color: Colors.grey800 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: `${Colors.error}50`,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.error },
});

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  label: { fontSize: 11, color: Colors.grey400, marginBottom: 2 },
  value: { fontSize: 14, color: Colors.grey800 },
});
