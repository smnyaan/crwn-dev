import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Community thread card. Displays tag, title, body preview, and engagement counts.
export default function ThreadCard({ thread, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.tag}>{thread.tag}</Text>
      <Text style={styles.title}>{thread.title}</Text>
      <Text style={styles.body} numberOfLines={2}>{thread.body}</Text>
      <View style={styles.bottomRow}>
        <Text style={styles.crown}>♛</Text>
        <Text style={styles.count}>{thread.crownCount}</Text>
        <Text style={styles.separator}> • </Text>
        <Feather name="message-circle" size={13} color="#5E5E5E" />
        <Text style={styles.count}>{thread.commentCount}</Text>
        <Text style={styles.separator}> • </Text>
        <Text style={styles.timeAgo}>{thread.timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  tag: {
    backgroundColor: '#F0EDED',
    color: '#5E5E5E',
    fontFamily: 'Figtree-Medium',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
    overflow: 'hidden',
  },
  title: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: 22,
  },
  body: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#5E5E5E',
    lineHeight: 18,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crown: {
    color: '#F5A42A',
    fontSize: 13,
  },
  count: {
    fontFamily: 'Figtree-Medium',
    fontSize: 13,
    color: '#5E5E5E',
  },
  separator: {
    color: '#D0D0D0',
    fontSize: 13,
  },
  timeAgo: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#5E5E5E',
  },
});
