import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function MessagingScreen() {
  const navigation = useNavigation();
  const [activeConvo, setActiveConvo] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [conversations] = useState([]);

  if (activeConvo) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Chat header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setActiveConvo(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{activeConvo.name}</Text>
            <Text style={styles.chatHeaderStatus}>Active now</Text>
          </View>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="information-circle-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Messages area */}
        <View style={styles.messagesArea}>
          <Text style={styles.emptyChat}>No messages yet. Say hi!</Text>
        </View>

        {/* Input */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Message..."
              placeholderTextColor="#9ca3af"
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
              disabled={!messageText.trim()}
            >
              <Ionicons name="send" size={20} color={messageText.trim() ? '#fff' : '#d1d5db'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="create-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="chatbubble-ellipses-outline" size={52} color="#d1d5db" />
          </View>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation with someone in the community.
          </Text>
          <TouchableOpacity style={styles.newMsgBtn} onPress={() => {}}>
            <Text style={styles.newMsgBtnText}>New Message</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.convoRow} onPress={() => setActiveConvo(item)}>
              <View style={styles.convoAvatar}>
                <Text style={styles.convoAvatarInitial}>{item.name[0]}</Text>
              </View>
              <View style={styles.convoInfo}>
                <Text style={styles.convoName}>{item.name}</Text>
                <Text style={styles.convoPreview} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              <Text style={styles.convoTime}>{item.time}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  newMsgBtn: {
    backgroundColor: '#5D1F1F',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  newMsgBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  convoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  convoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5D1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  convoAvatarInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  convoInfo: { flex: 1 },
  convoName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  convoPreview: {
    fontSize: 13,
    color: '#9ca3af',
  },
  convoTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  // Chat view
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  chatHeaderInfo: { flex: 1 },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: '#22c55e',
  },
  messagesArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChat: {
    fontSize: 14,
    color: '#9ca3af',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#5D1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#f3f4f6',
  },
});
