import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { confirmAlert, showAlert } from '../../utils/alert';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import ordersService from '../../services/orders.service';
import { AppTextField } from '../../components/AppTextField';
import { AppButton } from '../../components/AppButton';

type Route = RouteProp<RootStackParamList, 'CancelOrder'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CancelOrderScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!reason.trim()) {
      showAlert('Motif requis', "Veuillez indiquer un motif d'annulation.");
      return;
    }
    confirmAlert(
      "Confirmer l'annulation",
      'Êtes-vous sûr de vouloir annuler ce transport ?',
      async () => {
        setLoading(true);
        try {
          await ordersService.cancelOrder(params.orderId, reason.trim());
          navigation.pop(2);
        } catch (e) {
          showAlert('Erreur', e instanceof Error ? e.message : 'Erreur');
        } finally {
          setLoading(false);
        }
      },
      'Oui, annuler',
      true,
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>Annuler ce transport</Text>
          <Text style={styles.warningText}>
            Cette action est irréversible. Veuillez indiquer le motif de l'annulation.
          </Text>
        </View>

        <AppTextField
          label="Motif d'annulation"
          placeholder="Expliquez pourquoi vous annulez ce transport..."
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          leftIcon="document-text-outline"
          style={{ height: 120, textAlignVertical: 'top' }}
        />
        <View style={{ height: 24 }} />
        <AppButton
          label="Confirmer l'annulation"
          onPress={handleCancel}
          isLoading={loading}
          style={styles.cancelBtn}
          textStyle={{ color: Colors.white }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  warningBox: {
    backgroundColor: `${Colors.error}10`,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: `${Colors.error}30`,
  },
  warningIcon: { fontSize: 36 },
  warningTitle: { fontSize: 18, fontWeight: '700', color: Colors.error },
  warningText: { fontSize: 14, color: Colors.grey600, textAlign: 'center', lineHeight: 22 },
  cancelBtn: { backgroundColor: Colors.error },
});
