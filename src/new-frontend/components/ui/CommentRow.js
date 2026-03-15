import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Single comment row: avatar initial, @username + text, reply link, crown count.
export default function CommentRow({ username, text, crownCount = 0, avatarColor = '#C4855A' }) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarInitial}>{username?.[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>
          <Text style={styles.username}>@{username}</Text>
          {'  '}{text}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.reply}>Reply</Text>
          </TouchableOpacity>
          <View style={styles.crown}>
            <Text style={styles.crownIcon}>👑</Text>
            <Text style={styles.crownCount}>{crownCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitial: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  username: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#5D1F1F',
  },
  text: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  reply: {
    fontFamily: 'Figtree-Medium',
    fontSize: 12,
    color: '#7A7A7A',
  },
  crown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  crownIcon: {
    fontSize: 12,
  },
  crownCount: {
    fontFamily: 'Figtree-Medium',
    fontSize: 12,
    color: '#7A7A7A',
  },
});
