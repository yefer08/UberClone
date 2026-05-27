import { requestGoogleRoutes } from './googleClient';

const TRAVEL_MODE_MAP = {
  driving: 'DRIVE',
  walking: 'WALK',
  bicycling: 'BICYCLE',
};

/**
 * Returns distance and duration between origin and destination.
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @param {string} [mode='driving']
 * @returns {Promise<Object>} Element with distance and duration fields
 */
export const getDistanceMatrix = async (origin, destination, mode = 'driving') => {
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
    'routes.distanceMeters,routes.duration',
  );

  const firstRoute = Array.isArray(data?.routes) ? data.routes[0] : null;
  const distanceMeters = Number(firstRoute?.distanceMeters || 0);
  const durationSeconds = parseDurationToSeconds(firstRoute?.duration || '0s');

  return {
    distance: {
      text: formatDistance(distanceMeters),
      value: distanceMeters,
    },
    duration: {
      text: formatDuration(durationSeconds),
      value: durationSeconds,
    },
  };
};

function parseDurationToSeconds(durationText) {
  const parsed = parseInt(String(durationText).replace('s', ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDistance(distanceMeters) {
  if (distanceMeters < 1000) {
    return `${distanceMeters} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function formatDuration(durationSeconds) {
  if (durationSeconds < 60) {
    return `${durationSeconds} s`;
  }

  const minutes = Math.round(durationSeconds / 60);
  return `${minutes} min`;
}
