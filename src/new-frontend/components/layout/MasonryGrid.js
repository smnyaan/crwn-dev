import React from 'react';
import { View, StyleSheet } from 'react-native';

// Splits items into two columns for a Pinterest-style staggered grid.
// Pass a renderItem function that receives ({ item, index }).
// Heights should vary per item — pass a getImageHeight prop or let renderItem handle it.
export default function MasonryGrid({ items = [], renderItem, columnGap = 8 }) {
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 !== 0);

  return (
    <View style={[styles.row, { gap: columnGap }]}>
      <View style={styles.column}>
        {left.map((item, i) => renderItem({ item, index: i * 2 }))}
      </View>
      <View style={styles.column}>
        {right.map((item, i) => renderItem({ item, index: i * 2 + 1 }))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  column: {
    flex: 1,
  },
});
