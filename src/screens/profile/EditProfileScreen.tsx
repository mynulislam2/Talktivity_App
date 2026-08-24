/**
 * Edit Profile Screen (React Native)
 *
 * Editable profile fields with bottom sheet selector — matches frontend.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authService } from '@/services/auth';
import { profileService } from '@/services/profile';
import { lifecycleService } from '@/services/lifecycle';
import { onboardingService } from '@/services/onboarding';
import {
  DISPLAY_LANGUAGE_OPTIONS,
  DisplayLanguage,
  getDisplayLanguage,
  setDisplayLanguage,
} from '@/lib/preferences/userExperiencePreferences';
import { AppBackground } from '../../components/common/AppBackground';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

type EditableFieldKey =
  | 'fullName'
  | 'nativeLanguage'
  | 'displayLanguage'
  | 'currentLevel'
  | 'tutorStyle';

interface EditableFieldConfig {
  key: EditableFieldKey;
  label: string;
  description: string;
  multi?: boolean;
  options?: { value: string; label: string }[];
}

const NATIVE_LANGUAGE_OPTIONS = [
  { value: 'spanish', label: 'Spanish' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'russian', label: 'Russian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'turkish', label: 'Turkish' },
];

const CURRENT_LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'upper', label: 'Upper-Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const TUTOR_STYLE_OPTIONS = [
  { value: 'encouraging', label: 'Encouraging' },
  { value: 'strict', label: 'Strict' },
  { value: 'fun', label: 'Fun & Casual' },
  { value: 'academic', label: 'Academic' },
  { value: 'business', label: 'Business' },
];

const DISPLAY_LANGUAGE_FIELD_OPTIONS = DISPLAY_LANGUAGE_OPTIONS.map((opt) => ({
  value: opt,
  label: opt,
}));

const FIELD_CONFIGS: EditableFieldConfig[] = [
  {
    key: 'fullName',
    label: 'User Name',
    description: 'Update the display name that appears across your profile.',
  },
  {
    key: 'nativeLanguage',
    label: 'Mother Tongue',
    description:
      'Keep your learning profile accurate with your native language.',
    options: NATIVE_LANGUAGE_OPTIONS,
  },
  {
    key: 'displayLanguage',
    label: 'Display Language',
    description: 'Choose the language label you want to see in your interface.',
    options: DISPLAY_LANGUAGE_FIELD_OPTIONS,
  },
  {
    key: 'currentLevel',
    label: 'Current Level',
    description:
      'This keeps your daily plan aligned with your confidence level.',
    options: CURRENT_LEVEL_OPTIONS,
  },
  {
    key: 'tutorStyle',
    label: 'AI Tutor',
    description: 'Choose the coaching style you want Aleena to lean into.',
    options: TUTOR_STYLE_OPTIONS,
    multi: true,
  },
];

function getOptionLabel(
  options: { value: string; label: string }[] | undefined,
  value: string | null | undefined
) {
  if (!value) return 'Not set';
  return options?.find((o) => o.value === value)?.label || value;
}

function getTutorStyleLabel(values: string[]) {
  if (!values.length) return 'Not set';
  return values
    .map((v) => TUTOR_STYLE_OPTIONS.find((o) => o.value === v)?.label || v)
    .join(', ');
}

interface ProfileData {
  full_name?: string;
  startingLevel?: string;
  [key: string]: any;
}

interface UserSelections {
  nativeLanguage?: string | null;
  currentLevel?: string | null;
  tutorStyle?: string[];
  [key: string]: any;
}

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [selections, setSelections] = useState<UserSelections | null>(null);
  const insets = useSafeAreaInsets();
  const [displayLanguageState, setDisplayLanguageStateState] =
    useState<DisplayLanguage>('English');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<EditableFieldKey | null>(null);
  const [draftValue, setDraftValue] = useState<string>('');
  const [draftMultiValue, setDraftMultiValue] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const lang = await getDisplayLanguage();
      setDisplayLanguageStateState(lang);
    })();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadProfileState = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileResponse, lifecycleResponse] = await Promise.all([
          profileService.getProfile(),
          lifecycleService.getLifecycle(),
        ]);
        if (!isMounted) return;

        if (!profileResponse.success || !profileResponse.data) {
          throw new Error(
            profileResponse.error || 'Unable to load profile details.'
          );
        }
        if (!lifecycleResponse.success || !lifecycleResponse.data) {
          throw new Error('Unable to load onboarding details.');
        }

        setProfile(profileResponse.data);
        const lcData = lifecycleResponse.data as any;
        const onboardingData = (lcData?.onboarding?.data || {}) as Record<
          string,
          unknown
        >;
        setSelections({
          nativeLanguage:
            typeof onboardingData.native_language === 'string'
              ? onboardingData.native_language
              : null,
          currentLevel:
            typeof onboardingData.current_level === 'string'
              ? onboardingData.current_level
              : null,
          tutorStyle: Array.isArray(onboardingData.tutor_style)
            ? onboardingData.tutor_style.filter(
              (s): s is string => typeof s === 'string'
            )
            : typeof onboardingData.tutor_style === 'string'
              ? [onboardingData.tutor_style]
              : [],
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load profile details.'
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProfileState();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeConfig = useMemo(
    () => FIELD_CONFIGS.find((f) => f.key === activeField) || null,
    [activeField]
  );

  const fieldValues = useMemo(
    () => ({
      fullName: profile?.full_name?.trim() || 'Not set',
      nativeLanguage: getOptionLabel(
        FIELD_CONFIGS.find((f) => f.key === 'nativeLanguage')?.options,
        selections?.nativeLanguage
      ),
      displayLanguage: displayLanguageState,
      currentLevel: getOptionLabel(
        FIELD_CONFIGS.find((f) => f.key === 'currentLevel')?.options,
        selections?.currentLevel
      ),
      tutorStyle: getTutorStyleLabel(selections?.tutorStyle || []),
    }),
    [displayLanguageState, profile, selections]
  );

  const openEditor = useCallback(
    (fieldKey: EditableFieldKey) => {
      setFeedback(null);
      setError(null);
      setActiveField(fieldKey);
      if (fieldKey === 'fullName') {
        setDraftValue(profile?.full_name || '');
        setDraftMultiValue([]);
      } else if (fieldKey === 'displayLanguage') {
        setDraftValue(displayLanguageState);
        setDraftMultiValue([]);
      } else if (fieldKey === 'nativeLanguage') {
        setDraftValue(selections?.nativeLanguage || '');
        setDraftMultiValue([]);
      } else if (fieldKey === 'currentLevel') {
        setDraftValue(selections?.currentLevel || '');
        setDraftMultiValue([]);
      } else {
        setDraftValue('');
        setDraftMultiValue(selections?.tutorStyle || []);
      }
    },
    [profile, displayLanguageState, selections]
  );

  const closeEditor = useCallback(() => {
    if (isSaving) return;
    setActiveField(null);
  }, [isSaving]);

  const saveField = useCallback(async () => {
    if (!activeField) return;
    setIsSaving(true);
    setError(null);
    setFeedback(null);

    try {
      if (activeField === 'fullName') {
        const normalizedFullName = draftValue.trim().replace(/\s+/g, ' ');
        if (normalizedFullName.length < 2)
          throw new Error('Full name must be at least 2 characters.');
        const response = await profileService.updateProfile({
          full_name: normalizedFullName,
        });
        if (!response.success || !response.data)
          throw new Error(response.error || 'Failed to update profile.');
        setProfile(response.data);
        setFeedback('Profile name updated.');
      } else if (activeField === 'displayLanguage') {
        await setDisplayLanguage(draftValue as DisplayLanguage);
        setDisplayLanguageStateState(draftValue as DisplayLanguage);
        setFeedback('Display language updated.');
      } else {
        if (!selections) throw new Error('Profile details are still loading.');
        const updatedSelections: UserSelections = {
          ...selections,
          nativeLanguage:
            activeField === 'nativeLanguage'
              ? draftValue || null
              : selections.nativeLanguage,
          currentLevel:
            activeField === 'currentLevel'
              ? draftValue || null
              : selections.currentLevel,
          tutorStyle:
            activeField === 'tutorStyle'
              ? draftMultiValue
              : selections.tutorStyle,
        };
        const authUser = authService.getUser();
        const userId = (authUser as any)?.id
          ? String((authUser as any).id)
          : undefined;
        await onboardingService.saveOnboarding(updatedSelections, userId);
        setSelections(updatedSelections);
        setFeedback(`${activeConfig?.label || 'Profile'} updated.`);
      }
      setActiveField(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Failed to save changes.'
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    activeField,
    draftValue,
    draftMultiValue,
    selections,
    activeConfig,
    profile,
  ]);

  return (
    <AppBackground>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit your profile</Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {feedback && (
            <View style={styles.feedbackBanner}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          )}

          {error && activeField === null && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <View style={styles.fieldsContainer}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={styles.skeletonField} />
              ))
            ) : (
              <>
                {FIELD_CONFIGS.map((config) => (
                  <TouchableOpacity
                    key={config.key}
                    style={styles.fieldCard}
                    onPress={() => openEditor(config.key)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.fieldCardText}>
                      <Text style={styles.fieldCardLabel}>{config.label}</Text>
                      <Text style={styles.fieldCardValue} numberOfLines={1}>
                        {fieldValues[config.key]}
                      </Text>
                    </View>
                    <View style={styles.fieldCardAction}>
                      <Ionicons name="pencil" size={18} color="#2879ff" />
                      <Text style={styles.fieldCardEditText}>Edit</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </ScrollView>

        {/* Bottom Sheet Editor */}
        {activeConfig && (
          <Modal
            visible={!!activeField}
            transparent
            animationType="slide"
            onRequestClose={closeEditor}
          >
            <Pressable style={styles.overlay} onPress={closeEditor}>
              <Pressable
                style={styles.bottomSheet}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetHeaderText}>
                    <Text style={styles.sheetTitle}>
                      Edit {activeConfig.label}
                    </Text>
                    <Text style={styles.sheetDescription}>
                      {activeConfig.description}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={closeEditor}
                    style={styles.sheetClose}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>

                {error && (
                  <View style={styles.sheetError}>
                    <Text style={styles.sheetErrorText}>{error}</Text>
                  </View>
                )}

                <ScrollView
                  style={styles.sheetOptions}
                  showsVerticalScrollIndicator={false}
                >
                  {activeField === 'fullName' ? (
                    <View>
                      <Text style={styles.inputLabel}>Display name</Text>
                      <TextInput
                        style={styles.textInput}
                        value={draftValue}
                        onChangeText={setDraftValue}
                        placeholder="Type your name"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        maxLength={80}
                        autoFocus
                      />
                    </View>
                  ) : activeConfig.multi ? (
                    <View style={styles.pillsContainer}>
                      {activeConfig.options?.map((option) => {
                        const active = draftMultiValue.includes(option.value);
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[styles.pill, active && styles.pillActive]}
                            onPress={() =>
                              setDraftMultiValue((prev) =>
                                active
                                  ? prev.filter((v) => v !== option.value)
                                  : [...prev, option.value]
                              )
                            }
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                active && styles.pillTextActive,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={styles.optionsList}>
                      {activeConfig.options?.map((option) => {
                        const active = draftValue === option.value;
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.optionItem,
                              active && styles.optionItemActive,
                            ]}
                            onPress={() => setDraftValue(option.value)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                active && styles.optionTextActive,
                              ]}
                            >
                              {option.label}
                            </Text>
                            {active && (
                              <Ionicons name="checkmark" size={18} color="#fff" />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </ScrollView>

                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={closeEditor}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      (isSaving ||
                        (activeConfig.multi
                          ? draftMultiValue.length === 0
                          : draftValue.trim().length === 0)) &&
                      styles.saveBtnDisabled,
                    ]}
                    onPress={saveField}
                    disabled={
                      isSaving ||
                      (activeConfig.multi
                        ? draftMultiValue.length === 0
                        : draftValue.trim().length === 0)
                    }
                    activeOpacity={0.7}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </SafeAreaView>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  feedbackBanner: {
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.2)',
    borderRadius: 6,
    backgroundColor: 'rgba(52,211,153,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: '#a7f3d0',
  },
  errorBanner: {
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.2)',
    borderRadius: 6,
    backgroundColor: 'rgba(244,63,94,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  errorBannerText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: '#fca5a5',
  },
  fieldsContainer: {
    gap: 12,
    marginTop: 16,
  },
  skeletonField: {
    height: 78,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#636363',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderWidth: 1,
    borderColor: '#636363',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 16,
  },
  fieldCardText: {
    flex: 1,
    minWidth: 0,
  },
  fieldCardLabel: {
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: '#c6c6c6',
  },
  fieldCardValue: {
    fontSize: 16,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 22,
    color: '#fdfdfd',
    marginTop: 4,
  },
  fieldCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fieldCardEditText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    lineHeight: 22,
    color: '#2879ff',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(9,7,20,0.7)',
  },
  bottomSheet: {
    backgroundColor: '#171a31',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -24 },
    shadowOpacity: 0.4,
    shadowRadius: 60,
    elevation: 15,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  sheetHeaderText: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 24,
    color: '#fff',
  },
  sheetDescription: {
    fontSize: 13,
    fontFamily: 'Poppins',
    lineHeight: 19,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  sheetClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetError: {
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.2)',
    borderRadius: 10,
    backgroundColor: 'rgba(244,63,94,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  sheetErrorText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: '#fca5a5',
  },
  sheetOptions: {
    maxHeight: '45%',
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#fff',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  pillActive: {
    backgroundColor: 'rgba(41,73,255,1)',
    borderColor: 'transparent',
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    lineHeight: 18,
    color: '#c6c6c6',
  },
  pillTextActive: {
    color: '#fff',
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  optionItemActive: {
    backgroundColor: 'rgba(41,73,255,1)',
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Poppins',
    lineHeight: 21,
    color: 'rgba(255,255,255,0.8)',
  },
  optionTextActive: {
    color: '#fff',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: 'rgba(41,73,255,1)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.55,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
});

export default EditProfileScreen;
