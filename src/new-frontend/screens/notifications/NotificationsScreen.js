import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationRow from '../../components/ui/NotificationRow';

const NOTIFICATIONS = [
  {
    id: '1',
    username: 'NaturalNectar',
    action: 'crowned your post',
    timeAgo: '2m ago',
    type: 'crown',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611676930340-33c9b3977e2e?w=100',
  },
  {
    id: '2',
    username: 'CurlyCrown',
    action: 'commented: "Love this protective style!"',
    timeAgo: '15m ago',
    type: 'comment',
    avatarUrl: 'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=100',
    thumbnailUrl: 'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?w=100',
  },
  {
    id: '3',
    username: 'TextureTalk',
    action: 'started following you',
    timeAgo: '1h ago',
    type: 'follow',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100',
    thumbnailUrl: null,
  },
  {
    id: '4',
    username: 'LocLove',
    action: 'crowned your post',
    timeAgo: '3h ago',
    type: 'crown',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=100',
  },
  {
    id: '5',
    username: 'CoilsAndCare',
    action: 'commented: "What products did you use?"',
    timeAgo: '5h ago',
    type: 'comment',
    avatarUrl: 'https://images.unsplash.com/photo-1611676930340-33c9b3977e2e?w=100',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100',
  },
  {
    id: '6',
    username: 'KinkyKingdom',
    action: 'started following you',
    timeAgo: '1d ago',
    type: 'follow',
    avatarUrl: 'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=100',
    thumbnailUrl: null,
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationRow notification={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 22,
    color: '#1A1A1A',
    textAlign: 'center',
  },
});
