import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ExploreScreen from '../screens/ExploreScreen';
import CommunityScreen from '../screens/CommunityScreen';
import StylistsScreen from '../screens/StylistsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { View, Text, StyleSheet } from 'react-native';

// Add this import:
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme/themes';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Crwn.':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Community':
              iconName = focused ? 'globe' : 'globe-outline';
              break;
            case 'Stylists':
              iconName = focused ? 'cut' : 'cut-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.maroon,
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Crwn." component={ExploreScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Stylists" component={StylistsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}  // ← Direct to ProfileScreen
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}