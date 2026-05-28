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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Config from 'react-native-config';
import MapView, { AnimatedRegion, Marker, Polyline } from 'react-native-maps';
import { setRideRequestStatus, setSelectedVehicle } from '../store/slices/rideSlice';
import { hasValidMapsApiKey } from '../utils/mapsKey';
import { addTrip, updateTripById } from '../store/slices/tripHistorySlice';
import { appendTripToStorage, updateTripInStorage } from '../utils/tripHistoryStorage';
import { appendTripToFirebase, updateTripInFirebase } from '../utils/firebaseTripService';

/** Available vehicle categories. Order determines display order on screen. */
const VEHICLES = ['Economico', 'XL', 'Premium'];

const VEHICLE_TRANSLATION_KEYS = {
  Economico: 'rideOptions.economico',
  XL: 'rideOptions.xl',
  Premium: 'rideOptions.premium',
};

const PAYMENT_METHODS = ['card', 'cash', 'stripe', 'mercadopago'];

/**
 * RideOptionsScreen component.
 * Reads trip metrics and selected vehicle from the Redux ride slice.
 * Dispatches setSelectedVehicle when the user taps a different tier.
 */
function RideOptionsScreen() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isConfirming, setIsConfirming] = useState(false);
  const [activeTripId, setActiveTripId] = useState(null);
  const [driverIndex, setDriverIndex] = useState(0);
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const simulationRef = useRef(null);
  // distanceText and etaText come from the Distance Matrix API result
  const {
    distanceText,
    etaText,
    selectedVehicle,
    origin,
    originLabel,
    destination,
    destinationLabel,
    routeCoords,
    requestStatus,
  } = useSelector(state => state.ride);
  const hasMapsApiKey = hasValidMapsApiKey(Config.GOOGLE_MAPS_API_KEY);
  const isOriginValid = isValidLatLng(origin);
  const isDestinationValid = isValidLatLng(destination);
  const validRouteCoords = useMemo(
    () => (Array.isArray(routeCoords) ? routeCoords.filter(point => isValidMapPoint(point)) : []),
    [routeCoords],
  );
  const driverPath = useMemo(
    () => buildDriverPath(validRouteCoords, origin, destination),
    [destination, origin, validRouteCoords],
  );
  const driverCoordinate = driverPath[driverIndex] || null;
  const driverEtaMinutes = Math.max(Math.ceil(((driverPath.length - 1 - driverIndex) * 2) / 60), 0);
  const driverAnimatedCoordinate = useRef(
    new AnimatedRegion({
      latitude: isOriginValid ? origin.lat : 6.2442,
      longitude: isOriginValid ? origin.lng : -75.5812,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    }),
  ).current;

  const mapRegion = isOriginValid
    ? buildRegion(origin, isDestinationValid ? destination : null)
    : {
        latitude: 6.2442,
        longitude: -75.5812,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };

  const persistTripChanges = async (id, changes) => {
    if (!id) {
      return;
    }

    await Promise.allSettled([
      updateTripInStorage(id, changes),
      updateTripInFirebase(id, changes),
    ]);
  };

  const onConfirmRideRequest = async () => {
    if (isConfirming) {
      return;
    }

    const trip = {
      id: Date.now().toString(),
      origin: originLabel || t('home.yourLocation'),
      destination: destinationLabel || t('home.destination'),
      date: new Date().toISOString().slice(0, 10),
      distance: distanceText || t('common.notAvailable'),
      eta: etaText || t('common.notAvailable'),
      cost: `$${estimateFareByVehicle(selectedVehicle, distanceText)}`,
      vehicle: selectedVehicle,
      status: 'requested',
      paymentMethod: 'pending',
    };

    // Confirm the request immediately in UI, then persist in background.
    dispatch(setRideRequestStatus('requested'));
    dispatch(addTrip(trip));
    setActiveTripId(trip.id);
    setIsPaymentPending(false);
    setDriverIndex(0);
    setIsConfirming(true);

    await Promise.allSettled([appendTripToStorage(trip), appendTripToFirebase(trip)]);

    setIsConfirming(false);
    Alert.alert(t('rideOptions.requestCreatedTitle'), t('rideOptions.requestCreatedMessage'));
  };

  const onCancelRequest = () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    dispatch(setRideRequestStatus('cancelled'));
    setIsPaymentPending(false);

    if (activeTripId) {
      const changes = { status: 'cancelled' };
      dispatch(updateTripById({ id: activeTripId, changes }));
      persistTripChanges(activeTripId, changes);
    }

    Alert.alert(t('rideOptions.requestCancelledTitle'), t('rideOptions.requestCancelledMessage'));
  };

  const onPay = async () => {
    if (isPaying) {
      return;
    }

    if (paymentMethod === 'card') {
      if (!/^\d{16}$/.test(cardNumber.replace(/\s+/g, ''))) {
        Alert.alert(t('profile.validationTitle'), t('rideOptions.invalidCardNumber'));
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        Alert.alert(t('profile.validationTitle'), t('rideOptions.invalidCardExpiry'));
        return;
      }
      if (!/^\d{3,4}$/.test(cardCvc)) {
        Alert.alert(t('profile.validationTitle'), t('rideOptions.invalidCardCvc'));
        return;
      }
    }

    setIsPaying(true);

    if (paymentMethod === 'stripe' || paymentMethod === 'mercadopago') {
      const checkoutUrl = paymentMethod === 'stripe'
        ? (Config.STRIPE_CHECKOUT_URL || '').trim()
        : (Config.MERCADOPAGO_CHECKOUT_URL || '').trim();

      if (!/^https?:\/\//i.test(checkoutUrl)) {
        Alert.alert(t('common.error'), t('rideOptions.gatewayMissingUrl'));
        setIsPaying(false);
        return;
      }

      try {
        await Linking.openURL(checkoutUrl);
      } catch (error) {
        console.warn('Gateway open error:', error.message);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1200));

    dispatch(setRideRequestStatus('paid'));
    setIsPaymentPending(false);
    setIsPaying(false);

    if (activeTripId) {
      const changes = {
        status: 'paid',
        paymentMethod,
      };
      dispatch(
        updateTripById({
          id: activeTripId,
          changes,
        }),
      );
      persistTripChanges(activeTripId, changes);
    }

    Alert.alert(t('rideOptions.paymentSuccessTitle'), t('rideOptions.paymentSuccessMessage'));
  };

  useEffect(() => {
    if (!driverCoordinate) {
      return;
    }

    driverAnimatedCoordinate.timing({
      latitude: driverCoordinate.latitude,
      longitude: driverCoordinate.longitude,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [driverAnimatedCoordinate, driverCoordinate]);

  useEffect(() => {
    if (requestStatus !== 'requested' || driverPath.length < 2) {
      return;
    }

    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }

    let index = 0;
    setDriverIndex(0);

    simulationRef.current = setInterval(() => {
      index += 1;

      if (index >= driverPath.length) {
        index = driverPath.length - 1;
      }

      setDriverIndex(index);

      const halfway = Math.floor((driverPath.length - 1) * 0.5);
      if (index === 1) {
        dispatch(setRideRequestStatus('driver_arriving'));
        if (activeTripId) {
          const changes = { status: 'driver_arriving' };
          dispatch(updateTripById({ id: activeTripId, changes }));
          persistTripChanges(activeTripId, changes);
        }
      }
      if (index >= halfway) {
        dispatch(setRideRequestStatus('in_progress'));
        if (activeTripId) {
          const changes = { status: 'in_progress' };
          dispatch(updateTripById({ id: activeTripId, changes }));
          persistTripChanges(activeTripId, changes);
        }
      }

      if (index >= driverPath.length - 1) {
        if (simulationRef.current) {
          clearInterval(simulationRef.current);
          simulationRef.current = null;
        }

        dispatch(setRideRequestStatus('completed'));
        setIsPaymentPending(true);
        if (activeTripId) {
          const changes = { status: 'completed' };
          dispatch(updateTripById({ id: activeTripId, changes }));
          persistTripChanges(activeTripId, changes);
        }
      }
    }, 2000);

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
    };
  }, [activeTripId, dispatch, driverPath, requestStatus]);

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
            {driverCoordinate && requestStatus !== 'idle' && requestStatus !== 'cancelled' && (
              <Marker.Animated
                coordinate={driverAnimatedCoordinate}
                title={t('rideOptions.driverMarkerTitle')}
                description={t('rideOptions.driverMarkerDescription', {
                  eta: driverEtaMinutes,
                })}
                pinColor="#16A34A"
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

      <View style={styles.requestStatusCard}>
        <Text style={styles.requestStatusLabel}>{t('rideOptions.requestStatusLabel')}</Text>
        <Text style={styles.requestStatusValue}>{t(`rideOptions.status.${requestStatus}`)}</Text>
        {requestStatus !== 'idle' && requestStatus !== 'cancelled' && (
          <Text style={styles.requestStatusEta}>
            {t('rideOptions.driverEta', { eta: driverEtaMinutes })}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, isConfirming && styles.confirmButtonDisabled]}
        onPress={onConfirmRideRequest}
        disabled={isConfirming}
      >
        <Text style={styles.confirmButtonText}>{t('rideOptions.confirmRequest')}</Text>
      </TouchableOpacity>

      {requestStatus === 'requested' && (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancelRequest}>
          <Text style={styles.cancelButtonText}>{t('rideOptions.cancelRequest')}</Text>
        </TouchableOpacity>
      )}

      {isPaymentPending && (
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>{t('rideOptions.paymentTitle')}</Text>
          <Text style={styles.paymentSubtitle}>{t('rideOptions.paymentSubtitle')}</Text>

          <View style={styles.paymentMethodRow}>
            {PAYMENT_METHODS.map(method => {
              const selected = paymentMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  style={[styles.paymentChip, selected && styles.paymentChipSelected]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={[styles.paymentChipText, selected && styles.paymentChipTextSelected]}>
                    {t(`rideOptions.paymentMethods.${method}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {paymentMethod === 'card' && (
            <View>
              <TextInput
                style={styles.paymentInput}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                placeholder={t('rideOptions.cardNumberPlaceholder')}
                maxLength={16}
              />
              <View style={styles.paymentRowTwoCols}>
                <TextInput
                  style={[styles.paymentInput, styles.paymentInputHalf]}
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  placeholder={t('rideOptions.cardExpiryPlaceholder')}
                  maxLength={5}
                />
                <TextInput
                  style={[styles.paymentInput, styles.paymentInputHalf]}
                  value={cardCvc}
                  onChangeText={setCardCvc}
                  keyboardType="number-pad"
                  placeholder={t('rideOptions.cardCvcPlaceholder')}
                  maxLength={4}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.payButton, isPaying && styles.confirmButtonDisabled]}
            onPress={onPay}
            disabled={isPaying}
          >
            <Text style={styles.payButtonText}>{t('rideOptions.payNow')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function buildDriverPath(validRouteCoords, origin, destination) {
  if (validRouteCoords.length > 1) {
    return validRouteCoords;
  }

  if (isValidLatLng(origin) && isValidLatLng(destination)) {
    return [
      { latitude: origin.lat, longitude: origin.lng },
      { latitude: destination.lat, longitude: destination.lng },
    ];
  }

  return [];
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
  requestStatusCard: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  requestStatusLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  requestStatusValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  requestStatusEta: {
    marginTop: 6,
    fontSize: 13,
    color: '#374151',
  },
  confirmButton: {
    marginTop: 12,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  paymentCard: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  paymentSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#4B5563',
  },
  paymentMethodRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  paymentChip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  paymentChipSelected: {
    borderColor: '#111827',
    backgroundColor: '#EEF2FF',
  },
  paymentChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  paymentChipTextSelected: {
    color: '#111827',
  },
  paymentInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  paymentRowTwoCols: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentInputHalf: {
    flex: 1,
  },
  payButton: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: '#111827',
    paddingVertical: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RideOptionsScreen;
