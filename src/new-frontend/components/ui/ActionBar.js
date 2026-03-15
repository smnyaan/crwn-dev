import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Crown count, comment count, share, and save button row on post detail.
export default function ActionBar({ crownCount = 0, commentCount = 0, onComment, onShare, onSave, saved: savedProp = false }) {
  const [crowned, setCrowned] = useState(false);
  const [saved, setSaved] = useState(savedProp);
  const [count, setCount] = useState(crownCount);

  function handleCrown() {
    setCrowned((c) => !c);
    setCount((n) => (crowned ? n - 1 : n + 1));
  }

  function handleSave() {
    setSaved((s) => !s);
    onSave?.(!saved);
  }

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <TouchableOpacity style={styles.action} onPress={handleCrown} activeOpacity={0.7}>
          <Feather name="award" size={20} color={crowned ? '#F5A42A' : '#5E5E5E'} />
          <Text style={[styles.count, crowned && styles.countActive]}>{count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={onComment} activeOpacity={0.7}>
          <Feather name="message-circle" size={20} color="#5E5E5E" />
          <Text style={styles.count}>{commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={onShare} activeOpacity={0.7}>
          <Feather name="send" size={20} color="#5E5E5E" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saved && styles.saveBtnActive]}
        onPress={handleSave}
        activeOpacity={0.85}
      >
        <Text style={[styles.saveLabel, saved && styles.saveLabelActive]}>
          {saved ? 'Saved' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  left: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  count: {
    fontFamily: 'Figtree-Medium',
    fontSize: 14,
    color: '#5E5E5E',
  },
  countActive: {
    color: '#F5A42A',
  },
  saveBtn: {
    borderWidth: 1.5,
    borderColor: '#5D1F1F',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  saveBtnActive: {
    backgroundColor: '#5D1F1F',
  },
  saveLabel: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#5D1F1F',
  },
  saveLabelActive: {
    color: '#FFFFFF',
  },
});
