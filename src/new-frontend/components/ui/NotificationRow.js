import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const BADGE_COLORS = {
  crown: '#F5A42A',
  comment: '#5D1F1F',
  follow: '#4A7C59',
};

export default function NotificationRow({ notification }) {
  const { username, action, timeAgo, avatarUrl, thumbnailUrl, type } = notification;

  const renderBadgeIcon = () => {
    if (type === 'crown') {
      return <Text style={styles.crownIcon}>♛</Text>;
    }
    if (type === 'comment') {
      return <Feather name="message-circle" size={10} color="white" />;
    }
    if (type === 'follow') {
      return <Feather name="user-plus" size={10} color="white" />;
    }
    return null;
  };

  return (
    <View style={styles.row}>
      {/* Avatar section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback} />
          )}
        </View>
        <View style={[styles.badge, { backgroundColor: BADGE_COLORS[type] || '#F5A42A' }]}>
          {renderBadgeIcon()}
        </View>
      </View>

      {/* Text section */}
      <View style={styles.textSection}>
        <Text style={styles.actionText}>
          <Text style={styles.username}>@{username}</Text>
          {' '}
          <Text style={styles.action}>{action}</Text>
        </Text>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>

      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnailImage} />
        ) : (
          <View style={styles.thumbnailFallback} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 12,
  },
  avatarSection: {
    position: 'relative',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    backgroundColor: '#D4C8B8',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownIcon: {
    color: 'white',
    fontSize: 9,
  },
  textSection: {
    flex: 1,
    gap: 2,
  },
  actionText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'Figtree-Regular',
    flexWrap: 'wrap',
  },
  username: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#5D1F1F',
  },
  action: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#1A1A1A',
  },
  timeAgo: {
    fontFamily: 'Figtree-Regular',
    fontSize: 12,
    color: '#ABABAB',
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F0EDED',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: 44,
    height: 44,
  },
  thumbnailFallback: {
    width: 44,
    height: 44,
    backgroundColor: '#F0EDED',
  },
});
