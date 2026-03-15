import React, { useState } from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import SelectOption from '../../../components/ui/SelectOption';

const OPTIONS = [
  "I'm just starting out",
  "I'm transitioning from relaxed to natural",
  "I'm in my big chop era",
  "I've been natural for a while",
  "I'm exploring protective styles",
  "I'm focused on growth & retention",
];

export default function HairJourneyScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);

  function handleContinue() {
    navigation.navigate('HairChallenges', { ...route.params, hairJourney: selected });
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={7}
      title="Where are you on your journey?"
      subtitle="No two hair stories are the same. Tell us where yours is right now."
      onContinue={handleContinue}
      continueDisabled={!selected}
    >
      {OPTIONS.map((opt) => (
        <SelectOption
          key={opt}
          label={opt}
          selected={selected === opt}
          onPress={() => setSelected(opt)}
        />
      ))}
    </OnboardingLayout>
  );
}
