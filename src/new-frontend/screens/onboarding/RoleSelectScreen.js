import React, { useState } from 'react';
import OnboardingLayout from '../../components/layout/OnboardingLayout';
import RoleCard from '../../components/ui/RoleCard';

const ROLES = [
  {
    id: 'user',
    title: "I'm here for my hair!",
    description: 'Discover styles, find products, and document your journey.',
  },
  {
    id: 'stylist',
    title: "I'm a stylist or hair professional!",
    description: 'Showcase your work, grow your clientele, and connect with the community.',
  },
];

export default function RoleSelectScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  function handleContinue() {
    if (!selected) return;
    if (selected === 'user') {
      navigation.navigate('Email');
    } else {
      navigation.navigate('Email', { role: 'stylist' });
    }
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={1}
      title="What brings you to CRWN?"
      subtitle="Choose the experience that's made for you."
      onContinue={handleContinue}
      continueDisabled={!selected}
    >
      {ROLES.map((role) => (
        <RoleCard
          key={role.id}
          title={role.title}
          description={role.description}
          selected={selected === role.id}
          onPress={() => setSelected(role.id)}
        />
      ))}
    </OnboardingLayout>
  );
}
