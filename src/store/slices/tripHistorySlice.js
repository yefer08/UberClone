import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trips: [],
};

const tripHistorySlice = createSlice({
  name: 'tripHistory',
  initialState,
  reducers: {
    setTrips: (state, action) => {
      state.trips = Array.isArray(action.payload) ? action.payload : [];
    },
    addTrip: (state, action) => {
      state.trips = [action.payload, ...state.trips].slice(0, 50);
    },
    clearTrips: state => {
      state.trips = [];
    },
  },
});

export const { setTrips, addTrip, clearTrips } = tripHistorySlice.actions;
export default tripHistorySlice.reducer;
