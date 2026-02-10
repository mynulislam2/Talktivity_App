import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PUBLIC_ROUTES } from '@/config/routes';

// Logger removed - no console logging

// Lazy imports to break circular dependencies
let authServiceInstance: any = null;
let adminAuthServiceInstance: any = null;

const getAuthService = () => {
  if (!authServiceInstance) {
    const { authService } = require('./AuthService');
    authServiceInstance = authService;
  }
  return authServiceInstance;
};

const getAdminAuthService = () => {
  if (!adminAuthServiceInstance) {
    const { adminAuthService } = require('./AdminAuthService');
    adminAuthServiceInstance = adminAuthService;
  }
  return adminAuthServiceInstance;
};

// API configuration
const getApiBaseURL = (serviceType: 'standard' | 'admin' = 'standard') => {
  // Get env vars
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL;
  const adminEnvUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.EXPO_PUBLIC_ADMIN_API_URL;
  
  // Import URL normalizer for consistent localhost handling
  const { normalizeUrl } = require('@/lib/network/urlNormalizer');
  
  // Normalize localhost for emulator or real device
  const fixLocalhost = (url: string) => {
    return normalizeUrl(url);
  };

  if (serviceType === 'admin') {
    if (adminEnvUrl && adminEnvUrl !== 'null' && adminEnvUrl !== 'undefined' && String(adminEnvUrl).trim() !== '') {
      return fixLocalhost(String(adminEnvUrl).replace(/\/$/, '').trim());
    }
    // Use localhost so normalizeUrl can map it correctly for emulator/real device
    return fixLocalhost('http://localhost:8082/api/admin');
  }
  
  if (!envUrl || envUrl === 'null' || envUrl === 'undefined' || String(envUrl).trim() === '') {
    // Use localhost so normalizeUrl can map it correctly for emulator/real device
    // normalizeUrl will convert localhost -> 10.0.2.2 (emulator) or -> 192.168.0.105 (real device)
    const defaultUrl = 'http://localhost:8082/api';
    console.log('🔧 [HttpService] No EXPO_PUBLIC_API_URL set, using default:', defaultUrl);
    return fixLocalhost(defaultUrl);
  }
  
  const cleanUrl = fixLocalhost(String(envUrl).replace(/\/$/, '').trim());
  
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    // Invalid URL format, use default with normalization
    const defaultUrl = 'http://localhost:8082/api';
    console.warn('⚠️ [HttpService] Invalid URL format, using default:', { envUrl, defaultUrl });
    return fixLocalhost(defaultUrl);
  }
  
  // Only append /api if it's not already there
  if (cleanUrl.endsWith('/api')) {
    return cleanUrl;
  }
  
  return `${cleanUrl}/api`;
};

export class HttpService {
  static httpService: HttpService;

  private constructor() { }
  
  static getInstance() {
    if (!HttpService.httpService)
      HttpService.httpService = new HttpService();
    return HttpService.httpService;
  }

  getHostUrl = (serviceType: 'standard' | 'admin' = 'standard') => {
    let url = getApiBaseURL(serviceType);
    if (!url.endsWith('/')) {
      url += '/';
    }
    return url;
  };

  getTimeoutTime = (api: string) => {
    if (api.includes('large-data')) {
      return 60000;
    } else if (api.includes('search')) {
      return 30000;
    } else if (
      api.includes('/quizzes/generate') || 
      api.includes('/listening/generate-quiz') ||
      api.includes('/ai/generate-report') ||
      api.includes('/report/generate-report') ||
      api.includes('/daily-reports/generate') ||
      api.includes('/reports/call') ||
      api.includes('/reports/daily')
    ) {
      return 120000; // 120 seconds (2 minutes) - Groq API can take up to 60 seconds, plus processing time
    } else {
      return 15000;
    }
  };

  getHeaders = (serviceType: 'standard' | 'admin' = 'standard') => {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };
    
    return headers;
  };

  private getRelativePath = (api: string) => {
    return api.startsWith('/') ? api.substring(1) : api;
  };

  getAxios = (api: string, skipAuth = false, serviceType: 'standard' | 'admin' = 'standard') => {
    const baseURL = this.getHostUrl(serviceType);
    const relativePath = this.getRelativePath(api);
    
    // Get headers - skip auth if requested
    const headers = this.getHeaders(serviceType);
    
    const instance = axios.create({
      baseURL: baseURL,
      timeout: this.getTimeoutTime(api),
      headers: headers,
    });
    
    // Request interceptor to add token asynchronously
    instance.interceptors.request.use(async config => {
      const fullUrl = `${config.baseURL}${config.url}`;
      console.log('📤 [HttpService] Making request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullUrl: fullUrl,
        serviceType: serviceType,
        skipAuth: skipAuth,
      });

      if (!skipAuth) {
        let accessToken: string | null = null;
        if (serviceType === 'admin') {
          const adminAuthService = getAdminAuthService();
          accessToken = await adminAuthService?.getToken?.() || null;
        } else {
          const authService = getAuthService();
          accessToken = await authService?.getToken?.() || null;
        }
        
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
          console.log('🔑 [HttpService] Added auth token to request:', {
            tokenLength: accessToken.length,
            tokenPreview: accessToken.substring(0, 20) + '...',
          });
        } else {
          console.warn('⚠️ [HttpService] No auth token available for request');
        }
      }
      return config;
    });

    // Response interceptor for token refresh
    instance.interceptors.response.use(
      (response) => {
        console.log('✅ [HttpService] Request successful:', {
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          status: response.status,
          fullUrl: `${response.config.baseURL}${response.config.url}`,
        });
        return response;
      }, 
      async (error) => {
        const originalRequest = error.config;
        
        // Log all errors with full details
        const fullUrl = originalRequest?.baseURL && originalRequest?.url
          ? `${originalRequest.baseURL}${originalRequest.url}` 
          : originalRequest?.url || 'unknown';
        
        // Check if this is an expected 404 (e.g., no active course)
        const isExpected404 = error.response?.status === 404 && 
          (originalRequest?.url?.includes('/courses/get-active') || 
           originalRequest?.url?.includes('/courses/initialize')) &&
          (error.response?.data?.code === 'NO_ACTIVE_COURSE' || 
           error.response?.data?.error?.includes('No active course'));
        
        // Log expected 404s as warnings, not errors
        if (isExpected404) {
          console.log('ℹ️ [HttpService] Expected response (no active course):', {
            method: originalRequest?.method?.toUpperCase(),
            url: originalRequest?.url,
            fullUrl: fullUrl,
            status: error.response?.status,
            responseData: error.response?.data,
          });
        } else {
          console.error('❌ [HttpService] Request failed:', {
            method: originalRequest?.method?.toUpperCase(),
            url: originalRequest?.url,
            baseURL: originalRequest?.baseURL,
            fullUrl: fullUrl,
            status: error.response?.status,
            statusText: error.response?.statusText,
            errorCode: error.code,
            errorMessage: error.message,
            hasResponse: !!error.response,
            responseData: error.response?.data,
            timeout: originalRequest?.timeout,
          });
        }
        
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          if (originalRequest.url && (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register'))) {
            return Promise.reject(error);
          }
          
          try {
            // Check if token is actually expired
            let tokenExp: number | null = null;
            
            if (serviceType === 'admin') {
              const adminAuthService = getAdminAuthService();
              tokenExp = await adminAuthService?.getTokenExpiry?.() || null;
            } else {
              // Use AuthService.getTokenExpiry() - single source of truth
              const authService = getAuthService();
              tokenExp = await authService?.getTokenExpiry?.() || null;
            }
            
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (tokenExp && currentTime < tokenExp) {
              // Token hasn't expired yet - some other 401 issue
              return Promise.reject(error);
            }

            // Only refresh for standard service for now
            if (serviceType === 'standard') {
              // Use AuthService.refreshToken() - single source of truth
              const authService = getAuthService();
              const refreshToken = await authService?.getRefreshToken?.();
              if (refreshToken) {
                try {
                  const refreshResponse = await authService.refreshToken({ refreshToken });
                  if (refreshResponse.success && refreshResponse.data?.accessToken) {
                    // Update headers with new token
                    originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
                    
                    // Retry original request
                    return instance(originalRequest);
                  }
                } catch (refreshError) {
                  // Fall through to handleAuthFailure
                }
              }
            }
            
            this.handleAuthFailure(serviceType);
            return Promise.reject(error);
          } catch (refreshError) {
            this.handleAuthFailure(serviceType);
            return Promise.reject(error);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    return instance;
  };

  // Method to refresh the token
  // NOTE: This method is deprecated. Use authService.refreshToken() instead.
  // Keeping for backward compatibility but delegating to AuthService
  async refreshToken() {
    try {
      // Delegate to AuthService - single source of truth for token refresh
      const authService = getAuthService();
      const refreshToken = authService?.getRefreshToken?.();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authService.refreshToken({ refreshToken });
      
      if (response.success && response.data?.accessToken) {
        return response.data.accessToken;
      }
      
      throw new Error('Token refresh failed: invalid response');
    } catch (error) {
      throw error;
    }
  }
  
  // Handle authentication failure
  async handleAuthFailure(serviceType: 'standard' | 'admin' = 'standard') {
    if (serviceType === 'admin') {
      try {
        await AsyncStorage.multiRemove([
          'adminAccessToken',
          'adminRefreshToken',
          'adminUser',
          'adminTokenExpiry'
        ]);
      } catch (e) {
        // failed to clear
      }
    } else {
      // Use AuthService to clear auth data
      const authService = getAuthService();
      authService?.logout?.().catch(() => {
        // Ignore errors during logout
      });
    }
  }

  // HTTP methods
  get = (api: string, skipAuthOrOptions: boolean | { params?: any, skipAuth?: boolean, serviceType?: 'standard' | 'admin' } = false, serviceType: 'standard' | 'admin' = 'standard') => {
    let skipAuth = false;
    let params = undefined;
    let finalServiceType = serviceType;

    if (skipAuthOrOptions && typeof skipAuthOrOptions === 'object' && !Array.isArray(skipAuthOrOptions)) {
      params = (skipAuthOrOptions as any).params;
      skipAuth = (skipAuthOrOptions as any).skipAuth ?? false;
      finalServiceType = (skipAuthOrOptions as any).serviceType ?? serviceType;
    } else {
      skipAuth = skipAuthOrOptions as boolean;
    }

    const ax = this.getAxios(api, skipAuth, finalServiceType);
    return ax.get(this.getRelativePath(api), { params });
  };

  post = (api: string, payload: any, serviceType: 'standard' | 'admin' = 'standard') => {
    const ax = this.getAxios(api, false, serviceType);
    return ax.post(this.getRelativePath(api), payload);
  };

  put = (api: string, payload: any, serviceType: 'standard' | 'admin' = 'standard') => {
    const ax = this.getAxios(api, false, serviceType);
    return ax.put(this.getRelativePath(api), payload);
  };

  delete = (api: string, payload?: any, serviceType: 'standard' | 'admin' = 'standard') => {
    const ax = this.getAxios(api, false, serviceType);
    const options = payload ? { data: payload } : {};
    return ax.delete(this.getRelativePath(api), options);
  };

  uploadFile = (api: string, file: File, additionalData: any, serviceType: 'standard' | 'admin' = 'standard') => {
    const formData = new FormData();
    formData.append('file', file);
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }
    
    const instance = axios.create({
      baseURL: this.getHostUrl(serviceType),
      timeout: this.getTimeoutTime(api),
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });

    instance.interceptors.request.use(async config => {
      let accessToken: string | null = null;
      if (serviceType === 'admin') {
        const adminAuthService = getAdminAuthService();
        accessToken = await adminAuthService?.getToken?.() || null;
      } else {
        const authService = getAuthService();
        accessToken = await authService?.getToken?.() || null;
      }
      
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return config;
    });
    
    return instance.post(this.getRelativePath(api), formData);
  };
}

// Export singleton instance
export const httpService = HttpService.getInstance();