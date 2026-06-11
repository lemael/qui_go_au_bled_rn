import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth.store';

export function SettingsScreen() {
  const { user, signOut } = useAuthStore();

  function handleSignOut() {
    Alert.alert('Déconnexion', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Compte</Text>
      <View style={styles.group}>
        <SettingsRow icon="person-outline" label="Nom" value={user?.fullName} />
        <View style={styles.separator} />
        <SettingsRow icon="mail-outline" label="Email" value={user?.email} />
        <View style={styles.separator} />
        <SettingsRow icon="call-outline" label="Téléphone" value={user?.phone} />
      </View>

      <Text style={styles.section}>Notifications</Text>
      <View style={styles.group}>
        <View style={styles.switchRow}>
          <Ionicons name="notifications-outline" size={20} color={Colors.grey600} />
          <Text style={styles.switchLabel}>Notifications push</Text>
          <Switch value={true} onValueChange={() => {}} thumbColor={Colors.white} trackColor={{ false: Colors.grey300, true: Colors.primary }} />
        </View>
      </View>

      <Text style={styles.section}>À propos</Text>
      <View style={styles.group}>
        <SettingsRow icon="information-circle-outline" label="Version" value="1.0.0" />
        <View style={styles.separator} />
        <SettingsRow icon="shield-checkmark-outline" label="Conditions d'utilisation" />
        <View style={styles.separator} />
        <SettingsRow icon="lock-closed-outline" label="Politique de confidentialité" />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SettingsRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
}) {
  return (
    <View style={rowStyles.row}>
      <Ionicons name={icon} size={20} color={Colors.grey500} />
      <Text style={rowStyles.label}>{label}</Text>
      {value ? <Text style={rowStyles.value}>{value}</Text> : <Ionicons name="chevron-forward" size={16} color={Colors.grey300} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  content: { padding: 20, paddingBottom: 60 },
  section: { fontSize: 12, fontWeight: '600', color: Colors.grey500, marginTop: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  group: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.grey200,
    overflow: 'hidden',
  },
  separator: { height: 1, backgroundColor: Colors.grey100, marginLeft: 52 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  switchLabel: { flex: 1, fontSize: 15, color: Colors.grey800 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: `${Colors.error}50`,
    paddingVertical: 14,
    gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.error },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  label: { flex: 1, fontSize: 15, color: Colors.grey800 },
  value: { fontSize: 14, color: Colors.grey400 },
});
