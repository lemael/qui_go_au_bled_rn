import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { showAlert } from '../../utils/alert';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import adsService from '../../services/ads.service';
import { AppTextField } from '../../components/AppTextField';
import { AppButton } from '../../components/AppButton';
import { formatDate, formatDateInput } from '../../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CreateAdScreen() {
  const navigation = useNavigation<Nav>();
  const [form, setForm] = useState({
    departureCity: '',
    arrivalCity: '',
    flightDate: null as Date | null,
    flightTime: '',
    maxWeightKg: '',
    pricePerKg: '',
    description: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(key: keyof typeof form, value: string | Date | null) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.departureCity.trim()) errs.departureCity = 'Ville de départ requise';
    if (!form.arrivalCity.trim()) errs.arrivalCity = "Ville d'arrivée requise";
    if (!form.flightDate) errs.flightDate = 'Date de vol requise';
    if (!form.flightTime.trim()) errs.flightTime = 'Heure de vol requise';
    const weight = parseFloat(form.maxWeightKg);
    if (!form.maxWeightKg || isNaN(weight) || weight <= 0)
      errs.maxWeightKg = 'Poids maximum invalide';
    const price = parseFloat(form.pricePerKg);
    if (!form.pricePerKg || isNaN(price) || price <= 0)
      errs.pricePerKg = 'Prix par kg invalide';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      await adsService.createAd({
        departureCity: form.departureCity.trim(),
        arrivalCity: form.arrivalCity.trim(),
        flightDate: formatDateInput(form.flightDate!),
        flightTime: form.flightTime.trim(),
        maxWeightKg: parseFloat(form.maxWeightKg),
        pricePerKg: parseFloat(form.pricePerKg),
        description: form.description.trim(),
      });
      showAlert('Succès', 'Votre annonce a été publiée.', () => navigation.goBack());
    } catch (e) {
      showAlert('Erreur', e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <AppTextField
            label="Ville de départ"
            placeholder="Ex: Paris"
            value={form.departureCity}
            onChangeText={(v) => update('departureCity', v)}
            leftIcon="radio-button-on-outline"
            error={errors.departureCity}
          />
          <View style={{ height: 16 }} />
          <AppTextField
            label="Ville d'arrivée"
            placeholder="Ex: Alger"
            value={form.arrivalCity}
            onChangeText={(v) => update('arrivalCity', v)}
            leftIcon="location-outline"
            error={errors.arrivalCity}
          />
          <View style={{ height: 16 }} />

          {/* Date */}
          <Text style={styles.fieldLabel}>Date de vol</Text>
          <TouchableOpacity
            style={[styles.datePicker, errors.flightDate ? styles.datePickerError : null]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.grey400} />
            <Text style={[styles.dateText, !form.flightDate && { color: Colors.grey400 }]}>
              {form.flightDate ? formatDate(form.flightDate.toISOString()) : 'Sélectionner...'}
            </Text>
          </TouchableOpacity>
          {errors.flightDate ? <Text style={styles.error}>{errors.flightDate}</Text> : null}
          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            onConfirm={(d) => { update('flightDate', d); setShowDatePicker(false); }}
            onCancel={() => setShowDatePicker(false)}
            minimumDate={new Date()}
          />

          <View style={{ height: 16 }} />
          <AppTextField
            label="Heure de vol"
            placeholder="Ex: 14:30"
            value={form.flightTime}
            onChangeText={(v) => update('flightTime', v)}
            leftIcon="time-outline"
            error={errors.flightTime}
          />
          <View style={{ height: 16 }} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppTextField
                label="Poids max (kg)"
                placeholder="Ex: 20"
                value={form.maxWeightKg}
                onChangeText={(v) => update('maxWeightKg', v)}
                keyboardType="decimal-pad"
                leftIcon="scale-outline"
                error={errors.maxWeightKg}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <AppTextField
                label="Prix / kg (€)"
                placeholder="Ex: 5"
                value={form.pricePerKg}
                onChangeText={(v) => update('pricePerKg', v)}
                keyboardType="decimal-pad"
                leftIcon="cash-outline"
                error={errors.pricePerKg}
              />
            </View>
          </View>
          <View style={{ height: 16 }} />

          <AppTextField
            label="Description"
            placeholder="Décrivez ce que vous pouvez transporter..."
            value={form.description}
            onChangeText={(v) => update('description', v)}
            multiline
            numberOfLines={4}
            leftIcon="document-text-outline"
            style={{ height: 100, textAlignVertical: 'top' }}
          />
          <View style={{ height: 32 }} />

          <AppButton label="Publier l'annonce" onPress={handleSubmit} isLoading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  container: { padding: 20, paddingBottom: 40 },
  form: {},
  fieldLabel: { fontSize: 14, fontWeight: '500', color: Colors.grey700, marginBottom: 6 },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grey50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.grey200,
    height: 52,
    paddingHorizontal: 14,
    gap: 8,
  },
  datePickerError: { borderColor: Colors.error },
  dateText: { flex: 1, fontSize: 15, color: Colors.grey900 },
  error: { fontSize: 12, color: Colors.error, marginTop: 4 },
  row: { flexDirection: 'row' },
});
