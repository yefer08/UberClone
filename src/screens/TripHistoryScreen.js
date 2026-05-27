/**
 * TripHistoryScreen
 * Pantalla para mostrar el historial de viajes del usuario.
 * Autor: [Nombre de tu compañera]
 * Fecha: 20/05/2026
 *
 * Muestra una lista de viajes guardados en Firestore con origen, destino, fecha y costo.
 * Navegable desde HomeScreen y ProfileScreen.
 */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getRidesForUser } from '../firebase/firestore';

/**
 * Renderiza una tarjeta de viaje.
 */
function TripCard({ trip, t }) {
  const origin = trip.origin?.address || formatCoordinates(trip.origin);
  const destination = trip.destination?.address || formatCoordinates(trip.destination);
  const date = trip.createdAt?.toDate ? trip.createdAt.toDate().toLocaleDateString() : trip.date;
  const cost = trip.fare != null ? `$${trip.fare.toFixed(2)}` : trip.cost;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{origin} → {destination}</Text>
      <Text style={styles.detail}>{t('tripHistory.date')}: {date}</Text>
      <Text style={styles.detail}>{t('tripHistory.cost')}: {cost}</Text>
    </View>
  );
}

function formatCoordinates(point) {
  if (!point || point.lat == null || point.lng == null) {
    return 'N/A';
  }

  return `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
}

/**
 * Pantalla principal del historial de viajes.
 */
export default function TripHistoryScreen() {
  const { t } = useTranslation();
  const user = useSelector(state => state.user);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      if (!user?.email && !user?.phone) {
        setTrips([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const results = await getRidesForUser(user);
        setTrips(results);
      } catch (err) {
        console.warn('Trip history load error:', err.message);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, [user]);

  const hasProfile = !!user?.email || !!user?.phone;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('tripHistory.title')}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#111827" style={styles.loader} />
      ) : !hasProfile ? (
        <Text style={styles.message}>{t('tripHistory.completeProfileMessage')}</Text>
      ) : trips.length === 0 ? (
        <Text style={styles.message}>{t('tripHistory.emptyHistory')}</Text>
      ) : (
        <FlatList
          data={trips}
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
  loader: {
    marginTop: 24,
  },
  message: {
    marginTop: 24,
    color: '#4B5563',
    fontSize: 16,
    lineHeight: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
});
