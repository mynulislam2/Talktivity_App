/**
 * HTTP Service for React Native
 * 
 * Axios instance configured for the app with interceptors for:
 * - Authentication token injection
 * - Error handling
 * - Request/response logging in development
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppConfig from '../config/appConfig';

/**
 * Create and configure axios instance
 */
const createHttpService = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: AppConfig.API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Request interceptor - Add auth token
   */
  instance.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Debug logging
        if (AppConfig.IS_DEVELOPMENT) {
          console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`);
        }
      } catch (error) {
        console.error('[HTTP] Failed to get auth token:', error);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response interceptor - Handle errors, log responses
   */
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (AppConfig.IS_DEVELOPMENT) {
        console.log(`[HTTP] Response: ${response.status}`, response.config.url);
      }
      return response;
    },
    async (error: AxiosError) => {
      // Handle 401 - Unauthorized (token expired)
      if (error.response?.status === 401) {
        try {
          await AsyncStorage.removeItem('auth_token');
          // Could dispatch logout action here if using Redux
          // dispatch(logout());
        } catch (storageError) {
          console.error('[HTTP] Failed to clear auth token:', storageError);
        }
      }

      if (AppConfig.IS_DEVELOPMENT) {
        console.error(
          `[HTTP] Error: ${error.response?.status}`,
          error.response?.data || error.message
        );
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Singleton HTTP service instance
 */
const httpService: AxiosInstance = createHttpService();

export default httpService;
