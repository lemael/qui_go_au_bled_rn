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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { useAuthStore } from '../../store/auth.store';
import { AppTextField } from '../../components/AppTextField';
import { AppButton } from '../../components/AppButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { signIn, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email invalide';
    if (!password) errs.password = 'Mot de passe requis';
    else if (password.length < 6) errs.password = 'Minimum 6 caractères';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSignIn() {
    if (!validate()) return;
    try {
      await signIn({ email: email.trim(), password });
      // Navigation handled by AppNavigator based on auth state
    } catch (e) {
      Alert.alert(
        'Erreur de connexion',
        e instanceof Error ? e.message : 'Une erreur est survenue'
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="airplane-outline" size={40} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Bon retour !</Text>
        <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>

        <View style={styles.form}>
          <AppTextField
            label="Email"
            placeholder="votre@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
          />
          <View style={{ height: 16 }} />
          <AppTextField
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          <View style={styles.forgotRow}>
            <AppButton
              label="Mot de passe oublié ?"
              onPress={() => navigation.navigate('ResetPassword')}
              variant="text"
              style={styles.forgotBtn}
            />
          </View>

          <AppButton
            label="Se connecter"
            onPress={handleSignIn}
            isLoading={isLoading}
            style={styles.submitBtn}
          />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Pas encore de compte ? </Text>
            <AppButton
              label="Créer un compte"
              onPress={() => navigation.navigate('Register')}
              variant="text"
              style={styles.signupBtn}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: Colors.white },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: Colors.white,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.grey900,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.grey500,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 40,
  },
  form: { gap: 0 },
  forgotRow: { alignItems: 'flex-end', marginTop: 4 },
  forgotBtn: { height: 36 },
  submitBtn: { marginTop: 24 },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: { fontSize: 14, color: Colors.grey600 },
  signupBtn: { height: 36 },
});
