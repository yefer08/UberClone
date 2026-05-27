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
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import { setUserProfile } from '../store/slices/userSlice';

const GENDER_OPTIONS = [
  { value: '', translationKey: 'profile.genderPlaceholder' },
  { value: 'male', translationKey: 'profile.male' },
  { value: 'female', translationKey: 'profile.female' },
  { value: 'other', translationKey: 'profile.other' },
];

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
  const hasValidPhoto = /^https?:\/\//i.test(photo.trim());
  const avatarInitial = (name.trim().charAt(0) || '?').toUpperCase();

  /**
   * Validates all form fields and dispatches the updated profile to Redux.
   * Shows an Alert for the first validation error found.
   */
  const onSave = () => {
    if (!photo.trim() || !name.trim() || !email.trim() || !phone.trim() || !gender) {
      Alert.alert(t('profile.validationTitle'), t('profile.requiredFields'));
      return;
    }

    if (!/^https?:\/\//i.test(photo.trim())) {
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

    dispatch(
      setUserProfile({
        photo: photo.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gender,
      }),
    );

    Alert.alert(t('profile.savedTitle'), t('profile.savedMessage'));
  };

  return (
    <View style={styles.container}>
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

      <TextInput
        style={[styles.input, styles.photoInput]}
        value={photo}
        onChangeText={setPhoto}
        autoCapitalize="none"
        placeholder={t('profile.photoPlaceholder')}
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 18,
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
  photoInput: {
    marginTop: 2,
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
    paddingVertical: 14,
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 15,
  },
  previewCard: {
    marginTop: 18,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
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
