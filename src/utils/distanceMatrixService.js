import { requestGoogle } from './googleClient';

/**
 * Returns distance and duration between origin and destination.
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @param {string} [mode='driving']
 * @returns {Promise<Object>} Element with distance and duration fields
 */
export const getDistanceMatrix = async (origin, destination, mode = 'driving') => {
  const data = await requestGoogle('/maps/api/distancematrix/json', {
    origins: `${origin.lat},${origin.lng}`,
    destinations: `${destination.lat},${destination.lng}`,
    mode,
  });

  return data.rows[0].elements[0];
};
