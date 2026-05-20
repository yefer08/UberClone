/**
 * @file rideSlice.js
 * @description Redux slice that manages the active trip state.
 *
 * State shape:
 * @typedef {object} RideState
 * @property {{ lat: number, lng: number } | null} origin       - GPS coordinates of the pickup point.
 * @property {{ lat: number, lng: number } | null} destination  - Coordinates resolved from Place Details.
 * @property {Array<{ latitude: number, longitude: number }>} routeCoords - Decoded route polyline points.
 * @property {string} distanceText   - Human-readable distance (e.g. '5.7 km').
 * @property {string} etaText        - Human-readable duration (e.g. '18 mins').
 * @property {string} selectedVehicle - Active vehicle tier ('Economico' | 'XL' | 'Premium').
 *
 * Actions exported:
 *   setOrigin(coords)         → stores the pickup coordinates
 *   setDestination(coords)    → stores the destination coordinates
 *   setRouteCoords(coords)    → stores decoded map route points
 *   setTripMetrics({distanceText, etaText}) → stores Distance Matrix result
 *   setSelectedVehicle(tier)  → updates the chosen vehicle category
 *   resetRide()               → clears all trip data (e.g. after trip completes)
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  origin: null,
  destination: null,
  routeCoords: [],
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
    setRouteCoords: (state, action) => {
      state.routeCoords = action.payload;
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
      state.routeCoords = [];
      state.distanceText = '';
      state.etaText = '';
      state.selectedVehicle = 'Economico';
    },
  },
});

export const {
  setOrigin,
  setDestination,
  setRouteCoords,
  setTripMetrics,
  setSelectedVehicle,
  resetRide,
} = rideSlice.actions;

export default rideSlice.reducer;
