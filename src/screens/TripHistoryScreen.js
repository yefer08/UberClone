/*
* Displays a list of trips (mock data) with origin, destination, date, and cost.
* Navigable from HomeScreen and ProfileScreen.
*/

import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

// Simulated data (mock)
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
 * Render a travel card.
 */
function TripCard({ trip }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{trip.origin} → {trip.destination}</Text>
      <Text style={styles.detail}>Fecha: {trip.date}</Text>
      <Text style={styles.detail}>Costo: {trip.cost}</Text>
    </View>
  );
}

/**
 * Main screen for the trip history.
 */
export default function TripHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial de viajes</Text>
      <FlatList
        data={TRIPS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <TripCard trip={item} />}
        contentContainerStyle={{ paddingBottom: 24 }}
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
});