import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Top header for the main app screens.
// variant="logo" shows the crwn. wordmark with search + DM icons.
// variant="title" shows a plain title string with optional back arrow.
export default function AppHeader({ variant = 'logo', title, onBack, onSearch, onMessages, rightAction }) {
  return (
    <View style={styles.container}>
      {variant === 'logo' ? (
        <>
          <TouchableOpacity onPress={onSearch} style={styles.iconBtn} activeOpacity={0.7}>
            <Feather name="search" size={22} color="#1A1A1A" />
          </TouchableOpacity>

          <Text style={styles.logo}>crwn.</Text>

          <TouchableOpacity onPress={onMessages} style={styles.iconBtn} activeOpacity={0.7}>
            <Feather name="message-circle" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={onBack} style={styles.iconBtn} activeOpacity={0.7}>
            {onBack ? <Feather name="arrow-left" size={22} color="#1A1A1A" /> : <View style={styles.placeholder} />}
          </TouchableOpacity>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.iconBtn}>
            {rightAction || <View style={styles.placeholder} />}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 22,
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 18,
    color: '#1A1A1A',
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 22,
    height: 22,
  },
});
