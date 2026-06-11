import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth.store';
import { AppTextField } from '../../components/AppTextField';
import { AppButton } from '../../components/AppButton';

export function ResetPasswordScreen() {
  const { resetPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert('Champ requis', 'Veuillez entrer votre adresse email.');
      return;
    }
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e) {
      Alert.alert(
        'Erreur',
        e instanceof Error ? e.message : 'Une erreur est survenue'
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.successTitle}>Email envoyé !</Text>
            <Text style={styles.successText}>
              Un lien de réinitialisation a été envoyé à {email}. Vérifiez votre
              boîte mail.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Mot de passe oublié ?</Text>
            <Text style={styles.subtitle}>
              Entrez votre adresse email et nous vous enverrons un lien pour
              réinitialiser votre mot de passe.
            </Text>
            <AppTextField
              label="Email"
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />
            <View style={{ height: 24 }} />
            <AppButton
              label="Envoyer le lien"
              onPress={handleReset}
              isLoading={isLoading}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: Colors.white },
  container: { flexGrow: 1, padding: 24, paddingTop: 40, backgroundColor: Colors.white },
  title: { fontSize: 24, fontWeight: '700', color: Colors.grey900, marginBottom: 10 },
  subtitle: { fontSize: 14, color: Colors.grey500, marginBottom: 32, lineHeight: 22 },
  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  successIcon: { fontSize: 56 },
  successTitle: { fontSize: 22, fontWeight: '700', color: Colors.grey900 },
  successText: { fontSize: 14, color: Colors.grey500, textAlign: 'center', lineHeight: 22 },
});
