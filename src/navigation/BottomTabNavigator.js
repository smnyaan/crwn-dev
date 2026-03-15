import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import ExploreStackNavigator from '../new-frontend/ExploreStackNavigator';
import CommunityStackNavigator from '../new-frontend/CommunityStackNavigator';
import StylistsStackNavigator from '../new-frontend/StylistsStackNavigator';
import NotificationsStackNavigator from '../new-frontend/NotificationsStackNavigator';
import ProfileStackNavigator from '../new-frontend/ProfileStackNavigator';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Explore',       component: ExploreStackNavigator,       icon: 'compass'   },
  { name: 'Community',     component: CommunityStackNavigator,     icon: 'share-2'   },
  { name: 'Stylists',      component: StylistsStackNavigator,      icon: 'scissors'  },
  { name: 'Notifications', component: NotificationsStackNavigator, icon: 'bell'      },
  { name: 'Profile',       component: ProfileStackNavigator,       icon: 'user'      },
];

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#F5A42A',
        tabBarInactiveTintColor: '#ABABAB',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 72,
          paddingBottom: 12,
          paddingTop: 12,
          position: 'absolute',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 16,
        },
        tabBarIcon: ({ color }) => {
          const tab = TABS.find((t) => t.name === route.name);
          return <Feather name={tab?.icon} size={22} color={color} />;
        },
      })}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}
