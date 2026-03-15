import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CommunityScreen from './screens/community/CommunityScreen';
import ThreadDetailScreen from './screens/community/ThreadDetailScreen';

const Stack = createStackNavigator();

export default function CommunityStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunityHome" component={CommunityScreen} />
      <Stack.Screen name="ThreadDetail" component={ThreadDetailScreen} />
    </Stack.Navigator>
  );
}
