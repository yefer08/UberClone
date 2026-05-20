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
 *
 * TODO: Add bilingual ES/EN support.
 */
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setUserProfile } from '../store/slices/userSlice';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

/**
 * ProfileScreen component.
 * Pre-fills fields with the current values stored in the Redux user slice.
 * On save, validates all fields and dispatches the updated profile.
 */
function ProfileScreen() {
  const dispatch = useDispatch();
  // Read current profile values from Redux to pre-fill the form
  const user = useSelector(state => state.user);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [gender, setGender] = useState(user.gender);

  /**
   * Validates all form fields and dispatches the updated profile to Redux.
   * Shows an Alert for the first validation error found.
   */
  const onSave = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !gender) {
      Alert.alert('Validation', 'All fields are required.');
      return;
    }

    if (name.length > 50) {
      Alert.alert('Validation', 'Name must be 50 characters or less.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Validation', 'Enter a valid email address.');
      return;
    }

    if (!/^\d+$/.test(phone)) {
      Alert.alert('Validation', 'Phone must be numeric.');
      return;
    }

    dispatch(
      setUserProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gender,
      }),
    );

    Alert.alert('Saved', 'Profile updated successfully.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="John Doe"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="john@email.com"
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="5512345678"
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderRow}>
        {GENDER_OPTIONS.map(option => {
          const isSelected = option.value === gender;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.genderChip, isSelected && styles.genderChipSelected]}
              onPress={() => setGender(option.value)}
            >
              <Text style={[styles.genderChipText, isSelected && styles.genderChipTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>
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
});

export default ProfileScreen;
