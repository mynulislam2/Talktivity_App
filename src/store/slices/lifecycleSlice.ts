import { createSlice } from '@reduxjs/toolkit';

interface LifecycleState {
  data: null;
  loading: boolean;
}

const initialState: LifecycleState = {
  data: null,
  loading: false,
};

const lifecycleSlice = createSlice({
  name: 'lifecycle',
  initialState,
  reducers: {
    clearError: () => {},
    resetLifecycle: () => {},
  },
});

export const { clearError, resetLifecycle } = lifecycleSlice.actions;
export const selectLifecycleData = () => null;
export const selectLifecycleLoading = () => false;
export const selectLifecycleError = () => null;
export const selectHasOnboarding = () => true;
export const selectCallCompleted = () => false;
export const selectReportCompleted = () => false;
export const selectUpgradeCompleted = () => false;
export const selectHasConversationExperience = () => false;
export const selectHasSubscription = () => false;
export const selectProfileCompleted = () => false;
export const loadLifecycle = () => ({ type: 'lifecycle/load' });
export const updateLifecycle = (updates?: any) => ({
  type: 'lifecycle/update',
  payload: updates,
});

export default lifecycleSlice.reducer;
