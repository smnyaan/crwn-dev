import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import MessagingScreen from '../screens/MessagingScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="UserProfile" component={ProfileScreen} />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ presentation: 'modal', gestureEnabled: true, gestureDirection: 'vertical' }}
      />
      <Stack.Screen
        name="Messaging"
        component={MessagingScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}