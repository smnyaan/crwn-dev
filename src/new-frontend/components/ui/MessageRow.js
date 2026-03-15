import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

// Single conversation row in the messages list.
export default function MessageRow({ conversation, onPress }) {
  const { username, lastMessage, timestamp, avatarUrl, unread } = conversation;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>{username?.[0]?.toUpperCase()}</Text>
          </View>
        )}
        {unread && <View style={styles.badge} />}
      </View>

      <View style={styles.content}>
        <Text style={[styles.username, unread && styles.usernameUnread]}>{username}</Text>
        <Text style={styles.preview} numberOfLines={1}>{lastMessage}</Text>
      </View>

      <Text style={styles.time}>{timestamp}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D4C8B8',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5D1F1F',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  username: {
    fontFamily: 'Figtree-Medium',
    fontSize: 15,
    color: '#1A1A1A',
  },
  usernameUnread: {
    fontFamily: 'Figtree-SemiBold',
  },
  preview: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#7A7A7A',
  },
  time: {
    fontFamily: 'Figtree-Regular',
    fontSize: 12,
    color: '#ABABAB',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});
