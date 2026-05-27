/**
 * @file AppNavigator.js
 * @description Root navigation structure of the app.
 * Uses a Native Stack Navigator which provides native iOS/Android transitions.
 *
 * Screens registered:
 *   - Home         → HomeScreen        (destination search + trip start)
 *   - RideOptions  → RideOptionsScreen  (vehicle selection + fare estimate)
 *   - Profile      → ProfileScreen      (user profile form)
 *   - TripHistory  → TripHistoryScreen  (list of previous trips)
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import HomeScreen from '../screens/HomeScreen';
import RideOptionsScreen from '../screens/RideOptionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: '⌂',
  Profile: '◉',
  TripHistory: '☰',
};

function TabIcon({ icon, focused, color }) {
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused, { color }]}>
      {icon}
    </Text>
  );
}

function HomeTabIcon(props) {
  return <TabIcon {...props} icon={TAB_ICONS.Home} />;
}

function ProfileTabIcon(props) {
  return <TabIcon {...props} icon={TAB_ICONS.Profile} />;
}

function TripHistoryTabIcon(props) {
  return <TabIcon {...props} icon={TAB_ICONS.TripHistory} />;
}

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#6B7280',
        tabBarActiveBackgroundColor: '#EEF2FF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: 2,
        },
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          backgroundColor: '#FFFFFF',
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 6,
          marginVertical: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('navigation.home'),
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ProfileTabIcon,
        }}
      />
      <Tab.Screen
        name="TripHistory"
        component={TripHistoryScreen}
        options={{
          title: t('navigation.tripHistory'),
          tabBarIcon: TripHistoryTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}

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
        initialRouteName="MainTabs"
        screenOptions={{
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RideOptions"
          component={RideOptionsScreen}
          options={{ title: t('navigation.rideOptions') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  tabIconFocused: {
    fontSize: 18,
    fontWeight: '800',
  },
});

export default AppNavigator;
