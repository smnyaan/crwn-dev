import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

// Labeled text input used throughout onboarding forms.
export default function OnboardingInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines,
}) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor="#A89880"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#3D3229',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D4C8B8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    color: '#251C15',
    backgroundColor: '#FFFFFF',
  },
  inputMultiline: {
    height: 80,
    paddingTop: 14,
  },
});
