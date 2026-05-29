import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_PROFILE_KEY = '@ProyectoUberMovil:userProfile';

function sanitizeProfile(rawProfile) {
  if (!rawProfile || typeof rawProfile !== 'object') {
    return null;
  }

  const profile = {
    photo: typeof rawProfile.photo === 'string' ? rawProfile.photo : '',
    name: typeof rawProfile.name === 'string' ? rawProfile.name : '',
    email: typeof rawProfile.email === 'string' ? rawProfile.email : '',
    phone: typeof rawProfile.phone === 'string' ? rawProfile.phone : '',
    gender: typeof rawProfile.gender === 'string' ? rawProfile.gender : '',
  };

  if (!profile.name && !profile.email && !profile.phone) {
    return null;
  }

  return profile;
}

export async function loadUserProfileFromStorage() {
  try {
    const raw = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (!raw) {
      return null;
    }

    return sanitizeProfile(JSON.parse(raw));
  } catch (error) {
    console.warn('User profile load error:', error.message);
    return null;
  }
}

export async function saveUserProfileToStorage(profile) {
  const safeProfile = sanitizeProfile(profile);
  if (!safeProfile) {
    return;
  }

  try {
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(safeProfile));
  } catch (error) {
    console.warn('User profile save error:', error.message);
  }
}

export async function clearUserProfileFromStorage() {
  try {
    await AsyncStorage.removeItem(USER_PROFILE_KEY);
  } catch (error) {
    console.warn('User profile clear error:', error.message);
  }
}