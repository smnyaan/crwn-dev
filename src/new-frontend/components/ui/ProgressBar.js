import React from 'react';
import { View, StyleSheet } from 'react-native';

// Dashed progress bar shown at top of every onboarding screen.
// totalSteps = total dashes, currentStep = how many are filled (1-indexed).
export default function ProgressBar({ totalSteps = 12, currentStep = 1 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dash,
            i < currentStep ? styles.dashActive : styles.dashInactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  dash: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  dashActive: {
    backgroundColor: '#BF9466',
  },
  dashInactive: {
    backgroundColor: '#D9CEC3',
  },
});
