import { View, Text, StyleSheet } from 'react-native';

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

export const HEADER_BAR_HEIGHT = 48; // paddingVertical 12 + icon 24

const styles = StyleSheet.create({
  bar: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#C0C0C0',
    backgroundColor: '#FCFCFC',
  },
  slot: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotRight: {
    justifyContent: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});
