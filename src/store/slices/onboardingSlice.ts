import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selections: {},
  currentStep: 0,
  isLoading: false,
  isComplete: true,
  error: null,
  dataLoaded: false,
  progress: 0,
  activeStepIds: [],
  completedSteps: 0,
  isSaving: false,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {},
});

export const selectSelections = () => ({} as any);
export const selectCurrentStep = () => 0;
export const selectIsLoading = () => false;
export const selectIsComplete = () => true;
export const selectError = () => null;
export const selectDataLoaded = () => false;
export const selectTempSelections = () => ({});
export const selectProgress = () => 0;
export const selectActiveStepIds = () => [];
export const selectCompletedSteps = () => 0;
export const selectIsSaving = () => false;
export const selectHasOnboarding = () => true;
export const loadOnboarding = () => ({ type: 'onboarding/load' });
export const saveOnboarding = () => ({ type: 'onboarding/save' });
export const setCurrentStep = (step: number) => ({
  type: 'onboarding/setCurrentStep',
  payload: step,
});
export const updateSelection = (payload: any) => ({
  type: 'onboarding/updateSelection',
  payload,
});
export const updateTempSelections = (payload: any) => ({
  type: 'onboarding/updateTempSelections',
  payload,
});
export const clearTempSelections = () => ({
  type: 'onboarding/clearTempSelections',
});
export const setActiveStepIds = (payload: any) => ({
  type: 'onboarding/setActiveStepIds',
  payload,
});
export const resetOnboarding = () => ({ type: 'onboarding/resetOnboarding' });
export const clearError = () => ({ type: 'onboarding/clearError' });

export default onboardingSlice.reducer;
