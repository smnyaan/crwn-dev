import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BookingCard({ booking }) {
  const { stylistName, service, date, status } = booking;

  const isUpcoming = status === 'Upcoming';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.stylistName} numberOfLines={1}>{stylistName}</Text>
        <View style={[styles.badge, isUpcoming ? styles.badgeUpcoming : styles.badgeCompleted]}>
          <Text style={[styles.badgeText, isUpcoming ? styles.badgeTextUpcoming : styles.badgeTextCompleted]}>
            {status}
          </Text>
        </View>
      </View>
      <Text style={styles.service}>{service}</Text>
      <Text style={styles.date}>{date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stylistName: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeUpcoming: {
    backgroundColor: '#FFF3E0',
  },
  badgeCompleted: {
    backgroundColor: '#F0EDED',
  },
  badgeText: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 12,
  },
  badgeTextUpcoming: {
    color: '#E07B00',
  },
  badgeTextCompleted: {
    color: '#5E5E5E',
  },
  service: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#5E5E5E',
    marginTop: 4,
  },
  date: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#ABABAB',
    marginTop: 4,
  },
});
