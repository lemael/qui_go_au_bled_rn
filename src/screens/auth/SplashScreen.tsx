import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="airplane" size={56} color={Colors.white} />
      </View>
      <Text style={styles.title}>Qui Go au Bled</Text>
      <Text style={styles.subtitle}>Votre plateforme de transport de colis</Text>
      <View style={styles.loaderWrapper}>
        <LoadingOverlay />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  loaderWrapper: {
    marginTop: 40,
  },
});
