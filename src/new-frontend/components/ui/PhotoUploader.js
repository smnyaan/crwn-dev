import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Photo upload card with orange upload icon. Used for profile photo + portfolio.
export default function PhotoUploader({ onPress, caption = 'You can add up to 6 photos' }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconCircle}>
        <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>Tap to upload photos</Text>
      <Text style={styles.caption}>{caption}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#D4C8B8',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginHorizontal: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5A42A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 15,
    color: '#251C15',
    marginBottom: 4,
  },
  caption: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#7A6E65',
  },
});
