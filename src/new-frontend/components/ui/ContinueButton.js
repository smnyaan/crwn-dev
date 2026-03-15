import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Primary onboarding CTA button. variant="dark" for the completion screens.
export default function ContinueButton({ label = 'Continue', onPress, disabled, variant = 'default' }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'dark' && styles.buttonDark,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7B8877',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 32,
  },
  buttonDark: {
    backgroundColor: '#2D4A35',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: 'Figtree-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
