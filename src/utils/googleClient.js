import axios from 'axios';
import Config from 'react-native-config';
import { hasValidMapsApiKey } from './mapsKey';

const GOOGLE_BASE_URL = 'https://maps.googleapis.com';
const GOOGLE_PLACES_NEW_BASE_URL = 'https://places.googleapis.com';
const GOOGLE_ROUTES_BASE_URL = 'https://routes.googleapis.com';

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
  const key = getMapsWebApiKey();

  const response = await axios.get(`${GOOGLE_BASE_URL}${endpoint}`, {
    params: {
      ...cleanParams(params),
      key,
    },
    timeout: 10000,
  });

  return response.data;
};

/**
 * Returns the configured Google Maps API key or throws when missing/invalid.
 * @returns {string}
 */
export const getMapsApiKey = () => {
  const key = Config.GOOGLE_MAPS_API_KEY;

  if (!hasValidMapsApiKey(key)) {
    throw new Error('Missing GOOGLE_MAPS_API_KEY. Set it in .env');
  }

  return key;
};

/**
 * Returns the API key used for HTTP web-service calls.
 * Prefer GOOGLE_MAPS_WEB_API_KEY when provided, fallback to GOOGLE_MAPS_API_KEY.
 * @returns {string}
 */
export const getMapsWebApiKey = () => {
  const webKey = Config.GOOGLE_MAPS_WEB_API_KEY;

  if (hasValidMapsApiKey(webKey)) {
    return webKey;
  }

  return getMapsApiKey();
};

/**
 * Generic request helper for Places API (New).
 * @param {string} endpoint - Endpoint path (e.g. '/v1/places:autocomplete')
 * @param {'get'|'post'} [method='post']
 * @param {Record<string, any>} [data={}]
 * @param {string} [fieldMask]
 * @returns {Promise<any>}
 */
export const requestGooglePlacesNew = async (
  endpoint,
  method = 'post',
  data = {},
  fieldMask,
) => {
  const key = getMapsWebApiKey();
  const response = await axios({
    baseURL: GOOGLE_PLACES_NEW_BASE_URL,
    url: endpoint,
    method,
    data,
    headers: {
      'X-Goog-Api-Key': key,
      ...(fieldMask ? { 'X-Goog-FieldMask': fieldMask } : {}),
    },
    timeout: 10000,
  });

  return response.data;
};

/**
 * Generic request helper for Routes API (New).
 * @param {string} endpoint - Endpoint path (e.g. '/directions/v2:computeRoutes')
 * @param {Record<string, any>} body
 * @param {string} fieldMask
 * @returns {Promise<any>}
 */
export const requestGoogleRoutes = async (endpoint, body, fieldMask) => {
  const key = getMapsWebApiKey();
  const response = await axios({
    baseURL: GOOGLE_ROUTES_BASE_URL,
    url: endpoint,
    method: 'post',
    data: body,
    headers: {
      'X-Goog-Api-Key': key,
      ...(fieldMask ? { 'X-Goog-FieldMask': fieldMask } : {}),
    },
    timeout: 10000,
  });

  return response.data;
};
