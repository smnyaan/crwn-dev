import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import DescriptiveOption from '../../../components/ui/DescriptiveOption';

const POROSITY = [
  { id: 'low', label: 'Low Porosity', description: 'moisture sits on top, slow to absorb' },
  { id: 'medium', label: 'Medium Porosity', description: 'absorbs and retains moisture well' },
  { id: 'high', label: 'High Porosity', description: 'absorbs quickly, loses moisture fast' },
];

export default function HairPorosityScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);

  function handleContinue() {
    navigation.navigate('HairJourney', { ...route.params, hairPorosity: selected });
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={6}
      title="Do you know your hair porosity?"
      subtitle="This helps us surface the most relevant products and tips for you."
      onContinue={handleContinue}
      continueDisabled={!selected}
    >
      {POROSITY.map((opt) => (
        <DescriptiveOption
          key={opt.id}
          label={opt.label}
          description={opt.description}
          selected={selected === opt.id}
          onPress={() => setSelected(opt.id)}
        />
      ))}
      <TouchableOpacity
        style={styles.unsure}
        onPress={() => navigation.navigate('HairJourney', { ...route.params, hairPorosity: null })}
      >
        <Text style={styles.unsureText}>I'm not sure yet</Text>
      </TouchableOpacity>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  unsure: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  unsureText: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#7A6E65',
    fontStyle: 'italic',
  },
});
