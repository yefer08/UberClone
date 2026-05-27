/**
 * TripHistoryScreen
 * Pantalla para mostrar el historial de viajes del usuario.
 * Autor: [Nombre de tu compañera]
 * Fecha: 20/05/2026
 *
 * Muestra una lista de viajes (mock data) con origen, destino, fecha y costo.
 * Navegable desde HomeScreen y ProfileScreen.
 */
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const TRIPS = [
  {
    id: '1',
    origin: 'Av. Reforma 123',
    destination: 'Aeropuerto CDMX',
    date: '2026-05-18',
    cost: '$180',
  },
  {
    id: '2',
    origin: 'Insurgentes 456',
    destination: 'Parque Hundido',
    date: '2026-05-15',
    cost: '$75',
  },
  {
    id: '3',
    origin: 'Metro CU',
    destination: 'Museo Soumaya',
    date: '2026-05-10',
    cost: '$120',
  },
];

/**
 * Renderiza una tarjeta de viaje.
 */
function TripCard({ trip, t }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{trip.origin} → {trip.destination}</Text>
      <Text style={styles.detail}>{t('tripHistory.date')}: {trip.date}</Text>
      <Text style={styles.detail}>{t('tripHistory.cost')}: {trip.cost}</Text>
    </View>
  );
}

/**
 * Pantalla principal del historial de viajes.
 */
export default function TripHistoryScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('tripHistory.title')}</Text>
      <FlatList
        data={TRIPS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TripCard trip={item} t={t} />}
        contentContainerStyle={styles.listContent}
      />
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
});
