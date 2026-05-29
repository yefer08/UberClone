import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setTrips } from '../store/slices/tripHistorySlice';
import { loadTripsFromFirebase } from '../utils/firebaseTripService';
import { loadTripsFromStorage } from '../utils/tripHistoryStorage';

function mergeTrips(localTrips, remoteTrips) {
  const mergedMap = new Map();

  [...remoteTrips, ...localTrips].forEach(trip => {
    if (!trip?.id) {
      return;
    }

    const previous = mergedMap.get(trip.id);
    if (!previous || (trip.createdAt || 0) >= (previous.createdAt || 0)) {
      mergedMap.set(trip.id, trip);
    }
  });

  return Array.from(mergedMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function filterTripsByUser(trips, email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return [];
  }

  return trips.filter(trip => String(trip?.userEmail || '').trim().toLowerCase() === normalizedEmail);
}

function TripCard({ trip, t }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{trip.origin} → {trip.destination}</Text>
      <Text style={styles.detail}>
        {t('tripHistory.date')}: {trip.date || t('common.notAvailable')}
      </Text>
      <Text style={styles.detail}>
        {t('tripHistory.cost')}: {trip.cost || t('common.notAvailable')}
      </Text>
      <Text style={styles.detail}>
        {t('tripHistory.status')}: {t(`rideOptions.status.${trip.status || 'idle'}`)}
      </Text>
      <Text style={styles.detail}>
        {t('tripHistory.paymentMethod')}: {t(`rideOptions.paymentMethods.${trip.paymentMethod || 'pending'}`)}
      </Text>
    </View>
  );
}

export default function TripHistoryScreen() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const activeUserEmail = useSelector(state => state.user.email);
  const trips = useSelector(state => state.tripHistory.trips);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const hydrateTrips = async () => {
        setIsLoading(true);

        const [localTrips, remoteTrips] = await Promise.all([
          loadTripsFromStorage(),
          loadTripsFromFirebase(),
        ]);

        if (!isMounted) {
          return;
        }

        const mergedTrips = mergeTrips(localTrips, remoteTrips);
        const filteredTrips = filterTripsByUser(mergedTrips, activeUserEmail);
        dispatch(setTrips(filteredTrips));
        setIsLoading(false);
      };

      hydrateTrips();

      return () => {
        isMounted = false;
      };
    }, [activeUserEmail, dispatch]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('tripHistory.title')}</Text>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color="#111827" />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TripCard trip={item} t={t} />}
          contentContainerStyle={trips.length === 0 ? styles.emptyListContent : styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.emptyText}>{t('tripHistory.empty')}</Text>
            </View>
          }
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
    marginBottom: 14,
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
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
  emptyListContent: {
    flexGrow: 1,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
