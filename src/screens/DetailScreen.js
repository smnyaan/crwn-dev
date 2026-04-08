import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

export default function DetailScreen({ route, onBack }) {
  const { params } = route || {};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details</Text>
      <Text style={styles.body}>You opened: {params?.name ?? '—'}</Text>
      <PrimaryButton title="Back" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontFamily: 'Figtree_700Bold',
    marginBottom: 8
  },
  body: {
    fontSize: 16,
    marginBottom: 20
  }
});
