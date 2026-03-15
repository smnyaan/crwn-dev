import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

// Comment input bar at the bottom of post detail.
export default function CommentInput({ onPost, avatarColor = '#D4C8B8' }) {
  const [text, setText] = useState('');

  function handlePost() {
    if (!text.trim()) return;
    onPost?.(text.trim());
    setText('');
  }

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]} />
      <TextInput
        style={styles.input}
        placeholder="Add a comment..."
        placeholderTextColor="#ABABAB"
        value={text}
        onChangeText={setText}
        multiline
      />
      <TouchableOpacity onPress={handlePost} disabled={!text.trim()} activeOpacity={0.7}>
        <Text style={[styles.post, !text.trim() && styles.postDisabled]}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0EDED',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#1A1A1A',
    maxHeight: 80,
  },
  post: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#5D1F1F',
  },
  postDisabled: {
    color: '#ABABAB',
  },
});
