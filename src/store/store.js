/**
 * @file store.js
 * @description Configures and exports the central Redux store.
 *
 * Slices registered:
 *   - user  → userSlice  (profile: name, email, phone)
 *   - ride  → rideSlice  (origin, destination, tripMetrics, selectedVehicle)
 *
 * Usage:
 *   import { store } from './store';
 *   <Provider store={store}>...</Provider>
 */
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import rideReducer from './slices/rideSlice';

// Centralized global state for user profile and active trip flow.
export const store = configureStore({
  reducer: {
    user: userReducer,
    ride: rideReducer,
  },
});
