/**
 * TripHistoryScreen
 * Pantalla para mostrar el historial de viajes del usuario.
 * Autor: [Nombre de tu compañera]
 * Fecha: 20/05/2026
 *
 * Muestra una lista de viajes (mock data) con origen, destino, fecha y costo.
 * Navegable desde HomeScreen y ProfileScreen.
 */
import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setTrips } from '../store/slices/tripHistorySlice';
import { loadTripsFromStorage, saveTripsToStorage } from '../utils/tripHistoryStorage';
import { isFirebaseConfigured, loadTripsFromFirebase, syncTripsToFirebase } from '../utils/firebaseTripService';

function mergeTrips(primaryTrips, secondaryTrips) {
  const byId = new Map();

  [...(primaryTrips || []), ...(secondaryTrips || [])].forEach(trip => {
    if (!trip || !trip.id) {
      return;
    }

    const existing = byId.get(trip.id);
    if (!existing) {
      byId.set(trip.id, trip);
      return;
    }

    const existingCreatedAt = Number(existing.createdAt || 0);
    const currentCreatedAt = Number(trip.createdAt || 0);
    byId.set(trip.id, currentCreatedAt >= existingCreatedAt ? trip : existing);
  });

  return Array.from(byId.values()).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
}

/**
 * Renderiza una tarjeta de viaje.
 */
function TripCard({ trip, t }) {
  const paymentLabel = trip.paymentMethod
    ? t(`rideOptions.paymentMethods.${trip.paymentMethod}`)
    : t('common.notAvailable');

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{trip.origin} → {trip.destination}</Text>
      <Text style={styles.detail}>{t('tripHistory.date')}: {trip.date}</Text>
      <Text style={styles.detail}>{t('rideOptions.subtitle', { distance: trip.distance, eta: trip.eta })}</Text>
      <Text style={styles.detail}>{t('tripHistory.cost')}: {trip.cost}</Text>
      <Text style={styles.detail}>{t('tripHistory.status')}: {t(`rideOptions.status.${trip.status || 'idle'}`)}</Text>
      <Text style={styles.detail}>{t('tripHistory.paymentMethod')}: {paymentLabel}</Text>
    </View>
  );
}

/**
 * Pantalla principal del historial de viajes.
 */
export default function TripHistoryScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const trips = useSelector(state => state.tripHistory.trips);
  const completedTrips = trips.filter(trip => ['completed', 'paid'].includes(trip.status));

  useEffect(() => {
    (async () => {
      const persistedTrips = await loadTripsFromStorage();

      if (!isFirebaseConfigured()) {
        dispatch(setTrips(persistedTrips));
        return;
      }

      const firebaseTrips = await loadTripsFromFirebase();

      if (firebaseTrips.length === 0) {
        if (persistedTrips.length > 0) {
          await syncTripsToFirebase(persistedTrips);
        }
        dispatch(setTrips(persistedTrips));
        return;
      }

      const mergedTrips = mergeTrips(firebaseTrips, persistedTrips).slice(0, 50);
      dispatch(setTrips(mergedTrips));
      await saveTripsToStorage(mergedTrips);
    })();
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('tripHistory.title')}</Text>
      {completedTrips.length === 0 ? (
        <Text style={styles.emptyText}>{t('tripHistory.empty')}</Text>
      ) : (
        <FlatList
          data={completedTrips}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TripCard trip={item} t={t} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#111827',
  },
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1F2937',
  },
  detail: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
