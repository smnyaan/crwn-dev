import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ServiceCard({ service, onBook }) {
  return (
    <View style={styles.card}>
      {/* Name + price row */}
      <View style={styles.topRow}>
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.price}>{service.price}</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>{service.description}</Text>

      {/* Duration */}
      <Text style={styles.duration}>{service.duration}</Text>

      {/* Book Now button */}
      <TouchableOpacity style={styles.bookButton} onPress={onBook} activeOpacity={0.85}>
        <Text style={styles.bookText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 16,
    color: '#1A1A1A',
  },
  price: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 16,
    color: '#1A1A1A',
  },
  description: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#5E5E5E',
    marginTop: 4,
    lineHeight: 18,
  },
  duration: {
    fontFamily: 'Figtree-Regular',
    fontSize: 12,
    color: '#ABABAB',
    marginTop: 4,
  },
  bookButton: {
    backgroundColor: '#5D1F1F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  bookText: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
