import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function PrimaryButton({ title, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (c) => StyleSheet.create({
  button: {
    backgroundColor: c.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  text: {
    color: '#fff',
    fontFamily: 'Figtree_600SemiBold'
  }
});
