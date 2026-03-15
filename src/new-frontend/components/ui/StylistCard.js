import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function StylistCard({ stylist, onPress }) {
  const photos = stylist.photos || [];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Photo strip */}
      <View style={styles.photoStrip}>
        {[0, 1, 2].map((i) => (
          <Image
            key={i}
            source={{ uri: photos[i] }}
            style={styles.photo}
            resizeMode="cover"
          />
        ))}
      </View>

      {/* Info section */}
      <View style={styles.info}>
        {/* Name + rating row */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{stylist.name}</Text>
          <View style={styles.ratingBlock}>
            <View style={styles.ratingTopRow}>
              <Text style={styles.crown}>♛</Text>
              <Text style={styles.ratingText}>{stylist.rating}</Text>
            </View>
            <Text style={styles.reviewCount}>{stylist.reviewCount} reviews</Text>
          </View>
        </View>

        {/* Location row */}
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={13} color="#5E5E5E" />
          <Text style={styles.locationText}>{stylist.location}</Text>
        </View>

        {/* Specialty tags */}
        <View style={styles.tagsRow}>
          {(stylist.specialties || []).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  photoStrip: {
    flexDirection: 'row',
    height: 110,
  },
  photo: {
    flex: 1,
    backgroundColor: '#F0EDED',
  },
  info: {
    padding: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  name: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  ratingBlock: {
    alignItems: 'flex-end',
  },
  ratingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  crown: {
    fontSize: 14,
    color: '#F5A42A',
  },
  ratingText: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 15,
    color: '#1A1A1A',
  },
  reviewCount: {
    fontFamily: 'Figtree-Regular',
    fontSize: 11,
    color: '#5E5E5E',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#5E5E5E',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F0EDED',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: 'Figtree-Medium',
    fontSize: 12,
    color: '#5E5E5E',
  },
});
