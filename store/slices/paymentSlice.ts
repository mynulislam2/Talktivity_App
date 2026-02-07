/**
 * Payment Slice
 * 
 * Manages payment state globally using Redux Toolkit.
 * Handles payment creation and redirects.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { paymentService, CreatePaymentRequest, CreatePaymentResponse } from '@/service/PaymentService';

// Define the state interface
interface PaymentState {
  creating: boolean;
  error: string | null;
  paymentUrl: string | null;
  transactionId: string | null;
  orderId: string | null;
}

// Initial state
const initialState: PaymentState = {
  creating: false,
  error: null,
  paymentUrl: null,
  transactionId: null,
  orderId: null,
};

// Async thunk for creating payment
export const createPayment = createAsyncThunk(
  'payment/createPayment',
  async (data: CreatePaymentRequest, { rejectWithValue }) => {
    try {
      const response = await paymentService.createPayment(data);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to create payment');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create payment');
    }
  }
);

// Create the slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPayment: (state) => {
      state.creating = false;
      state.error = null;
      state.paymentUrl = null;
      state.transactionId = null;
      state.orderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle createPayment
      .addCase(createPayment.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action: PayloadAction<CreatePaymentResponse['data']>) => {
        state.creating = false;
        if (action.payload) {
          state.paymentUrl = action.payload.paymentUrl;
          state.transactionId = action.payload.transactionId;
          state.orderId = action.payload.orderId;
        }
        state.error = null;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string || 'Failed to create payment';
      });
  },
});

// Export actions
export const { clearError, resetPayment } = paymentSlice.actions;

// Export selectors
export const selectPaymentCreating = (state: { payment: PaymentState }) => state.payment.creating;
export const selectPaymentError = (state: { payment: PaymentState }) => state.payment.error;
export const selectPaymentUrl = (state: { payment: PaymentState }) => state.payment.paymentUrl;
export const selectTransactionId = (state: { payment: PaymentState }) => state.payment.transactionId;
export const selectOrderId = (state: { payment: PaymentState }) => state.payment.orderId;

export default paymentSlice.reducer;
