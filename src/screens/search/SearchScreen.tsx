import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RootStackParamList, TransportAd } from '../../types';
import adsService from '../../services/ads.service';
import { AdCard } from '../../components/AdCard';
import { AppTextField } from '../../components/AppTextField';
import { AppButton } from '../../components/AppButton';
import { EmptyState } from '../../components/EmptyState';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { formatDate, formatDateInput } from '../../utils/date';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [results, setResults] = useState<TransportAd[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    setLoading(true);
    setSearched(true);
    try {
      const ads = await adsService.searchAds({
        departureCity: departure.trim() || undefined,
        arrivalCity: arrival.trim() || undefined,
        flightDate: selectedDate ? formatDateInput(selectedDate) : undefined,
      });
      setResults(ads);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setDeparture('');
    setArrival('');
    setSelectedDate(null);
    setResults(null);
    setSearched(false);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rechercher un transporteur</Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <AppTextField
          label="Départ"
          placeholder="Ex: Paris"
          value={departure}
          onChangeText={setDeparture}
          leftIcon="radio-button-on-outline"
          containerStyle={styles.filterField}
        />
        <View style={{ height: 12 }} />
        <AppTextField
          label="Arrivée"
          placeholder="Ex: Alger"
          value={arrival}
          onChangeText={setArrival}
          leftIcon="location-outline"
          containerStyle={styles.filterField}
        />
        <View style={{ height: 12 }} />

        {/* Date picker */}
        <Text style={styles.dateLabel}>Date de vol</Text>
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={Colors.grey400} />
          <Text style={[styles.dateText, !selectedDate && { color: Colors.grey400 }]}>
            {selectedDate ? formatDate(selectedDate.toISOString()) : 'Sélectionner une date'}
          </Text>
          {selectedDate && (
            <TouchableOpacity onPress={() => setSelectedDate(null)}>
              <Ionicons name="close-circle" size={18} color={Colors.grey400} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={(date) => { setSelectedDate(date); setShowDatePicker(false); }}
          onCancel={() => setShowDatePicker(false)}
          minimumDate={new Date()}
          locale="fr-FR"
        />

        <View style={styles.filterActions}>
          <AppButton
            label="Rechercher"
            onPress={handleSearch}
            isLoading={loading}
            style={{ flex: 1 }}
          />
          {searched && (
            <AppButton
              label="Effacer"
              onPress={handleClear}
              variant="outlined"
              style={styles.clearBtn}
            />
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Results */}
      {loading ? (
        <LoadingOverlay message="Recherche en cours..." />
      ) : !searched ? (
        <EmptyState
          title="Lancez une recherche"
          subtitle="Entrez votre destination pour trouver un transporteur."
          icon="search-outline"
        />
      ) : results === null || results.length === 0 ? (
        <EmptyState
          title="Aucun résultat"
          subtitle="Essayez avec d'autres critères de recherche."
          icon="search-outline"
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <AdCard
              ad={item}
              onPress={() => navigation.navigate('AdDetail', { adId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.grey900 },
  filters: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterField: {},
  dateLabel: { fontSize: 14, fontWeight: '500', color: Colors.grey700, marginBottom: 6 },
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
  dateText: { flex: 1, fontSize: 15, color: Colors.grey900 },
  filterActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  clearBtn: { width: 100 },
  divider: { height: 1, backgroundColor: Colors.grey200 },
  resultsList: { padding: 16 },
});
