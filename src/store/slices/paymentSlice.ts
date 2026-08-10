import { createSlice } from '@reduxjs/toolkit';

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    creating: false,
    error: null,
    paymentUrl: null,
    transactionId: null,
    orderId: null,
  },
  reducers: {
    clearError: () => {},
    resetPayment: () => {},
  },
});

export const { clearError, resetPayment } = paymentSlice.actions;
export const createPayment = (data: any) => ({
  type: 'payment/createPayment',
  payload: data,
});
export const selectPaymentCreating = () => false;
export const selectPaymentError = () => null;
export const selectPaymentUrl = () => null;
export const selectTransactionId = () => null;
export const selectOrderId = () => null;

export default paymentSlice.reducer;
