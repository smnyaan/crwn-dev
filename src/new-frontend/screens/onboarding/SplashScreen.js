import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
  // Auto-advance after 2s
  React.useEffect(() => {
    const t = setTimeout(() => navigation.replace('RoleSelect'), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient
      colors={['#E8D5C4', '#C4855A', '#8B4513']}
      style={styles.container}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>cr<Text style={styles.crown}>♛</Text>n</Text>
        <Text style={styles.tagline}>every crown tells a story.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: 52,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  crown: {
    fontSize: 36,
  },
  tagline: {
    fontFamily: 'Figtree-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
