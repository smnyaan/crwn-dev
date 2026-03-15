import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Shared
import SplashScreen from './screens/onboarding/SplashScreen';
import RoleSelectScreen from './screens/onboarding/RoleSelectScreen';
import PhoneScreen from './screens/onboarding/PhoneScreen';
import VerifyCodeScreen from './screens/onboarding/VerifyCodeScreen';

// User flow
import UserNameScreen from './screens/onboarding/user/NameScreen';
import UserUsernameScreen from './screens/onboarding/user/UsernameScreen';
import UsageGoalsScreen from './screens/onboarding/user/UsageGoalsScreen';
import HairTypeScreen from './screens/onboarding/user/HairTypeScreen';
import HairPorosityScreen from './screens/onboarding/user/HairPorosityScreen';
import HairJourneyScreen from './screens/onboarding/user/HairJourneyScreen';
import HairChallengesScreen from './screens/onboarding/user/HairChallengesScreen';
import HairGoalScreen from './screens/onboarding/user/HairGoalScreen';
import StylesScreen from './screens/onboarding/user/StylesScreen';
import ProfilePhotoScreen from './screens/onboarding/user/ProfilePhotoScreen';
import UserBioScreen from './screens/onboarding/user/BioScreen';
import LocationScreen from './screens/onboarding/user/LocationScreen';
import UserNotificationsScreen from './screens/onboarding/user/NotificationsScreen';
import FollowCreatorsScreen from './screens/onboarding/user/FollowCreatorsScreen';
import FollowMoreCreatorsScreen from './screens/onboarding/user/FollowMoreCreatorsScreen';
import UserCompleteScreen from './screens/onboarding/user/UserCompleteScreen';

// Stylist flow
import StylistNameScreen from './screens/onboarding/stylist/NameScreen';
import StylistUsernameScreen from './screens/onboarding/stylist/UsernameScreen';
import BusinessNameScreen from './screens/onboarding/stylist/BusinessNameScreen';
import WorkLocationScreen from './screens/onboarding/stylist/WorkLocationScreen';
import WorkStyleScreen from './screens/onboarding/stylist/WorkStyleScreen';
import ClientAvailabilityScreen from './screens/onboarding/stylist/ClientAvailabilityScreen';
import ExperienceLevelScreen from './screens/onboarding/stylist/ExperienceLevelScreen';
import SpecialtiesScreen from './screens/onboarding/stylist/SpecialtiesScreen';
import BookingLinkScreen from './screens/onboarding/stylist/BookingLinkScreen';
import PortfolioScreen from './screens/onboarding/stylist/PortfolioScreen';
import StylistBioScreen from './screens/onboarding/stylist/BioScreen';
import StylistNotificationsScreen from './screens/onboarding/stylist/NotificationsScreen';
import DiscoverStylistsScreen from './screens/onboarding/stylist/DiscoverStylistsScreen';
import StylistCompleteScreen from './screens/onboarding/stylist/StylistCompleteScreen';

const Stack = createStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      {/* Shared */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Phone" component={PhoneScreen} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />

      {/* User flow */}
      <Stack.Screen name="UserName" component={UserNameScreen} />
      <Stack.Screen name="Username" component={UserUsernameScreen} />
      <Stack.Screen name="UsageGoals" component={UsageGoalsScreen} />
      <Stack.Screen name="HairType" component={HairTypeScreen} />
      <Stack.Screen name="HairPorosity" component={HairPorosityScreen} />
      <Stack.Screen name="HairJourney" component={HairJourneyScreen} />
      <Stack.Screen name="HairChallenges" component={HairChallengesScreen} />
      <Stack.Screen name="HairGoal" component={HairGoalScreen} />
      <Stack.Screen name="Styles" component={StylesScreen} />
      <Stack.Screen name="ProfilePhoto" component={ProfilePhotoScreen} />
      <Stack.Screen name="Bio" component={UserBioScreen} />
      <Stack.Screen name="Location" component={LocationScreen} />
      <Stack.Screen name="Notifications" component={UserNotificationsScreen} />
      <Stack.Screen name="FollowCreators" component={FollowCreatorsScreen} />
      <Stack.Screen name="FollowMoreCreators" component={FollowMoreCreatorsScreen} />
      <Stack.Screen name="UserComplete" component={UserCompleteScreen} />

      {/* Stylist flow */}
      <Stack.Screen name="StylistName" component={StylistNameScreen} />
      <Stack.Screen name="StylistUsername" component={StylistUsernameScreen} />
      <Stack.Screen name="BusinessName" component={BusinessNameScreen} />
      <Stack.Screen name="WorkLocation" component={WorkLocationScreen} />
      <Stack.Screen name="WorkStyle" component={WorkStyleScreen} />
      <Stack.Screen name="ClientAvailability" component={ClientAvailabilityScreen} />
      <Stack.Screen name="ExperienceLevel" component={ExperienceLevelScreen} />
      <Stack.Screen name="Specialties" component={SpecialtiesScreen} />
      <Stack.Screen name="BookingLink" component={BookingLinkScreen} />
      <Stack.Screen name="Portfolio" component={PortfolioScreen} />
      <Stack.Screen name="StylistBio" component={StylistBioScreen} />
      <Stack.Screen name="StylistNotifications" component={StylistNotificationsScreen} />
      <Stack.Screen name="DiscoverStylists" component={DiscoverStylistsScreen} />
      <Stack.Screen name="StylistComplete" component={StylistCompleteScreen} />
    </Stack.Navigator>
  );
}
