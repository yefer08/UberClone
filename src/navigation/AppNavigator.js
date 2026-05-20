import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RideOptionsScreen from '../screens/RideOptionsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Uber Clone' }} />
        <Stack.Screen name="RideOptions" component={RideOptionsScreen} options={{ title: 'Ride Options' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
