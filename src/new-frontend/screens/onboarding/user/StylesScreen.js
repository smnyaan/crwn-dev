import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import StyleGridItem from '../../../components/ui/StyleGridItem';

const STYLES = [
  'Wash & Gos',
  'Twist Outs',
  'Wigs',
  'Braids',
  'Finger Coils',
  'Color + Highlights',
];

export default function StylesScreen({ navigation, route }) {
  const [selected, setSelected] = useState([]);

  function toggle(style) {
    setSelected((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  }

  function handleContinue() {
    navigation.navigate('ProfilePhoto', { ...route.params, styles: selected });
  }

  // Build pairs for 2-col grid
  const pairs = [];
  for (let i = 0; i < STYLES.length; i += 2) {
    pairs.push(STYLES.slice(i, i + 2));
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={10}
      title="What styles speak to you?"
      subtitle="Choose the looks that inspire your hair journey."
      onContinue={handleContinue}
      continueDisabled={selected.length === 0}
    >
      {pairs.map((pair, i) => (
        <View key={i} style={styles.row}>
          {pair.map((style) => (
            <StyleGridItem
              key={style}
              label={style}
              selected={selected.includes(style)}
              onPress={() => toggle(style)}
            />
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
  },
});
