import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { name: 'Explore',      route: 'Explore',      icon: 'compass' },
  { name: 'Community',    route: 'Community',     icon: 'share-2' },
  { name: 'Stylists',     route: 'Stylists',      icon: 'scissors' },
  { name: 'Notifications',route: 'Notifications', icon: 'bell' },
  { name: 'Profile',      route: 'Profile',       icon: 'user' },
];

export default function TabBar({ navigation, state }) {
  const insets = useSafeAreaInsets();
  const currentRoute = state?.routes[state.index]?.name;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      {TABS.map((tab) => {
        const active = currentRoute === tab.route;
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.route)}
            activeOpacity={0.7}
          >
            <Feather
              name={tab.icon}
              size={22}
              color={active ? '#1A1A1A' : '#ABABAB'}
              strokeWidth={active ? 2.5 : 1.8}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0EDED',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});
