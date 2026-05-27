import { requestGooglePlacesNew } from './googleClient';

/**
 * Returns autocomplete suggestions based on user input.
 * @param {string} input - Text typed by the user
 * @param {string} sessionToken - UUID to group autocomplete + details calls
 * @param {string} [language='es'] - Response language
 * @returns {Promise<Array>} List of predictions
 */
export const autocompletePlaces = async (input, sessionToken, language = 'es') => {
  const data = await requestGooglePlacesNew(
    '/v1/places:autocomplete',
    'post',
    {
      input,
      languageCode: language,
      sessionToken,
      includedRegionCodes: ['co'],
    },
    'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text',
  );

  const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
  return suggestions
    .map(item => item?.placePrediction)
    .filter(Boolean)
    .map(prediction => ({
      place_id: prediction.placeId,
      description: prediction?.text?.text || '',
      structured_formatting: {
        main_text: prediction?.structuredFormat?.mainText?.text || prediction?.text?.text || '',
        secondary_text: prediction?.structuredFormat?.secondaryText?.text || '',
      },
    }));
};