/**
 * @file HomeScreen.js
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Config from 'react-native-config';
import debounce from 'lodash.debounce';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';

import { autocompletePlaces } from '../utils/autocompleteServices';
import { getPlaceDetails } from '../utils/playDetailServices';
import { getDistanceMatrix } from '../utils/distanceMatrixService';
import { getDirections } from '../utils/directionsService';
import { hasValidMapsApiKey } from '../utils/mapsKey';
import {
  setDestination,
  setOrigin,
  setRouteCoords as setRouteCoordsInStore,
  setTripMetrics,
} from '../store/slices/rideSlice';

const newSessionToken = () => Math.random().toString(36).slice(2);

/**
 * Requests ACCESS_FINE_LOCATION permission on Android at runtime.
 * On iOS the permission is handled through Info.plist; this function
 * always returns true for non-Android platforms.
 * @returns {Promise<boolean>} True if permission was granted.
 */
async function requestLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: t('home.locationPermissionTitle'),
      message: t('home.locationPermissionMessage'),
      buttonPositive: t('common.allow'),
      buttonNegative: t('common.deny'),
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const hasMapsApiKey = hasValidMapsApiKey(Config.GOOGLE_MAPS_API_KEY);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingTrip, setLoadingTrip] = useState(false);

  const sessionTokenRef = useRef(newSessionToken());
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const allowed = await requestLocationPermission();
      if (!allowed) {
        Alert.alert(t('home.permissionDeniedTitle'), t('home.permissionDeniedMessage'));
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        error => console.warn('Geolocation error:', error.message),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceLocationManager: true,
        },
      );
    })();
  }, [t]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestions = useCallback(
    debounce(async input => {
      if (input.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);

      try {
        const results = await autocompletePlaces(input, sessionTokenRef.current);
        setSuggestions(results);
      } catch (err) {
        console.warn('Autocomplete error:', err.message);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400),
    [],
  );

  const updateRouteFromDirections = useCallback(async (originCoords, destinationCoords) => {
    try {
      const routes = await getDirections(originCoords, destinationCoords);
      const encodedPath = routes?.[0]?.overview_polyline?.points;

      if (!encodedPath) {
        setRouteCoords([]);
        Alert.alert('Route', 'No route available for this destination.');
        return;
      }

      const decodedPath = polyline.decode(encodedPath).map(point => ({
        latitude: point[0],
        longitude: point[1],
      }));

      setRouteCoords(decodedPath);
    } catch (err) {
      setRouteCoords([]);
      Alert.alert('Error', 'Could not calculate route path. Please try again.');
    }
  }, []);

  const onChangeText = text => {
    setQuery(text);
    setSelectedPlace(null);
    setRouteCoords([]);
    fetchSuggestions(text);
  };

  const onSelectSuggestion = async item => {
    setQuery(item.description);
    setSuggestions([]);

    try {
      const place = await getPlaceDetails(item.place_id, sessionTokenRef.current);

      const destinationCoords = {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      };

      setSelectedPlace(destinationCoords);
      setRouteCoords([]);

      sessionTokenRef.current = newSessionToken();
    } catch (err) {
      console.warn('Place details error:', err.message);
      Alert.alert(t('common.error'), t('home.destinationLoadError'));
    }
  };

  useEffect(() => {
    return () => {
      fetchSuggestions.cancel();
    };
  }, [fetchSuggestions]);

  useEffect(() => {
    if (!userLocation || !selectedPlace) {
      return;
    }

    if (routeCoords.length > 1) {
      mapRef.current?.fitToCoordinates(routeCoords, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
      return;
    }

    mapRef.current?.fitToCoordinates(
      [
        { latitude: userLocation.lat, longitude: userLocation.lng },
        { latitude: selectedPlace.lat, longitude: selectedPlace.lng },
      ],
      {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      },
    );
  }, [userLocation, selectedPlace, routeCoords]);

  useEffect(() => {
    if (!userLocation || !selectedPlace || routeCoords.length > 0) {
      return;
    }

    updateRouteFromDirections(userLocation, selectedPlace);
  }, [userLocation, selectedPlace, routeCoords.length, updateRouteFromDirections]);

  const onStartTrip = async () => {
    if (!userLocation || !selectedPlace) {
      return;
    }

    setLoadingTrip(true);

    try {
      const metrics = await getDistanceMatrix(userLocation, selectedPlace);

      dispatch(setOrigin(userLocation));
      dispatch(setDestination(selectedPlace));
      dispatch(setRouteCoordsInStore(routeCoords));
      dispatch(
        setTripMetrics({
          distanceText: metrics.distance.text,
          etaText: metrics.duration.text,
        }),
      );

      navigation.navigate('RideOptions');
    } catch (err) {
      console.warn('Distance matrix error:', err.message);
      Alert.alert(t('common.error'), t('home.routeError'));
    } finally {
      setLoadingTrip(false);
    }
  };

  const canStartTrip = !!userLocation && !!selectedPlace && !loadingTrip;

  const mapRegion = userLocation
    ? {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }
    : {
        latitude: 19.4326,
        longitude: -99.1332,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.title')}</Text>

      <View style={styles.mapCard}>
        <MapView style={styles.map} region={mapRegion}>
          {userLocation && (
            <Marker
              coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
              title="Your location"
            />
          )}
          {selectedPlace && (
            <Marker
              coordinate={{ latitude: selectedPlace.lat, longitude: selectedPlace.lng }}
              title="Destination"
            />
          )}
          {routeCoords.length > 1 && (
            <Polyline coordinates={routeCoords} strokeColor="#2563EB" strokeWidth={4} />
          )}
        </MapView>
      </View>

      <View style={styles.controlsCard}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={onChangeText}
            autoCorrect={false}
          />

          {loadingSuggestions && (
            <ActivityIndicator style={styles.inputSpinner} size="small" color="#111827" />
          )}
        </View>

        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={item => item.place_id}
            style={styles.suggestionList}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => onSelectSuggestion(item)}
              >
                <Text style={styles.suggestionMain}>
                  {item.structured_formatting.main_text}
                </Text>
                <Text style={styles.suggestionSecondary}>
                  {item.structured_formatting.secondary_text}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {!userLocation && (
          <Text style={styles.locationNote}>{t('home.gettingLocation')}</Text>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, !canStartTrip && styles.primaryButtonDisabled]}
          onPress={onStartTrip}
          disabled={!canStartTrip}
        >
          {loadingTrip ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{t('home.seeRideOptions')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.secondaryButtonText}>{t('home.goToProfile')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('TripHistory')}
        >
          <Text style={styles.secondaryButtonText}>{t('home.goToHistory')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F7',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 14,
  },
  mapCard: {
    marginHorizontal: 20,
    height: 260,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  map: {
    flex: 1,
  },
  mapMissingKeyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  mapMissingKeyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  mapMissingKeyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
  },
  controlsCard: {
    flex: 1,
    marginTop: 14,
    marginHorizontal: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#111827',
  },
  inputSpinner: {
    marginLeft: 8,
  },
  suggestionList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    maxHeight: 220,
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionMain: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  suggestionSecondary: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  locationNote: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default HomeScreen;