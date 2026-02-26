import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="UserProfile" component={ProfileScreen} 
        // name="UserProfile" 
        // component={UserProfileScreen}
        // options={{
        //   presentation: 'card',
        // }}
      />
    </Stack.Navigator>
  );
}