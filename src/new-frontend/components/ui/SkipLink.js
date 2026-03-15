import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function SkipLink({ onPress, label = 'Skip' }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  text: {
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    color: '#251C15',
    textDecorationLine: 'underline',
  },
});
