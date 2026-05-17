import { requestGoogle } from './googleClient';

/**
 * Returns autocomplete suggestions based on user input.
 * @param {string} input - Text typed by the user
 * @param {string} sessionToken - UUID to group autocomplete + details calls
 * @param {string} [language='es'] - Response language
 * @returns {Promise<Array>} List of predictions
 */
export const autocompletePlaces = async (input, sessionToken, language = 'es') => {
  const data = await requestGoogle('/maps/api/place/autocomplete/json', {
    input,
    sessiontoken: sessionToken,
    language,
  });
  return data.predictions;
};