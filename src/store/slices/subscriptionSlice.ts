import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  subscriptionService,
  SubscriptionPlan,
  SubscriptionStatus,
  FreeTrialResponse,
} from '@/services/subscription';

interface SubscriptionState {
  plans: SubscriptionPlan[];
  currentSubscription: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  startingTrial: boolean;
  loadingStatus: boolean;
  errorStatus: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  currentSubscription: null,
  loading: false,
  error: null,
  startingTrial: false,
  loadingStatus: false,
  errorStatus: null,
};

export const loadPlans = createAsyncThunk(
  'subscription/loadPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getPlans();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to load plans');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load plans');
    }
  }
);

export const loadSubscriptionStatus = createAsyncThunk(
  'subscription/loadSubscriptionStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.getSubscriptionStatus();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(
          response.error || 'Failed to load subscription status'
        );
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to load subscription status'
      );
    }
  }
);

export const startFreeTrial = createAsyncThunk(
  'subscription/startFreeTrial',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subscriptionService.startFreeTrial();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to start free trial');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to start free trial');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.errorStatus = null;
    },
    resetSubscription: (state) => {
      state.plans = [];
      state.currentSubscription = null;
      state.loading = false;
      state.error = null;
      state.startingTrial = false;
      state.loadingStatus = false;
      state.errorStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loadPlans.fulfilled,
        (state, action: PayloadAction<SubscriptionPlan[]>) => {
          state.loading = false;
          state.plans = action.payload;
          state.error = null;
        }
      )
      .addCase(loadPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load plans';
      })
      .addCase(loadSubscriptionStatus.pending, (state) => {
        state.loadingStatus = true;
        state.errorStatus = null;
      })
      .addCase(
        loadSubscriptionStatus.fulfilled,
        (state, action: PayloadAction<SubscriptionStatus>) => {
          state.loadingStatus = false;
          state.currentSubscription = action.payload;
          state.errorStatus = null;
        }
      )
      .addCase(loadSubscriptionStatus.rejected, (state, action) => {
        state.loadingStatus = false;
        state.errorStatus =
          (action.payload as string) || 'Failed to load subscription status';
      })
      .addCase(startFreeTrial.pending, (state) => {
        state.startingTrial = true;
        state.error = null;
      })
      .addCase(
        startFreeTrial.fulfilled,
        (state, action: PayloadAction<FreeTrialResponse['data']>) => {
          state.startingTrial = false;
          if (action.payload && state.currentSubscription) {
            state.currentSubscription = {
              ...state.currentSubscription,
              active: true,
              subscription: action.payload.subscription,
            };
          }
          state.error = null;
        }
      )
      .addCase(startFreeTrial.rejected, (state, action) => {
        state.startingTrial = false;
        state.error =
          (action.payload as string) || 'Failed to start free trial';
      });
  },
});

export const { clearError, resetSubscription } = subscriptionSlice.actions;

export const selectPlans = (state: { subscription: SubscriptionState }) =>
  state.subscription.plans;
export const selectCurrentSubscription = (state: {
  subscription: SubscriptionState;
}) => state.subscription.currentSubscription;
export const selectSubscriptionLoading = (state: {
  subscription: SubscriptionState;
}) => state.subscription.loading;
export const selectSubscriptionError = (state: {
  subscription: SubscriptionState;
}) => state.subscription.error;
export const selectStartingTrial = (state: {
  subscription: SubscriptionState;
}) => state.subscription.startingTrial;
export const selectSubscriptionStatusLoading = (state: {
  subscription: SubscriptionState;
}) => state.subscription.loadingStatus;
export const selectSubscriptionStatusError = (state: {
  subscription: SubscriptionState;
}) => state.subscription.errorStatus;
export const selectCanStartFreeTrial = (state: {
  subscription: SubscriptionState;
}) => state.subscription.currentSubscription?.canStartFreeTrial ?? false;

export default subscriptionSlice.reducer;
