import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Square grid tile for style selection (Wash & Gos, Braids, etc.)
// Future: backgroundImage prop for photo backgrounds.
export default function StyleGridItem({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tile, selected && styles.tileSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#D4C8B8',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end',
    padding: 12,
    margin: 4,
  },
  tileSelected: {
    borderColor: '#BF9466',
    backgroundColor: '#FBF6F0',
  },
  label: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#251C15',
  },
  labelSelected: {
    color: '#251C15',
  },
});
