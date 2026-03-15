import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import NotificationsScreen from './screens/notifications/NotificationsScreen';

const Stack = createStackNavigator();

export default function NotificationsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotificationsHome" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
