/**
 * @file ProfileScreen.js
 * @description Allows the user to view and update their profile information.
 *
 * Validation rules applied before dispatching to Redux:
 *   - All fields (name, email, phone) are required
 *   - Gender selection is required
 *   - Name must not exceed 50 characters
 *   - Email must match a basic format (x@x.x)
 *   - Phone must be numeric only
 */
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { clearTrips } from '../store/slices/tripHistorySlice';
import { clearUserProfile, setUserProfile } from '../store/slices/userSlice';
import { saveUserToFirebase } from '../utils/firebaseTripService';
import {
  clearUserProfileFromStorage,
  saveUserProfileToStorage,
} from '../utils/userProfileStorage';

const GENDER_OPTIONS = [
  { value: '', translationKey: 'profile.genderPlaceholder' },
  { value: 'male', translationKey: 'profile.male' },
  { value: 'female', translationKey: 'profile.female' },
  { value: 'other', translationKey: 'profile.other' },
];

const PHOTO_URI_PATTERN = /^(https?:\/\/|file:\/\/|content:\/\/|ph:\/\/)/i;

/**
 * ProfileScreen component.
 * Pre-fills fields with the current values stored in the Redux user slice.
 * On save, validates all fields and dispatches the updated profile.
 */
function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  // Read current profile values from Redux to pre-fill the form
  const user = useSelector(state => state.user);

  const [photo, setPhoto] = useState(user.photo);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [gender, setGender] = useState(user.gender);
  const hasValidPhoto = PHOTO_URI_PATTERN.test(photo.trim());
  const hasActiveProfile = !!(user.name || user.email || user.phone || user.gender || user.photo);
  const avatarInitial = (name.trim().charAt(0) || '?').toUpperCase();

  const onPickPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    if (result.didCancel) {
      return;
    }

    const selectedUri = result.assets?.[0]?.uri;
    if (!selectedUri) {
      Alert.alert(t('common.error'), t('profile.photoPickError'));
      return;
    }

    setPhoto(selectedUri);
  };

  /**
   * Validates all form fields and dispatches the updated profile to Redux.
   * Shows an Alert for the first validation error found.
   */
  const onSave = async () => {
    const missingFields = [];
    if (!name.trim()) {
      missingFields.push(t('profile.nameLabel'));
    }
    if (!email.trim()) {
      missingFields.push(t('profile.emailLabel'));
    }
    if (!phone.trim()) {
      missingFields.push(t('profile.phoneLabel'));
    }
    if (!gender) {
      missingFields.push(t('profile.genderLabel'));
    }

    if (missingFields.length > 0) {
      Alert.alert(
        t('profile.validationTitle'),
        t('profile.requiredFieldsList', { fields: missingFields.join(', ') }),
      );
      return;
    }

    if (photo.trim() && !PHOTO_URI_PATTERN.test(photo.trim())) {
      Alert.alert(t('profile.validationTitle'), t('profile.invalidPhoto'));
      return;
    }

    if (name.length > 50) {
      Alert.alert(t('profile.validationTitle'), t('profile.nameLimit'));
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert(t('profile.validationTitle'), t('profile.invalidEmail'));
      return;
    }

    if (!/^\d+$/.test(phone)) {
      Alert.alert(t('profile.validationTitle'), t('profile.invalidPhone'));
      return;
    }

    const updatedProfile = {
      photo: photo.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      gender,
    };

    dispatch(setUserProfile(updatedProfile));
    await saveUserProfileToStorage(updatedProfile);
    saveUserToFirebase(updatedProfile);

    Alert.alert(t('profile.savedTitle'), t('profile.savedMessage'));
  };

  const onLogout = () => {
    Alert.alert(t('profile.logoutTitle'), t('profile.logoutConfirmMessage'), [
      {
        text: t('profile.logoutCancel'),
        style: 'cancel',
      },
      {
        text: t('profile.logoutConfirm'),
        style: 'destructive',
        onPress: async () => {
          dispatch(clearTrips());
          dispatch(clearUserProfile());
          await clearUserProfileFromStorage();

          setPhoto('');
          setName('');
          setEmail('');
          setPhone('');
          setGender('');

          Alert.alert(t('profile.logoutDoneTitle'), t('profile.logoutDoneMessage'));
          navigation.navigate('Home');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t('profile.title')}</Text>

      <Text style={styles.label}>{t('profile.photoLabel')}</Text>
      <View style={styles.photoSection}>
        <View style={styles.photoOuterRing}>
          <View style={styles.photoInnerCircle}>
            {hasValidPhoto ? (
              <Image source={{ uri: photo.trim() }} style={styles.photoPreview} />
            ) : (
              <Text style={styles.photoFallbackText}>{avatarInitial}</Text>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.photoPickerButton} onPress={onPickPhoto}>
        <Text style={styles.photoPickerButtonText}>
          {hasValidPhoto ? t('profile.changePhotoButton') : t('profile.choosePhotoButton')}
        </Text>
      </TouchableOpacity>
      <Text style={styles.photoPickerHint}>
        {hasValidPhoto ? t('profile.photoSelectedMessage') : t('profile.photoSourceHint')}
      </Text>

      <Text style={styles.label}>{t('profile.nameLabel')}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="John Doe"
      />

      <Text style={styles.label}>{t('profile.emailLabel')}</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="john@email.com"
      />

      <Text style={styles.label}>{t('profile.phoneLabel')}</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="5512345678"
      />

      <Text style={styles.label}>{t('profile.genderLabel')}</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={gender} onValueChange={value => setGender(value)}>
          {GENDER_OPTIONS.map(option => (
            <Picker.Item
              key={option.translationKey}
              label={t(option.translationKey)}
              value={option.value}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>{t('profile.languageLabel')}</Text>
      <View style={styles.genderRow}>
        <TouchableOpacity
          style={[
            styles.genderChip,
            i18n.language.startsWith('es') && styles.genderChipSelected,
          ]}
          onPress={() => i18n.changeLanguage('es')}
        >
          <Text
            style={[
              styles.genderChipText,
              i18n.language.startsWith('es') && styles.genderChipTextSelected,
            ]}
          >
            {t('profile.languageSpanish')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderChip,
            i18n.language.startsWith('en') && styles.genderChipSelected,
          ]}
          onPress={() => i18n.changeLanguage('en')}
        >
          <Text
            style={[
              styles.genderChipText,
              i18n.language.startsWith('en') && styles.genderChipTextSelected,
            ]}
          >
            {t('profile.languageEnglish')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>{t('profile.saveButton')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('TripHistory')}
      >
        <Text style={styles.historyButtonText}>{t('profile.viewTripHistory')}</Text>
      </TouchableOpacity>

      {hasActiveProfile && (
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>{t('profile.logoutButton')}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>{t('profile.summaryTitle')}</Text>
        <Text style={styles.previewText}>
          {t('profile.photoLabel')}: {photo.trim() || t('common.notAvailable')}
        </Text>
        <Text style={styles.previewText}>
          {t('profile.nameLabel')}: {name.trim() || t('common.notAvailable')}
        </Text>
        <Text style={styles.previewText}>
          {t('profile.emailLabel')}: {email.trim() || t('common.notAvailable')}
        </Text>
        <Text style={styles.previewText}>
          {t('profile.phoneLabel')}: {phone.trim() || t('common.notAvailable')}
        </Text>
        <Text style={styles.previewText}>
          {t('profile.genderLabel')}: {gender ? t(`profile.${gender}`) : t('common.notAvailable')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 34,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 14,
    color: '#111827',
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  photoSection: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  photoOuterRing: {
    width: 126,
    height: 126,
    borderRadius: 63,
    padding: 4,
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  photoInnerCircle: {
    flex: 1,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPreview: {
    width: 118,
    height: 118,
    borderRadius: 59,
  },
  photoFallbackText: {
    fontSize: 44,
    fontWeight: '700',
    color: '#3730A3',
  },
  photoPickerButton: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 10,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  photoPickerButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  photoPickerHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  genderChip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  genderChipSelected: {
    borderColor: '#111827',
    backgroundColor: '#EEF2FF',
  },
  genderChipText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  genderChipTextSelected: {
    color: '#111827',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#111827',
    borderRadius: 12,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  historyButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 15,
  },
  logoutButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#B91C1C',
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  logoutButtonText: {
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: 15,
  },
  previewCard: {
    marginTop: 18,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    shadowColor: '#111827',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
});

export default ProfileScreen;
