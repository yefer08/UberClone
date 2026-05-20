import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  origin: null,
  destination: null,
  distanceText: '',
  etaText: '',
  selectedVehicle: 'Economico',
};

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    setOrigin: (state, action) => {
      state.origin = action.payload;
    },
    setDestination: (state, action) => {
      state.destination = action.payload;
    },
    setTripMetrics: (state, action) => {
      state.distanceText = action.payload.distanceText;
      state.etaText = action.payload.etaText;
    },
    setSelectedVehicle: (state, action) => {
      state.selectedVehicle = action.payload;
    },
    resetRide: state => {
      state.origin = null;
      state.destination = null;
      state.distanceText = '';
      state.etaText = '';
      state.selectedVehicle = 'Economico';
    },
  },
});

export const {
  setOrigin,
  setDestination,
  setTripMetrics,
  setSelectedVehicle,
  resetRide,
} = rideSlice.actions;

export default rideSlice.reducer;
