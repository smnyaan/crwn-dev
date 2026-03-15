import React from 'react';
import { View, StyleSheet } from 'react-native';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import FilterChips from '../../../components/ui/FilterChips';
import FollowCard from '../../../components/ui/FollowCard';

const FILTERS = ['All', 'Near Me', 'Locs', 'Braids', 'Natural'];

const STYLISTS = [
  { username: 'naturalnaya', tag: 'Locs · Natural', gradientColors: ['#2D4A2D', '#1A2E1A'], isStylist: true },
  { username: 'afrodiaspora', tag: 'Silk Press · Color', gradientColors: ['#4A2511', '#2C1508'], isStylist: true },
  { username: 'twistqueen__', tag: 'Braids · Twists', gradientColors: ['#6B1A1A', '#3D0D0D'], isStylist: true },
  { username: 'kinkandkrown', tag: 'Wash & Go · Natural', gradientColors: ['#7A5C3A', '#4A3520'], isStylist: true },
  { username: 'zuri.curls', tag: '3B · Curl Care', gradientColors: ['#D4B896', '#A8886A'], isStylist: true },
  { username: 'sofrosyne__', tag: '4B · Big Chop', gradientColors: ['#4A3728', '#2C2018'], isStylist: true },
];

export default function DiscoverStylistsScreen({ navigation, route }) {
  function handleContinue() {
    navigation.navigate('StylistComplete', route.params);
  }

  const pairs = [];
  for (let i = 0; i < STYLISTS.length; i += 2) {
    pairs.push(STYLISTS.slice(i, i + 2));
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={14}
      title="Discover talented stylists!"
      subtitle="Follow stylists to keep their work in your feed."
      onContinue={handleContinue}
      onSkip={() => navigation.navigate('StylistComplete', route.params)}
    >
      <FilterChips options={FILTERS} />
      <View style={styles.grid}>
        {pairs.map((pair, i) => (
          <View key={i} style={styles.row}>
            {pair.map((stylist) => (
              <FollowCard key={stylist.username} {...stylist} />
            ))}
          </View>
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
});
