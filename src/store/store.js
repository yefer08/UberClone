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
