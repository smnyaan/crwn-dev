import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Single-select option row. Highlights when selected.
export default function SelectOption({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1,
    borderColor: '#D4C8B8',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: '#BF9466',
    backgroundColor: '#FBF6F0',
  },
  label: {
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    color: '#251C15',
  },
  labelSelected: {
    fontFamily: 'Figtree-SemiBold',
  },
});
