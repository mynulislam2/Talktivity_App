/**
 * Device Failure Handler
 * 
 * Utility function to handle media device failures.
 * Provides consistent error logging and user notifications.
 */

import { MediaDeviceFailure } from 'livekit-client';
import { toast } from 'react-toastify';

/**
 * Handle media device failure
 * 
 * @param error - Media device failure error (optional)
 */
export function handleDeviceFailure(error?: MediaDeviceFailure): void {
  // Media device failure
  toast.error("Error accessing camera or microphone. Please ensure you've granted the necessary permissions.", {
    autoClose: 5000,
  });
}
