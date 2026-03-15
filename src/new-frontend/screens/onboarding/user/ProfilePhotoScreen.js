import React from 'react';
import OnboardingLayout from '../../../components/layout/OnboardingLayout';
import PhotoUploader from '../../../components/ui/PhotoUploader';

export default function ProfilePhotoScreen({ navigation, route }) {
  function handleContinue() {
    navigation.navigate('Bio', route.params);
  }

  return (
    <OnboardingLayout
      totalSteps={12}
      currentStep={11}
      title="Upload a profile photo!"
      subtitle="Put a face to your CRWN. Add a photo so the community knows who you are."
      onContinue={handleContinue}
    >
      <PhotoUploader onPress={() => {}} caption="You can add up to 6 photos" />
    </OnboardingLayout>
  );
}
