/**
 * @file RideOptionsScreen.js
 * @description Displays the available vehicle categories for the current trip.
 * Shows the distance and ETA calculated by the Distance Matrix API (stored in
 * Redux), and lets the user pick a vehicle tier before confirming the ride.
 *
 * Vehicle tiers and mock fares:
 *   - Economico → $95.00
 *   - XL        → $140.00
 *   - Premium   → $220.00
 *
 * TODO: Replace mock fares with a real pricing algorithm based on distance.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setSelectedVehicle } from '../store/slices/rideSlice';

/** Available vehicle categories. Order determines display order on screen. */
const VEHICLES = ['Economico', 'XL', 'Premium'];

const VEHICLE_TRANSLATION_KEYS = {
  Economico: 'rideOptions.economico',
  XL: 'rideOptions.xl',
  Premium: 'rideOptions.premium',
};

/**
 * RideOptionsScreen component.
 * Reads trip metrics and selected vehicle from the Redux ride slice.
 * Dispatches setSelectedVehicle when the user taps a different tier.
 */
function RideOptionsScreen() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  // distanceText and etaText come from the Distance Matrix API result
  const { distanceText, etaText, selectedVehicle } = useSelector(state => state.ride);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('rideOptions.title')}</Text>
      <Text style={styles.subtitle}>
        {t('rideOptions.subtitle', {
          distance: distanceText || t('common.notAvailable'),
          eta: etaText || t('common.notAvailable'),
        })}
      </Text>

      {VEHICLES.map(vehicle => {
        const isSelected = selectedVehicle === vehicle;

        return (
          <TouchableOpacity
            key={vehicle}
            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            onPress={() => dispatch(setSelectedVehicle(vehicle))}
          >
            <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
              {t(VEHICLE_TRANSLATION_KEYS[vehicle])}
            </Text>
            <Text style={styles.optionPrice}>
              {t('rideOptions.estimatedFare', { fare: mockFareByVehicle(vehicle) })}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * Returns a hardcoded fare estimate string for the given vehicle tier.
 * This is a placeholder until real dynamic pricing is implemented.
 * @param {'Economico' | 'XL' | 'Premium'} vehicle - Selected vehicle tier.
 * @returns {string} Formatted fare amount (e.g. '95.00').
 */
function mockFareByVehicle(vehicle) {
  if (vehicle === 'Economico') {
    return '95.00';
  }
  if (vehicle === 'XL') {
    return '140.00';
  }
  return '220.00';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    color: '#4B5563',
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    borderColor: '#111827',
    backgroundColor: '#EEF2FF',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  optionTitleSelected: {
    color: '#111827',
  },
  optionPrice: {
    marginTop: 6,
    color: '#4B5563',
  },
});

export default RideOptionsScreen;
