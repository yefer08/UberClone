import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedVehicle } from '../store/slices/rideSlice';

const VEHICLES = ['Economico', 'XL', 'Premium'];

function RideOptionsScreen() {
  const dispatch = useDispatch();
  const { distanceText, etaText, selectedVehicle } = useSelector(state => state.ride);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your ride</Text>
      <Text style={styles.subtitle}>Distance: {distanceText || 'N/A'} | ETA: {etaText || 'N/A'}</Text>

      {VEHICLES.map(vehicle => {
        const isSelected = selectedVehicle === vehicle;

        return (
          <TouchableOpacity
            key={vehicle}
            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            onPress={() => dispatch(setSelectedVehicle(vehicle))}
          >
            <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
              {vehicle}
            </Text>
            <Text style={styles.optionPrice}>Estimated fare: ${mockFareByVehicle(vehicle)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

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
