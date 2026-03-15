import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { colors } from './src/theme/themes';

// =============================================================================
// APP CONTENT — reads auth state from AuthProvider
// =============================================================================

function AppContent() {
  // DEV: force straight to main app to test new screens — remove when done
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );

  const { user, loading } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState(null); // null = still checking

  useEffect(() => {
    AsyncStorage.getItem('onboarded').then(val => setHasOnboarded(val === 'true'));
  }, []);

  // Wait for both the Supabase session check and AsyncStorage to finish
  if (loading || hasOnboarded === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.honey} />
      </View>
    );
  }

  // No active session
  if (!user) {
    if (hasOnboarded) {
      // Returning user whose session expired — show sign-in
      return <AuthScreen onBack={() => setHasOnboarded(false)} />;
    }
    // Brand-new user — show onboarding
    return (
      <OnboardingScreen
        onDone={() => AsyncStorage.setItem('onboarded', 'true')}
        onSignIn={() => setHasOnboarded(true)}
      />
    );
  }

  // Active session — show the main app
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

// =============================================================================
// ROOT — AuthProvider wraps everything so every screen can call useAuth()
// =============================================================================

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF9F0',
  },
});
