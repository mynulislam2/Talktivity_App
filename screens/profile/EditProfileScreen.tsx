/**
 * Edit Profile Screen
 * 
 * Form for editing user profile information including avatar, name, bio, etc.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadProfile, updateProfile, selectProfile, selectProfileLoading, selectProfileError } from '../../store/slices/profileSlice';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface EditProfileScreenProps {
  navigation: any;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const isSaving = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    bio: '',
    phoneNumber: '',
    country: '',
    preferredLevel: '',
  });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load profile on mount
  useEffect(() => {
    dispatch(loadProfile());
  }, [dispatch]);

  // Initialize form with Redux profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        username: profile.username || '',
        bio: profile.bio || '',
        phoneNumber: profile.phoneNumber || '',
        country: profile.country || '',
        preferredLevel: profile.preferredLevel || '',
      });
      setAvatarUri(profile.avatar || null);
    }
  }, [profile]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setAvatarUri(imageUri);
        // TODO: Upload avatar to backend
        // dispatch(updateProfileAvatar(imageUri));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(updateProfile(formData)).unwrap();
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Update error:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Text style={styles.avatarPlaceholder}>
                {formData.fullName.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Ionicons
                name="person"
                size={48}
                color="#fff"
              />
            )}
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={handlePickAvatar}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Tap to change avatar</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              editable={!isSaving}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              editable={!isSaving}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              placeholder="Choose a username"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              editable={!isSaving}
              autoCapitalize="none"
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
          </View>

          {/* Bio */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about yourself"
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              editable={!isSaving}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>
              {formData.bio.length}/500
            </Text>
            {errors.bio && (
              <Text style={styles.errorText}>{errors.bio}</Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input]}
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              editable={!isSaving}
              keyboardType="phone-pad"
            />
          </View>

          {/* Country */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={[styles.input]}
              placeholder="Enter your country"
              value={formData.country}
              onChangeText={(value) => handleInputChange('country', value)}
              editable={!isSaving}
            />
          </View>

          {/* Preferred Level */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Preferred Level</Text>
            <View style={styles.levelButtonsGroup}>
              {levelOptions.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelButton,
                    formData.preferredLevel === level && styles.levelButtonActive,
                  ]}
                  onPress={() => handleInputChange('preferredLevel', level)}
                  disabled={isSaving}
                >
                  <Text
                    style={[
                      styles.levelButtonText,
                      formData.preferredLevel === level && styles.levelButtonTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  formSection: {
    paddingHorizontal: spacing.lg,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: '#FFF5F5',
  },
  bioInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  levelButtonsGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  levelButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  levelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  levelButtonTextActive: {
    color: colors.primary,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default EditProfileScreen;
