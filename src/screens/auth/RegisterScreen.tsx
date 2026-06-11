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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { useAuthStore } from '../../store/auth.store';
import { AppTextField } from '../../components/AppTextField';
import { AppButton } from '../../components/AppButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { signUp, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<typeof form> = {};
    if (!form.fullName.trim()) errs.fullName = 'Nom complet requis';
    if (!form.email.trim()) errs.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide';
    if (!form.phone.trim()) errs.phone = 'Téléphone requis';
    if (!form.address.trim()) errs.address = 'Adresse requise';
    if (!form.password) errs.password = 'Mot de passe requis';
    else if (form.password.length < 6) errs.password = 'Minimum 6 caractères';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSignUp() {
    if (!validate()) return;
    try {
      await signUp({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
    } catch (e) {
      Alert.alert(
        "Erreur d'inscription",
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
          <Ionicons name="person-add-outline" size={36} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez la communauté Qui Go au Bled</Text>

        <View style={styles.form}>
          <AppTextField
            label="Nom complet"
            placeholder="Prénom Nom"
            value={form.fullName}
            onChangeText={(v) => update('fullName', v)}
            leftIcon="person-outline"
            error={errors.fullName}
          />
          <View style={{ height: 14 }} />
          <AppTextField
            label="Email"
            placeholder="votre@email.com"
            value={form.email}
            onChangeText={(v) => update('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
          />
          <View style={{ height: 14 }} />
          <AppTextField
            label="Téléphone"
            placeholder="+33 6 00 00 00 00"
            value={form.phone}
            onChangeText={(v) => update('phone', v)}
            keyboardType="phone-pad"
            leftIcon="call-outline"
            error={errors.phone}
          />
          <View style={{ height: 14 }} />
          <AppTextField
            label="Adresse"
            placeholder="Votre adresse complète"
            value={form.address}
            onChangeText={(v) => update('address', v)}
            leftIcon="location-outline"
            error={errors.address}
          />
          <View style={{ height: 14 }} />
          <AppTextField
            label="Mot de passe"
            placeholder="••••••••"
            value={form.password}
            onChangeText={(v) => update('password', v)}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.password}
          />
          <View style={{ height: 14 }} />
          <AppTextField
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChangeText={(v) => update('confirmPassword', v)}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.confirmPassword}
          />
          <View style={{ height: 24 }} />

          <AppButton
            label="Créer mon compte"
            onPress={handleSignUp}
            isLoading={isLoading}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Déjà un compte ? </Text>
            <AppButton
              label="Se connecter"
              onPress={() => navigation.navigate('Login')}
              variant="text"
              style={styles.loginBtn}
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
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.grey900,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grey500,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 32,
  },
  form: {},
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  loginText: { fontSize: 14, color: Colors.grey600 },
  loginBtn: { height: 36 },
});
