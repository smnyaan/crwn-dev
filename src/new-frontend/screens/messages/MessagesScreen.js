import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AppHeader from '../../components/ui/AppHeader';
import MessageRow from '../../components/ui/MessageRow';

// Placeholder conversations — replace with real Supabase data.
const CONVERSATIONS = [
  { id: '1', username: 'CurlyCrown',    lastMessage: 'This would be so cute on you!', timestamp: '5m',  unread: true,  avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100' },
  { id: '2', username: 'NaturalNectar', lastMessage: 'You should try this style next!', timestamp: '2h', unread: false, avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100' },
  { id: '3', username: 'LocLove',       lastMessage: "I think you'd rock this color!", timestamp: '1d', unread: false, avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' },
  { id: '4', username: 'TextureTalk',   lastMessage: 'Perfect for your hair type!',   timestamp: '2d', unread: false, avatarUrl: 'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=100' },
  { id: '5', username: 'BraidBeauty',   lastMessage: 'Thanks for the recommendation!', timestamp: '3d', unread: false, avatarUrl: 'https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=100' },
];

export default function MessagesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="title"
        title="Messages"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
            <Feather name="plus" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={CONVERSATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageRow
            conversation={item}
            onPress={() => navigation.navigate('MessageThread', { conversation: item })}
          />
        )}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
});
