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
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import reviewsService from '../../services/reviews.service';
import { AppTextField } from '../../components/AppTextField';
import { AppButton } from '../../components/AppButton';

type Route = RouteProp<RootStackParamList, 'CreateReview'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CreateReviewScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      showAlert('Note requise', 'Veuillez sélectionner une note.');
      return;
    }
    setLoading(true);
    try {
      await reviewsService.createReview({ orderId: params.orderId, rating, comment: comment.trim() });
      showAlert('Merci !', 'Votre avis a été publié.', () => navigation.goBack());
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
        <Text style={styles.title}>Comment évaluez-vous ce transport ?</Text>

        {/* Star selector */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={44}
                color={star <= rating ? Colors.starActive : Colors.grey300}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bon', 'Excellent'][rating]}
          </Text>
        )}

        <View style={{ height: 24 }} />

        <AppTextField
          label="Commentaire (facultatif)"
          placeholder="Décrivez votre expérience..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={5}
          leftIcon="chatbubble-outline"
          style={{ height: 120, textAlignVertical: 'top' }}
        />

        <View style={{ height: 32 }} />
        <AppButton label="Publier mon avis" onPress={handleSubmit} isLoading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: Colors.scaffoldBackground },
  container: { padding: 24, paddingTop: 32, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.grey900, marginBottom: 24, textAlign: 'center' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  ratingLabel: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: Colors.grey700 },
});
