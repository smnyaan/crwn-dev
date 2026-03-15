import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Option card with a bold label and a subtitle description (hair type, porosity, etc.)
export default function DescriptiveOption({ label, description, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1,
    borderColor: '#D4C8B8',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: '#BF9466',
    backgroundColor: '#FBF6F0',
  },
  label: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 15,
    color: '#251C15',
    marginBottom: 2,
  },
  labelSelected: {
    color: '#251C15',
  },
  description: {
    fontFamily: 'Figtree-Regular',
    fontSize: 13,
    color: '#7A6E65',
    textAlign: 'center',
  },
});
