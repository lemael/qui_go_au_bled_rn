import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth.store';
import { AppTextField } from '../../components/AppTextField';
import { AppButton } from '../../components/AppButton';

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  });
  const [photoUri, setPhotoUri] = useState<string | undefined>(user?.photoUrl);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "L'accès à la galerie est requis.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!user) return;
    try {
      await updateProfile({
        userId: user.id,
        fullName: form.fullName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        photoUri: photoUri !== user.photoUrl ? photoUri : undefined,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Erreur');
    }
  }

  const initials = (user?.fullName ?? '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Photo picker */}
        <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickPhoto}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={14} color={Colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.photoHint}>Appuyez pour changer la photo</Text>

        <View style={{ height: 24 }} />

        <AppTextField
          label="Nom complet"
          value={form.fullName}
          onChangeText={(v) => update('fullName', v)}
          leftIcon="person-outline"
        />
        <View style={{ height: 14 }} />
        <AppTextField
          label="Téléphone"
          value={form.phone}
          onChangeText={(v) => update('phone', v)}
          keyboardType="phone-pad"
          leftIcon="call-outline"
        />
        <View style={{ height: 14 }} />
        <AppTextField
          label="Adresse"
          value={form.address}
          onChangeText={(v) => update('address', v)}
          leftIcon="location-outline"
        />
        <View style={{ height: 32 }} />

        <AppButton label="Enregistrer" onPress={handleSave} isLoading={isLoading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  container: { padding: 24, paddingBottom: 40 },
  avatarWrapper: { position: 'relative', alignSelf: 'center', marginBottom: 4 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: '700', color: Colors.primary },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  photoHint: { textAlign: 'center', fontSize: 12, color: Colors.grey400, marginBottom: 8 },
});
