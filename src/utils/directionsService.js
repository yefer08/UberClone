import { requestGoogle } from './googleClient';

/**
 * Returns the optimal route between two coordinates.
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @param {string} [mode='driving'] - Travel mode: driving | walking | bicycling
 * @returns {Promise<Array>} List of route legs
 */
export const getDirections = async (origin, destination, mode = 'driving') => {
  const data = await requestGoogle('/maps/api/directions/json', {
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode,
  });

  return data.routes;
};
