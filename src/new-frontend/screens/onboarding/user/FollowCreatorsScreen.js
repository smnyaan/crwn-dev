import React from 'react';
import { View, StyleSheet } from 'react-native';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import FollowCard from '../../../components/ui/FollowCard';

// Placeholder creator data — replace with real API data.
const CREATORS = [
  { username: 'naturalnaya', tag: '4C · Wash & Go', gradientColors: ['#C4855A', '#7A4520'] },
  { username: 'afrodiaspora', tag: '4A · Growth', gradientColors: ['#4A2511', '#2C1508'] },
  { username: 'twistqueen__', tag: '3C · Protective', gradientColors: ['#6B1A1A', '#3D0D0D'] },
  { username: 'kinkandkrown', tag: '4C · Moisture', gradientColors: ['#B35D2B', '#7A3A18'] },
  { username: 'zuri.curls', tag: '3B · Curl Care', gradientColors: ['#D4B896', '#A8886A'] },
  { username: 'sofrosyne__', tag: '4B · Big Chop', gradientColors: ['#4A3728', '#2C2018'] },
];

export default function FollowCreatorsScreen({ navigation, route }) {
  function handleContinue() {
    navigation.navigate('FollowMoreCreators', route.params);
  }

  const pairs = [];
  for (let i = 0; i < CREATORS.length; i += 2) {
    pairs.push(CREATORS.slice(i, i + 2));
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={12}
      title="Connect with creators and clients."
      subtitle="Follow people whose content and journeys align with your work."
      onContinue={handleContinue}
      onSkip={() => navigation.navigate('UserComplete', route.params)}
      continueLabel="Continue"
    >
      {pairs.map((pair, i) => (
        <View key={i} style={styles.row}>
          {pair.map((creator) => (
            <FollowCard key={creator.username} {...creator} />
          ))}
        </View>
      ))}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 0,
  },
});
