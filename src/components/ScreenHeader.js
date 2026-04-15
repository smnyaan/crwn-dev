import { View, Text, StyleSheet } from 'react-native';
import { s, fs } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';

export default function ScreenHeader({ left, title, right }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: colors.surface, borderBottomColor: colors.hairline }]}>
      <View style={styles.slot}>{left ?? null}</View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={[styles.slot, styles.slotRight]}>{right ?? null}</View>
    </View>
  );
}

export const HEADER_BAR_HEIGHT = s(48);

const styles = StyleSheet.create({
  bar: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  slot: {
    width: s(72),
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotRight: {
    justifyContent: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fs(18),
    fontFamily: 'Figtree_700Bold',
  },
});
