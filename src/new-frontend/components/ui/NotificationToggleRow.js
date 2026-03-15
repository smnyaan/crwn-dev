import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

// Row with emoji icon, label, description, and a toggle switch.
export default function NotificationToggleRow({ icon, label, description, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D4C8B8', true: '#7B8877' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE8E0',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  text: {
    flex: 1,
  },
  label: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#251C15',
    marginBottom: 2,
  },
  description: {
    fontFamily: 'Figtree-Regular',
    fontSize: 12,
    color: '#7A6E65',
  },
});
