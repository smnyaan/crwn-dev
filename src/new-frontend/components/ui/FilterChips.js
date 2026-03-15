import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

// Horizontal scrollable filter chip row. Used on the discover stylists screen.
export default function FilterChips({ options = [], onSelect }) {
  const [selected, setSelected] = useState(options[0] || null);

  function handlePress(opt) {
    setSelected(opt);
    onSelect?.(opt);
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, selected === opt && styles.chipSelected]}
          onPress={() => handlePress(opt)}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, selected === opt && styles.labelSelected]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#D4C8B8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: '#251C15',
    borderColor: '#251C15',
  },
  label: {
    fontFamily: 'Figtree-Medium',
    fontSize: 13,
    color: '#3D3229',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
