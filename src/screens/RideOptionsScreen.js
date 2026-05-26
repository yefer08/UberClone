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
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Config from 'react-native-config';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { setSelectedVehicle } from '../store/slices/rideSlice';
import { hasValidMapsApiKey } from '../utils/mapsKey';

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
  const { distanceText, etaText, selectedVehicle, origin, destination, routeCoords } = useSelector(
    state => state.ride,
  );
  const hasMapsApiKey = hasValidMapsApiKey(Config.GOOGLE_MAPS_API_KEY);
  const isOriginValid = isValidLatLng(origin);
  const isDestinationValid = isValidLatLng(destination);
  const validRouteCoords = Array.isArray(routeCoords)
    ? routeCoords.filter(point => isValidMapPoint(point))
    : [];

  const mapRegion = isOriginValid
    ? buildRegion(origin, isDestinationValid ? destination : null)
    : {
        latitude: 19.4326,
        longitude: -99.1332,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('rideOptions.title')}</Text>
      <Text style={styles.subtitle}>
        {t('rideOptions.subtitle', {
          distance: distanceText || t('common.notAvailable'),
          eta: etaText || t('common.notAvailable'),
        })}
      </Text>

      <View style={styles.mapCard}>
        {hasMapsApiKey && isOriginValid ? (
          <MapView style={styles.map} region={mapRegion}>
            <Marker
              coordinate={{ latitude: origin.lat, longitude: origin.lng }}
              title={t('home.yourLocation')}
            />
            {isDestinationValid && (
              <Marker
                coordinate={{ latitude: destination.lat, longitude: destination.lng }}
                title={t('home.destination')}
              />
            )}
            {validRouteCoords.length > 1 && (
              <Polyline coordinates={validRouteCoords} strokeColor="#2563EB" strokeWidth={4} />
            )}
          </MapView>
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.mapFallbackTitle}>{t('home.mapsKeyMissingTitle')}</Text>
            <Text style={styles.mapFallbackText}>{t('home.mapsKeyMissingMessage')}</Text>
          </View>
        )}
      </View>

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
              {t('rideOptions.estimatedFare', {
                fare: estimateFareByVehicle(vehicle, distanceText),
              })}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function isValidLatLng(point) {
  return (
    !!point &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    Math.abs(point.lat) <= 90 &&
    Math.abs(point.lng) <= 180
  );
}

function isValidMapPoint(point) {
  return (
    !!point &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    Math.abs(point.latitude) <= 90 &&
    Math.abs(point.longitude) <= 180
  );
}

function buildRegion(origin, destination) {
  if (!destination) {
    return {
      latitude: origin.lat,
      longitude: origin.lng,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    };
  }

  const latDelta = Math.max(Math.abs(origin.lat - destination.lat) * 1.8, 0.04);
  const lngDelta = Math.max(Math.abs(origin.lng - destination.lng) * 1.8, 0.04);

  return {
    latitude: (origin.lat + destination.lat) / 2,
    longitude: (origin.lng + destination.lng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

/**
 * Returns a distance-based fare estimate for the selected vehicle tier.
 * Uses the trip distance from Distance Matrix text (e.g. '5.7 km').
 * @param {'Economico' | 'XL' | 'Premium'} vehicle - Selected vehicle tier.
 * @param {string} distanceText - Distance Matrix formatted distance.
 * @returns {string} Formatted fare amount (e.g. '95.00').
 */
function estimateFareByVehicle(vehicle, distanceText) {
  const km = parseDistanceInKm(distanceText);

  if (vehicle === 'Economico') {
    return (40 + km * 9).toFixed(2);
  }
  if (vehicle === 'XL') {
    return (65 + km * 12).toFixed(2);
  }
  return (90 + km * 16).toFixed(2);
}

function parseDistanceInKm(distanceText) {
  const normalized = (distanceText || '').replace(',', '.');
  const parsedValue = parseFloat(normalized);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 5;
  }

  if (normalized.includes('m') && !normalized.includes('km')) {
    return parsedValue / 1000;
  }

  return parsedValue;
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
    marginBottom: 14,
  },
  mapCard: {
    height: 180,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  map: {
    flex: 1,
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  mapFallbackTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  mapFallbackText: {
    marginTop: 8,
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
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
