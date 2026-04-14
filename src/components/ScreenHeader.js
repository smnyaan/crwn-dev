import { View, Text, StyleSheet } from 'react-native';
import { s, fs } from '../utils/responsive';

/**
 * Shared top header bar — no SafeAreaView, the parent screen owns that.
 * Pass `left`, `title`, and `right` slots to customise per-screen.
 */
export default function ScreenHeader({ left, title, right }) {
  return (
    <View style={styles.bar}>
      <View style={styles.slot}>{left ?? null}</View>
      <Text style={styles.title}>{title}</Text>
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
    borderBottomColor: '#C0C0C0',
    backgroundColor: '#FCFCFC',
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
    color: '#111827',
  },
});
