/**
 * Alert Context & Provider
 *
 * Global alert management system using React Context
 * Provides centralized alert display with ThemedAlert component
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { ThemedAlert, AlertButton } from '@/components/shared/ThemedAlert';
import { alertManager } from '@/lib/alertManager';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertConfig {
  title: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

/**
 * Alert Provider Component
 * Must wrap the entire app to manage global alerts
 * Renders ThemedAlert component globally
 */
export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    // Small delay to allow fade animation before clearing config
    setTimeout(() => {
      setAlertConfig(null);
    }, 300);
  }, []);

  // Register this provider's showAlert with the global alertManager
  // This allows error handler and other utilities to show alerts
  useEffect(() => {
    alertManager.setAlertCallback(showAlert);
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertConfig && (
        <ThemedAlert
          visible={isVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type || 'info'}
          buttonText={alertConfig.buttonText || 'OK'}
          buttons={alertConfig.buttons}
          onClose={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
}

/**
 * Hook to access alert context
 * Use this to show alerts from any component
 *
 * @example
 * const { showAlert } = useAlert();
 * showAlert({
 *   title: 'Error',
 *   message: 'Something went wrong',
 *   type: 'error'
 * });
 */
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}

export default AlertContext;
