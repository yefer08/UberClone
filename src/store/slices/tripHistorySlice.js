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
    updateTripById: (state, action) => {
      const { id, changes } = action.payload || {};
      const index = state.trips.findIndex(trip => trip.id === id);
      if (index === -1) {
        return;
      }

      state.trips[index] = {
        ...state.trips[index],
        ...changes,
      };
    },
    clearTrips: state => {
      state.trips = [];
    },
  },
});

export const { setTrips, addTrip, updateTripById, clearTrips } = tripHistorySlice.actions;
export default tripHistorySlice.reducer;
