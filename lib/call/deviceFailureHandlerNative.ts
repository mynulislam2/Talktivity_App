/**
 * Device Failure Handler (React Native)
 * 
 * Utility function to handle media device failures.
 * Provides consistent error logging and user notifications.
 */

import { Alert } from 'react-native';

/**
 * Handle media device failure
 * 
 * @param error - Media device failure error (optional)
 */
export function handleDeviceFailure(error?: any): void {
  Alert.alert(
    'Device Error',
    "Error accessing camera or microphone. Please ensure you've granted the necessary permissions."
  );
}
