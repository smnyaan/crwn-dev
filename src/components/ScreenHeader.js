import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Shared top header used by Explore, Community, Stylists, and Notifications.
 * Pass `left`, `title`, and `right` slots to customise per-screen.
 */
export default function ScreenHeader({ left, title, right }) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.bar}>
        <View style={styles.slot}>{left ?? null}</View>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.slot, styles.slotRight]}>{right ?? null}</View>
      </View>
    </SafeAreaView>
  );
}

export const HEADER_BAR_HEIGHT = 48; // paddingVertical 12 + icon 24

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#FCFCFC',
  },
  bar: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
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
    fontSize: 22,
    fontFamily: 'LibreBaskerville_700Bold',
    color: '#111827',
  },
});
