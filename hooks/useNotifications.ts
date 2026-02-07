/**
 * useNotifications Hook
 *
 * Manages push notifications for the app
 * Uses expo-notifications for React Native
 */

import { useCallback, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
}

interface UseNotificationsReturn {
  isEnabled: boolean;
  requestPermissions: () => Promise<boolean>;
  sendLocalNotification: (payload: NotificationPayload, delaySeconds?: number) => Promise<void>;
  toggleNotifications: () => Promise<void>;
}

/**
 * Hook for managing push notifications
 */
export const useNotifications = (): UseNotificationsReturn => {
  const notificationListenerRef = useRef<any>(null);
  const responseListenerRef = useRef<any>(null);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }, []);

  /**
   * Send a local notification
   */
  const sendLocalNotification = useCallback(
    async (payload: NotificationPayload, delaySeconds: number = 0) => {
      try {
        // Check if notifications are enabled
        const enabled = await AsyncStorage.getItem('notificationsEnabled');
        if (enabled === 'false') {
          return;
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: payload.title,
            body: payload.body,
            data: payload.data || {},
            badge: payload.badge,
            sound: payload.sound || 'default',
          },
          trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
        });

        console.log(`Notification scheduled: ${notificationId}`);
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    },
    [],
  );

  /**
   * Toggle notifications on/off
   */
  const toggleNotifications = useCallback(async () => {
    try {
      const enabled = await AsyncStorage.getItem('notificationsEnabled');
      const newState = enabled === 'true' ? 'false' : 'true';
      await AsyncStorage.setItem('notificationsEnabled', newState);
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    }
  }, []);

  /**
   * Get notification enabled state
   */
  const getIsEnabled = useCallback(async (): Promise<boolean> => {
    try {
      const enabled = await AsyncStorage.getItem('notificationsEnabled');
      return enabled !== 'false'; // Default to true
    } catch (error) {
      console.error('Failed to get notification state:', error);
      return true;
    }
  }, []);

  // Setup notification listeners on mount
  useEffect(() => {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Listen to notifications when app is in foreground
    notificationListenerRef.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        console.log('Notification received in foreground:', _notification);
      },
    );

    // Listen for notification taps
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response.notification.request.content.data);
        // Handle notification tap (navigate, etc.)
      },
    );

    // Cleanup listeners on unmount
    return () => {
      if (notificationListenerRef.current) {
        Notifications.removeNotificationSubscription(notificationListenerRef.current);
      }
      if (responseListenerRef.current) {
        Notifications.removeNotificationSubscription(responseListenerRef.current);
      }
    };
  }, []);

  // Get initial enabled state
  const isEnabled = true; // TODO: Fetch from AsyncStorage on mount

  return {
    isEnabled,
    requestPermissions,
    sendLocalNotification,
    toggleNotifications,
  };
};

export default useNotifications;
