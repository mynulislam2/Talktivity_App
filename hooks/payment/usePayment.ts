/**
 * usePayment Hook
 * 
 * Handles payment creation and redirects to payment gateway.
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createPayment,
  selectPaymentCreating,
  selectPaymentError,
  selectPaymentUrl,
} from '@/store/slices/paymentSlice';
import { CreatePaymentRequest } from '@/service/PaymentService';

export interface UsePaymentReturn {
  createPaymentRequest: (data: CreatePaymentRequest) => Promise<void>;
  creating: boolean;
  error: string | null;
  paymentUrl: string | null;
}

export function usePayment(): UsePaymentReturn {
  const dispatch = useAppDispatch();
  const creating = useAppSelector(selectPaymentCreating);
  const error = useAppSelector(selectPaymentError);
  const paymentUrl = useAppSelector(selectPaymentUrl);

  const createPaymentRequest = useCallback(async (data: CreatePaymentRequest) => {
    const result = await dispatch(createPayment(data));
    
    if (createPayment.fulfilled.match(result)) {
      // Redirect to payment gateway if URL is available
      if (result.payload?.paymentUrl) {
        window.location.href = result.payload.paymentUrl;
      }
    } else {
      // Error is already set in Redux state
      // Failed to create payment
    }
  }, [dispatch]);

  return {
    createPaymentRequest,
    creating,
    error,
    paymentUrl,
  };
}
