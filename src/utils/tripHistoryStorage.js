import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIP_HISTORY_KEY = '@ProyectoUberMovil:tripHistory';

export async function loadTripsFromStorage() {
  try {
    const raw = await AsyncStorage.getItem(TRIP_HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Trip history load error:', error.message);
    return [];
  }
}

export async function appendTripToStorage(trip) {
  const current = await loadTripsFromStorage();
  const next = [trip, ...current].slice(0, 50);

  try {
    await AsyncStorage.setItem(TRIP_HISTORY_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('Trip history save error:', error.message);
  }
}
