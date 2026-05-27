import { requestGooglePlacesNew } from './googleClient';

/**
 * Returns full details (coordinates, name, address) for a given place.
 * @param {string} placeId - Place ID from autocomplete result
 * @param {string} sessionToken - Same token used during autocomplete
 * @returns {Promise<Object>} Place result object
 */
export const getPlaceDetails = async (placeId, sessionToken) => {
  const data = await requestGooglePlacesNew(
    `/v1/places/${placeId}`,
    'get',
    undefined,
    'id,location,displayName,formattedAddress',
  );

  return {
    geometry: {
      location: {
        lat: data?.location?.latitude,
        lng: data?.location?.longitude,
      },
    },
    name: data?.displayName?.text || '',
    formatted_address: data?.formattedAddress || '',
    sessionToken,
  };
};