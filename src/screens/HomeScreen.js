import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

export default function HomeScreen({ onNavigate }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRWN MVP</Text>
      <Text style={styles.subtitle}>A tiny Expo starter — open in Expo Go</Text>
      <PrimaryButton
        title="Open details"
        onPress={() => onNavigate('Details', { id: 1, name: 'Example item' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  title: {
    fontSize: 28,
    fontFamily: 'Figtree_700Bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  }
});
