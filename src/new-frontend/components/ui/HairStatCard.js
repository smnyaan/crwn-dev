import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HairStatCard({ label, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
  },
  label: {
    fontFamily: 'Figtree-Medium',
    fontSize: 12,
    color: '#F5A42A',
    marginBottom: 6,
  },
  value: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 24,
    color: '#1A1A1A',
  },
});
