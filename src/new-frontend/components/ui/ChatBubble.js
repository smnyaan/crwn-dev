import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Single chat bubble. isMine=true renders on the right in dark maroon.
export default function ChatBubble({ text, timestamp, isMine }) {
  return (
    <View style={[styles.wrapper, isMine && styles.wrapperMine]}>
      <View style={[styles.bubble, isMine && styles.bubbleMine]}>
        <Text style={[styles.text, isMine && styles.textMine]}>{text}</Text>
      </View>
      <Text style={[styles.time, isMine && styles.timeMine]}>{timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    maxWidth: '75%',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  wrapperMine: {
    alignSelf: 'flex-end',
  },
  bubble: {
    backgroundColor: '#F0EDED',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: '#5D1F1F',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  text: {
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  textMine: {
    color: '#FFFFFF',
  },
  time: {
    fontFamily: 'Figtree-Regular',
    fontSize: 11,
    color: '#ABABAB',
    marginTop: 4,
    marginLeft: 4,
  },
  timeMine: {
    textAlign: 'right',
    marginRight: 4,
  },
});
