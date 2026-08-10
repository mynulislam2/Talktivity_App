/**
 * Alert Manager
 *
 * Global alert manager that can be called from anywhere in the app
 * Not tied to React Context, works with error handler and other utilities
 */

import { AlertConfig, AlertType } from '@/contexts/AlertContext';
import { AlertButton } from '@/components/shared/ThemedAlert';

type AlertCallback = (config: AlertConfig) => void;

class AlertManager {
  private static instance: AlertManager;
  private showAlertCallback: AlertCallback | null = null;

  private constructor() {}

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  /**
   * Register the alert callback from AlertProvider
   * Called during app initialization
   */
  setAlertCallback(callback: AlertCallback) {
    this.showAlertCallback = callback;
  }

  /**
   * Show an alert globally
   * Can be called from anywhere: errorHandler, services, utils, etc.
   */
  showAlert(
    title: string,
    message: string,
    type: AlertType = 'info',
    buttons?: AlertButton[]
  ) {
    if (!this.showAlertCallback) {
      console.warn(
        '[AlertManager] No alert callback registered. Make sure AlertProvider is initialized.'
      );
      return;
    }

    const config: AlertConfig = {
      title,
      message,
      type,
      buttonText: 'OK',
      buttons,
    };

    this.showAlertCallback(config);
  }
}

export const alertManager = AlertManager.getInstance();
export default AlertManager;
