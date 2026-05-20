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
import { autocompletePlaces } from '../utils/autocompleteServices';
import { getPlaceDetails } from '../utils/playDetailServices';
import { getDistanceMatrix } from '../utils/distanceMatrixService';
import { setDestination, setOrigin, setTripMetrics } from '../store/slices/rideSlice';

const newSessionToken = () => Math.random().toString(36).slice(2);

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

function HomeScreen({ navigation }) {
  const dispatch = useDispatch();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingTrip, setLoadingTrip] = useState(false);

  const sessionTokenRef = useRef(newSessionToken());

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

  const onChangeText = text => {
    setQuery(text);
    setSelectedPlace(null);
    fetchSuggestions(text);
  };

  const onSelectSuggestion = async item => {
    setQuery(item.description);
    setSuggestions([]);
    try {
      const place = await getPlaceDetails(item.place_id, sessionTokenRef.current);
      setSelectedPlace({
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      });
      sessionTokenRef.current = newSessionToken();
    } catch (err) {
      console.warn('Place details error:', err.message);
    }
  };

  const onStartTrip = async () => {
    if (!userLocation || !selectedPlace) {
      return;
    }
    setLoadingTrip(true);
    try {
      const metrics = await getDistanceMatrix(userLocation, selectedPlace);
      dispatch(setOrigin(userLocation));
      dispatch(setDestination(selectedPlace));
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

  const canStartTrip = !!userLocation && !!selectedPlace && !loadingTrip;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where to?</Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F5F7',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
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
