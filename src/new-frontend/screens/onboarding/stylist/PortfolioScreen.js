import React from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import PhotoUploader from '../../../components/ui/PhotoUploader';

export default function PortfolioScreen({ navigation, route }) {
  function handleContinue() {
    navigation.navigate('StylistBio', route.params);
  }

  return (
    <OnboardingLayout
      totalSteps={14}
      currentStep={11}
      title="Show them what you can do."
      subtitle="Add at least one photo of your work. This is your first impression on CRWN."
      onContinue={handleContinue}
      onSkip={() => navigation.navigate('StylistBio', route.params)}
    >
      <PhotoUploader onPress={() => {}} caption="You can add up to 6 photos" />
    </OnboardingLayout>
  );
}
