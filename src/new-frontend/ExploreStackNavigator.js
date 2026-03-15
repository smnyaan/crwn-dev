import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ExploreScreen from './screens/explore/ExploreScreen';
import PostDetailScreen from './screens/explore/PostDetailScreen';
import MessagesScreen from './screens/messages/MessagesScreen';
import MessageThreadScreen from './screens/messages/MessageThreadScreen';

const Stack = createStackNavigator();

export default function ExploreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreHome" component={ExploreScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="MessageThread" component={MessageThreadScreen} />
    </Stack.Navigator>
  );
}
