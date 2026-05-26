const PLACEHOLDER_KEYS = new Set(['TU_API_KEY_AQUI', 'TU_API_KEY_REAL']);

/**
 * Returns true only when the API key looks like a real key and not a placeholder.
 * @param {string | undefined | null} key
 * @returns {boolean}
 */
export const hasValidMapsApiKey = key => {
  if (typeof key !== 'string') {
    return false;
  }

  const trimmedKey = key.trim();
  if (!trimmedKey || PLACEHOLDER_KEYS.has(trimmedKey)) {
    return false;
  }

  if (trimmedKey.startsWith('http://') || trimmedKey.startsWith('https://')) {
    return false;
  }

  return trimmedKey.length >= 20;
};
