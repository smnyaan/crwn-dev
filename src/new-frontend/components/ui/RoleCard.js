import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Role selection card — "I'm here for my hair!" vs "I'm a stylist or hair professional!"
export default function RoleCard({ title, description, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: '#D4C8B8',
    borderRadius: 12,
    padding: 18,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: '#C05A2A',
  },
  title: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 15,
    color: '#C05A2A',
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#52463C',
  },
});
