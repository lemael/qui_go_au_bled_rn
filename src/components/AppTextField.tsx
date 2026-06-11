import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface AppTextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  multiline?: boolean;
}

export function AppTextField({
  label,
  error,
  containerStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  multiline,
  style,
  ...rest
}: AppTextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;
  const shouldObscure = isPassword && !showPassword;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.inputWrapperMultiline,
          isFocused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={Colors.grey400}
            style={[styles.leftIcon, multiline && { marginTop: 12 }]}
          />
        )}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeft : null,
            multiline && styles.inputMultiline,
            // Remove browser default outline on web (it conflicts with wrapper border)
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
            style,
          ]}
          placeholderTextColor={Colors.grey400}
          secureTextEntry={shouldObscure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...rest}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Colors.grey400}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={Colors.grey400} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grey700,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grey50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.grey200,
    height: 52,
  },
  inputWrapperMultiline: {
    height: undefined,
    minHeight: 100,
    alignItems: 'stretch',
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  leftIcon: {
    paddingLeft: 14,
  },
  rightIcon: {
    paddingRight: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.grey900,
    paddingHorizontal: 16,
    paddingVertical: 0,
    height: '100%',
  },
  inputMultiline: {
    height: undefined,
    minHeight: 100,
    paddingVertical: 10,
    alignSelf: 'stretch',
  },
  inputWithLeft: {
    paddingLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
});
