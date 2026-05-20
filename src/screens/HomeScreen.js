/**
 * @file HomeScreen.js
 * @description Main screen of the app. Handles destination search using Google
 * Places Autocomplete, resolves coordinates via Place Details, calculates
 * distance and ETA through Distance Matrix, and dispatches the trip data
 * to Redux before navigating to RideOptionsScreen.
 *
 * Flow:
 *   1. On mount → request location permission → get current coordinates (origin)
 *   2. User types a destination → debounced autocomplete suggestions appear
 *   3. User selects a suggestion → Place Details resolves exact coordinates
 *   4. "See ride options" → Distance Matrix calculates distance + ETA
 *   5. Redux is updated (origin, destination, tripMetrics) → navigate to RideOptions
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
import debounce from 'lodash.debounce';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { autocompletePlaces } from '../utils/autocompleteServices';
import { getPlaceDetails } from '../utils/playDetailServices';
import { getDistanceMatrix } from '../utils/distanceMatrixService';
import { getDirections } from '../utils/directionsService';
import {
  setDestination,
  setOrigin,
  setRouteCoords as setRouteCoordsInStore,
  setTripMetrics,
} from '../store/slices/rideSlice';

/**
 * Generates a random session token to group an autocomplete + place details
 * call pair. Google billing counts grouped calls as a single session.
 * @returns {string} A short alphanumeric token.
 */
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
      title: 'Location permission',
      message: 'This app needs access to your location to show your current position.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * HomeScreen component.
 *
 * @param {object} props
 * @param {import('@react-navigation/native').NavigationProp<any>} props.navigation
 *   React Navigation prop used to move to RideOptionsScreen.
 */
function HomeScreen({ navigation }) {
  const dispatch = useDispatch();

  // Text currently shown in the search input
  const [query, setQuery] = useState('');
  // List of place predictions returned by the Autocomplete API
  const [suggestions, setSuggestions] = useState([]);
  // True while waiting for autocomplete API response
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  // Resolved { lat, lng } of the destination chosen by the user
  const [selectedPlace, setSelectedPlace] = useState(null);
  // Decoded coordinates used to render a route polyline on the map
  const [routeCoords, setRouteCoords] = useState([]);
  // Current device coordinates used as trip origin
  const [userLocation, setUserLocation] = useState(null);
  // True while the Distance Matrix call + Redux dispatch are in progress
  const [loadingTrip, setLoadingTrip] = useState(false);

  // Persists the session token across re-renders without triggering effects
  const sessionTokenRef = useRef(newSessionToken());

  // Request location permission and obtain the device's current position on mount.
  // The coordinates are stored as the trip origin in local state.
  useEffect(() => {
    (async () => {
      const allowed = await requestLocationPermission();
      if (!allowed) {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
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
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    })();
  }, []);

  /**
   * Debounced function that calls the Autocomplete API after the user stops
   * typing for 400 ms. Skips the call when the input is shorter than 3 chars
   * to avoid unnecessary API usage.
   */
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

  /**
   * Handles every keystroke in the destination input.
   * Clears the previously resolved place so the trip button stays disabled
   * until the user selects a new suggestion.
   * @param {string} text - Current input value.
   */
  const onChangeText = text => {
    setQuery(text);
    setSelectedPlace(null);
    setRouteCoords([]);
    fetchSuggestions(text);
  };

  /**
   * Called when the user taps a suggestion from the dropdown list.
   * Fills the input with the full description, closes the list, then
   * resolves precise coordinates via Place Details API.
   * A new session token is generated after the Details call closes the
   * billing session.
   * @param {{ place_id: string, description: string }} item - Autocomplete prediction.
   */
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

      if (userLocation) {
        const routes = await getDirections(userLocation, destinationCoords);
        const encodedPath = routes?.[0]?.overview_polyline?.points;
        if (encodedPath) {
          const decodedPath = polyline.decode(encodedPath).map(point => ({
            latitude: point[0],
            longitude: point[1],
          }));
          setRouteCoords(decodedPath);
        } else {
          setRouteCoords([]);
        }
      }

      // Rotate the session token so the next autocomplete starts a fresh session
      sessionTokenRef.current = newSessionToken();
    } catch (err) {
      console.warn('Place details error:', err.message);
      Alert.alert('Error', 'Could not load destination details. Please try again.');
    }
  };

  /**
   * Initiates the trip request flow.
   * Calls Distance Matrix API to get real distance and ETA, dispatches
   * origin, destination and metrics to Redux, then navigates to RideOptions.
   * The button is disabled if origin or destination are not yet resolved.
   */
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
      Alert.alert('Error', 'Could not calculate the route. Please try again.');
    } finally {
      setLoadingTrip(false);
    }
  };

  // Enable the CTA only when both origin (GPS) and destination (selected place) are ready
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
      <Text style={styles.title}>Where to?</Text>

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
            placeholder="Search destination..."
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
          <Text style={styles.locationNote}>Getting your location...</Text>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, !canStartTrip && styles.primaryButtonDisabled]}
          onPress={onStartTrip}
          disabled={!canStartTrip}
        >
          {loadingTrip ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>See ride options</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.secondaryButtonText}>Go to Profile</Text>
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
