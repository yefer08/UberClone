/**
 * @file userSlice.js
 * @description Redux slice that manages the authenticated user's profile.
 *
 * State shape:
 * @typedef {object} UserState
 * @property {string} name   - Full name (max 50 chars).
 * @property {string} email  - Email address.
 * @property {string} phone  - Numeric phone number.
 *
 * Actions exported:
 *   setUserProfile({ name, email, phone }) → persists validated profile data
 *   clearUserProfile()                     → resets all fields (e.g. on logout)
 *
 * TODO: Add `gender` field once the ProfileScreen dropdown is implemented.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  email: '',
  phone: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
    },
    clearUserProfile: state => {
      state.name = '';
      state.email = '';
      state.phone = '';
    },
  },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
