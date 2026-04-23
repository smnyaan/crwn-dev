import { useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import ExploreScreen from '../screens/ExploreScreen';
import CommunityScreen from '../screens/CommunityScreen';
import StylistsScreen from '../screens/StylistsScreen';
import StylistDashboardScreen from '../screens/StylistDashboardScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useUnreadCount } from '../context/UnreadCountContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

const Tab = createBottomTabNavigator();

// How quickly two taps must occur to count as a double-tap (ms)
const DOUBLE_TAP_MS = 400;

function NotifIcon({ focused, color, size, unreadCount, primaryColor }) {
  return (
    <View>
      <Ionicons
        name={focused ? 'notifications' : 'notifications-outline'}
        size={size}
        color={color}
      />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: primaryColor }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function BottomTabNavigator() {
  const { notifCount: unreadNotifCount } = useUnreadCount();
  const { colors } = useTheme();
  const { profile, profileLoaded } = useAuth();
  const isStylist = !!profile?.is_stylist;

  // Each tab gets an incrementing key — changing it forces a full remount (reset)
  const [resetKeys, setResetKeys] = useState({
    'Crwn.': 0, Community: 0, Stylists: 0, Notifications: 0, Profile: 0,
  });

  // Last tap timestamp per tab name
  const lastTap = useRef({});

  const screenListeners = ({ route }) => ({
    tabPress: () => {
      const now = Date.now();
      const prev = lastTap.current[route.name] ?? 0;

      if (prev && now - prev < DOUBLE_TAP_MS) {
        // Double-tap: reset this tab's screen to its initial state
        lastTap.current[route.name] = 0; // prevent triple-tap triggering again
        setResetKeys((k) => ({ ...k, [route.name]: k[route.name] + 1 }));
      } else {
        lastTap.current[route.name] = now;
      }
    },
  });

  return (
    <Tab.Navigator
      screenListeners={screenListeners}
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Notifications') {
            return (
              <NotifIcon
                focused={focused}
                color={color}
                size={size}
                unreadCount={unreadNotifCount}
                primaryColor={colors.primary}
              />
            );
          }

          let iconName;
          switch (route.name) {
            case 'Crwn.':      iconName = focused ? 'compass'       : 'compass-outline';       break;
            case 'Community':  iconName = focused ? 'globe'         : 'globe-outline';         break;
            case 'Stylists':   iconName = focused ? 'cut'           : 'cut-outline';           break;
            case 'Profile':    iconName = focused ? 'person'        : 'person-outline';        break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.selected,
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Crwn." options={{ headerShown: false }}>
        {(props) => <ExploreScreen {...props} key={resetKeys['Crwn.']} />}
      </Tab.Screen>

      <Tab.Screen name="Community" options={{ headerShown: false }}>
        {(props) => <CommunityScreen {...props} key={resetKeys.Community} />}
      </Tab.Screen>

      <Tab.Screen name="Stylists" options={{ headerShown: false }}>
        {(props) => !profileLoaded
          ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} /></View>
          : isStylist
            ? <StylistDashboardScreen {...props} key={resetKeys.Stylists} />
            : <StylistsScreen {...props} key={resetKeys.Stylists} />}
      </Tab.Screen>

      <Tab.Screen name="Notifications" options={{ headerShown: false }}>
        {(props) => <NotificationsScreen {...props} key={resetKeys.Notifications} />}
      </Tab.Screen>

      <Tab.Screen name="Profile" options={{ headerShown: false }}>
        {(props) => <ProfileScreen {...props} key={resetKeys.Profile} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Figtree_700Bold',
    lineHeight: 12,
  },
});
