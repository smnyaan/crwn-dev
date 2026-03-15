import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReviewCard({ review }) {
  return (
    <View style={styles.card}>
      {/* Reviewer name + crown rating row */}
      <View style={styles.topRow}>
        <Text style={styles.reviewerName}>{review.reviewerName}</Text>
        <View style={styles.crownRow}>
          <Text style={styles.crown}>♛</Text>
          <Text style={styles.crownRating}>{review.crownRating}</Text>
        </View>
      </View>

      {/* Time ago */}
      <Text style={styles.timeAgo}>{review.timeAgo}</Text>

      {/* Review text */}
      <Text style={styles.text}>{review.text}</Text>

      {/* Service tag pill */}
      <View style={styles.serviceTag}>
        <Text style={styles.serviceTagText}>{review.serviceTag}</Text>
      </View>
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
  reviewerName: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 15,
    color: '#1A1A1A',
  },
  crownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  crown: {
    fontSize: 14,
    color: '#F5A42A',
  },
  crownRating: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 15,
    color: '#1A1A1A',
  },
  timeAgo: {
    fontFamily: 'Figtree-Regular',
    fontSize: 12,
    color: '#ABABAB',
    marginTop: 2,
  },
  text: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#1A1A1A',
    marginTop: 8,
    lineHeight: 20,
  },
  serviceTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0EDED',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  serviceTagText: {
    fontFamily: 'Figtree-Medium',
    fontSize: 12,
    color: '#5E5E5E',
  },
});
