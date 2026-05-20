/**
 * @file AppNavigator.js
 * @description Root navigation structure of the app.
 * Uses a Native Stack Navigator which provides native iOS/Android transitions.
 *
 * Screens registered:
 *   - Home         → HomeScreen        (destination search + trip start)
 *   - RideOptions  → RideOptionsScreen  (vehicle selection + fare estimate)
 *   - Profile      → ProfileScreen      (user profile form)
 *
 * TODO: Extend with a Tab Navigator once Trip History and Payments are added.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/HomeScreen';
import RideOptionsScreen from '../screens/RideOptionsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator component.
 * Wraps the entire app in a NavigationContainer and declares the
 * screen stack. Rendered once at the root level inside App.tsx.
 */
function AppNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('navigation.home') }} />
        <Stack.Screen
          name="RideOptions"
          component={RideOptionsScreen}
          options={{ title: t('navigation.rideOptions') }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: t('navigation.profile') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
