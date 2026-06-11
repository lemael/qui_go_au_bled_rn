import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert that uses window.confirm on web
 * and Alert.alert on native.
 */
export function confirmAlert(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'Confirmer',
  destructive = false,
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

/**
 * Cross-platform simple alert (no confirmation).
 */
export function showAlert(title: string, message: string, onDismiss?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
    onDismiss?.();
    return;
  }
  Alert.alert(title, message, onDismiss ? [{ text: 'OK', onPress: onDismiss }] : undefined);
}
