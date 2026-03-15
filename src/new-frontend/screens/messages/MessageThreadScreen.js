import React, { useState, useRef } from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AppHeader from '../../components/ui/AppHeader';
import ChatBubble from '../../components/ui/ChatBubble';

// Placeholder messages — replace with real Supabase realtime data.
const PLACEHOLDER_MESSAGES = [
  { id: '1', text: 'Hey! I saw your post about the twist-out 😍', timestamp: '10:32 AM', isMine: false },
  { id: '2', text: 'Thanks! It took me a while to get it right',   timestamp: '10:35 AM', isMine: true  },
  { id: '3', text: 'What products did you use?',                   timestamp: '10:36 AM', isMine: false },
  { id: '4', text: 'Shea Moisture Curl Enhancing Smoothie and some eco styler', timestamp: '10:38 AM', isMine: true },
  { id: '5', text: 'This would be so cute on you!',                timestamp: '10:40 AM', isMine: false },
];

export default function MessageThreadScreen({ navigation, route }) {
  const { conversation } = route.params;
  const [messages, setMessages] = useState(PLACEHOLDER_MESSAGES);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  function handleSend() {
    if (!input.trim()) return;
    const msg = {
      id: Date.now().toString(),
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };
    setMessages((m) => [...m, msg]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        variant="title"
        title={conversation.username}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble {...item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor="#ABABAB"
            value={input}
            onChangeText={setInput}
            multiline
            maxHeight={100}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Feather name="send" size={18} color={input.trim() ? '#FFFFFF' : '#ABABAB'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  messageList: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0EDED',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    color: '#1A1A1A',
    paddingVertical: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5D1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#F0EDED',
  },
});
