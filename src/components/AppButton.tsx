import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../constants/colors';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'filled' | 'outlined' | 'text';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function AppButton({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'filled',
  style,
  textStyle,
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'filled' && styles.filled,
        variant === 'outlined' && styles.outlined,
        variant === 'text' && styles.textBtn,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'filled' ? Colors.white : Colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'filled' && styles.labelFilled,
            variant === 'outlined' && styles.labelOutlined,
            variant === 'text' && styles.labelText,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  filled: {
    backgroundColor: Colors.primary,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  textBtn: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  labelFilled: {
    color: Colors.white,
  },
  labelOutlined: {
    color: Colors.primary,
  },
  labelText: {
    color: Colors.primary,
  },
});
