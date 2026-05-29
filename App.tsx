import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './src/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/store/store';
import { setUserProfile } from './src/store/slices/userSlice';
import { loadUserProfileFromStorage } from './src/utils/userProfileStorage';

function App() {
  useEffect(() => {
    let isMounted = true;

    const hydrateUserProfile = async () => {
      const profile = await loadUserProfileFromStorage();
      if (isMounted && profile) {
        store.dispatch(setUserProfile(profile));
      }
    };

    hydrateUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
