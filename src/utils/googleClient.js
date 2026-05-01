import axios from 'axios';
import Config from 'react-native-config';

const GOOGLE_BASE_URL = 'https://maps.googleapis.com';

/**
 * Reads and validates the Google Maps API key from environment variables.
 * @returns {string} The API key.
 * @throws {Error} If the key is missing.
 */
const getGoogleApiKey = () => {
  const apiKey = Config.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing GOOGLE_MAPS_API_KEY. Add it to your .env file and rebuild the app.',
    );
  }
  return apiKey;
};

/**
 * Removes undefined values from a params object.
 * @param {Record<string, any>} params
 * @returns {Record<string, any>}
 */
const cleanParams = params =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  );

/**
 * Generic Google Maps API request handler.
 * Automatically appends the API key to every request.
 * @param {string} endpoint - API endpoint path (e.g. '/maps/api/place/autocomplete/json')
 * @param {Record<string, any>} params - Query parameters (without key)
 * @returns {Promise<any>} Parsed response data
 */
export const requestGoogle = async (endpoint, params = {}) => {
  const key = getGoogleApiKey();

  const response = await axios.get(`${GOOGLE_BASE_URL}${endpoint}`, {
    params: {
      ...cleanParams(params),
      key,
    },
    timeout: 10000,
  });

  return response.data;
};
