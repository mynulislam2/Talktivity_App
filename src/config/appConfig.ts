/**
 * App Configuration
 *
 * Centralized configuration management for React Native app.
 * Replaces Next.js process.env handling with environment variables
 * and AsyncStorage for runtime configuration.
 */

import Constants from 'expo-constants';

import { Platform } from 'react-native';

// Get extra config from app.json if available
const extra = Constants.expoConfig?.extra || {};
const isAndroid = Platform.OS === 'android';

class AppConfig {
  // API Configuration
  static readonly API_BASE_URL =
    extra.API_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    (isAndroid ? 'http://10.0.2.2:8082/api' : 'http://localhost:8082/api');

  static readonly LIVEKIT_URL =
    extra.LIVEKIT_URL ||
    process.env.EXPO_PUBLIC_LIVEKIT_URL ||
    process.env.REACT_APP_LIVEKIT_URL ||
    (isAndroid ? 'ws://10.0.2.2:7880' : 'ws://localhost:7880');

  static readonly LIVEKIT_API_KEY =
    extra.LIVEKIT_API_KEY || process.env.REACT_APP_LIVEKIT_API_KEY || 'devkey';

  static readonly LIVEKIT_API_SECRET =
    extra.LIVEKIT_API_SECRET ||
    process.env.REACT_APP_LIVEKIT_API_SECRET ||
    'secret';

  // Facebook Pixel (optional, can be used for web version)
  static readonly FACEBOOK_PIXEL_ID =
    extra.FACEBOOK_PIXEL_ID || process.env.REACT_APP_FACEBOOK_PIXEL_ID || '';

  // Environment
  static readonly IS_PRODUCTION =
    extra.ENV === 'production' || process.env.NODE_ENV === 'production';
  static readonly IS_DEVELOPMENT = !this.IS_PRODUCTION;

  // App version and build
  static readonly APP_VERSION = extra.VERSION || '1.0.0';
  static readonly BUILD_NUMBER = extra.BUILD_NUMBER || '1';

  /**
   * Get API endpoint URL
   * @param path - API path (e.g., '/api/users')
   * @returns Full API URL
   */
  static getApiUrl(path: string): string {
    const base = this.API_BASE_URL.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }

  /**
   * Log debug information (only in development)
   */
  static debug(message: string, data?: any): void {
    if (this.IS_DEVELOPMENT) {
      console.log(`[AppConfig] ${message}`, data || '');
    }
  }

  /**
   * Validate critical configuration
   */
  static validate(): boolean {
    const required = [
      { key: 'API_BASE_URL', value: this.API_BASE_URL },
      { key: 'LIVEKIT_URL', value: this.LIVEKIT_URL },
    ];

    let isValid = true;
    for (const { key, value } of required) {
      if (!value) {
        console.warn(`[AppConfig] Missing required config: ${key}`);
        isValid = false;
      }
    }

    return isValid;
  }
}

export default AppConfig;
