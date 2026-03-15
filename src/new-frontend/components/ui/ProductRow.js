import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Single product row in the tagged products bottom sheet.
export default function ProductRow({ name, retailer, imageUrl, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.retailer}>{retailer}</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#ABABAB" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F0EDED',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F0EDED',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  retailer: {
    fontFamily: 'Figtree-Regular',
    fontSize: 12,
    color: '#7A7A7A',
  },
});
