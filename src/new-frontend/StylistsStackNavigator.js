import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import StylistsScreen from './screens/stylists/StylistsScreen';
import StylistProfileScreen from './screens/stylists/StylistProfileScreen';

const Stack = createStackNavigator();

export default function StylistsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StylistsHome" component={StylistsScreen} />
      <Stack.Screen name="StylistProfile" component={StylistProfileScreen} />
    </Stack.Navigator>
  );
}
