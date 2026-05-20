import { requestGoogle } from './googleClient';

/**
 * Returns full details (coordinates, name, address) for a given place.
 * @param {string} placeId - Place ID from autocomplete result
 * @param {string} sessionToken - Same token used during autocomplete
 * @returns {Promise<Object>} Place result object
 */
export const getPlaceDetails = async (placeId, sessionToken) => {
  const data = await requestGoogle('/maps/api/place/details/json', {
    place_id: placeId,
    sessiontoken: sessionToken,
    fields: 'geometry,name,formatted_address',
  });
  return data.result;
};