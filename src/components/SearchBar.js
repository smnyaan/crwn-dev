import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ value = '', onChangeText }) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#666" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search for hair salons, inspos, etc."
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText?.('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 10,
    borderRadius: 10
  },
  icon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 16
  }
});