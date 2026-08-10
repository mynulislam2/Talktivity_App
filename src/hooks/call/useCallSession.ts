import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authService } from '@/services/auth';
import {
  setAgentState,
  setConnectionDetails,
  selectSessionState,
  selectConnectionDetails,
} from '@/store/slices/callSlice';
import { useCallStatus } from './useCallStatus';
import { connectionDetailsService } from '@/services/livekit/ConnectionDetailsService';

export function useCallSession() {
  const dispatch = useAppDispatch();
  const sessionState = useAppSelector(selectSessionState);
  const connectionDetails = useAppSelector(selectConnectionDetails);
  const { canStartCall } = useCallStatus();
  const connectionDetailsRef = useRef(connectionDetails);

  useEffect(() => {
    connectionDetailsRef.current = connectionDetails;
  }, [connectionDetails]);

  const endSession = useCallback(async () => {
    dispatch(setAgentState('disconnected'));
    dispatch(setConnectionDetails(null));
  }, [dispatch]);

  const startSession = useCallback(async () => {
    if (!canStartCall) {
      throw new Error('Cannot start call - lifetime limit reached');
    }

    const currentUser = await authService.getUser();
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    dispatch(setAgentState('connecting'));

    try {
      const details = await connectionDetailsService.getConnectionDetails({
        userId: Number(userId),
        sessionType: 'call',
      });

      dispatch(setConnectionDetails(details));
    } catch (error) {
      dispatch(setAgentState('disconnected'));
      dispatch(setConnectionDetails(null));
      throw error;
    }
  }, [canStartCall, dispatch, endSession]);

  const updateAgentState = useCallback(
    (state: string) => {
      dispatch(setAgentState(state as any));
    },
    [dispatch]
  );

  return {
    sessionState,
    connectionDetails,
    startSession,
    endSession,
    updateAgentState,
  };
}
