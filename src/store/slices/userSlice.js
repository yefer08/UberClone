/**
 * @file userSlice.js
 * @description Redux slice that manages the authenticated user's profile.
 *
 * State shape:
 * @typedef {object} UserState
 * @property {string} name   - Full name (max 50 chars).
 * @property {string} email  - Email address.
 * @property {string} phone  - Numeric phone number.
 * @property {'male' | 'female' | 'other' | ''} gender - Selected gender value.
 *
 * Actions exported:
 *   setUserProfile({ name, email, phone, gender }) → persists validated profile data
 *   clearUserProfile()                     → resets all fields (e.g. on logout)
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  photo: '',
  name: '',
  email: '',
  phone: '',
  gender: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.photo = action.payload.photo;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.phone = action.payload.phone;
      state.gender = action.payload.gender;
    },
    clearUserProfile: state => {
      state.photo = '';
      state.name = '';
      state.email = '';
      state.phone = '';
      state.gender = '';
    },
  },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
