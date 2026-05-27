import { requestGoogleRoutes } from './googleClient';

const TRAVEL_MODE_MAP = {
  driving: 'DRIVE',
  walking: 'WALK',
  bicycling: 'BICYCLE',
};

/**
 * Returns the optimal route between two coordinates.
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @param {string} [mode='driving'] - Travel mode: driving | walking | bicycling
 * @returns {Promise<Array>} List of route legs
 */
export const getDirections = async (origin, destination, mode = 'driving') => {
  const data = await requestGoogleRoutes(
    '/directions/v2:computeRoutes',
    {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng,
          },
        },
      },
      travelMode: TRAVEL_MODE_MAP[mode] || 'DRIVE',
      routingPreference: 'TRAFFIC_UNAWARE',
      computeAlternativeRoutes: false,
      languageCode: 'es',
      units: 'METRIC',
    },
    'routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration',
  );

  const routes = Array.isArray(data?.routes) ? data.routes : [];
  return routes.map(route => ({
    overview_polyline: {
      points: route?.polyline?.encodedPolyline || '',
    },
    distanceMeters: route?.distanceMeters || 0,
    duration: route?.duration || '0s',
  }));
};
