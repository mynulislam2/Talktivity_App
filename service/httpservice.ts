import axios from 'axios';
import { authService } from './AuthService';
import { adminAuthService } from './AdminAuthService';
import { PUBLIC_ROUTES } from '@/config/routes';

// Logger removed - no console logging

// API configuration - lazy load to avoid SSR issues
const getApiBaseURL = (serviceType: 'standard' | 'admin' = 'standard') => {
  // Always return default during SSR
  if (typeof window === 'undefined') {
    return serviceType === 'admin' ? 'http://localhost:8082/api/admin' : 'http://localhost:8082/api';
  }
  
  // Get env vars
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const adminEnvUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
  
  if (serviceType === 'admin') {
    if (adminEnvUrl && adminEnvUrl !== 'null' && adminEnvUrl !== 'undefined' && String(adminEnvUrl).trim() !== '') {
      return String(adminEnvUrl).replace(/\/$/, '').trim();
    }
    // Fallback if admin URL not set but base URL is
    if (envUrl && envUrl !== 'null' && envUrl !== 'undefined' && String(envUrl).trim() !== '') {
      return `${String(envUrl).replace(/\/$/, '').trim()}/api/admin`;
    }
    return 'http://localhost:8082/api/admin';
  }
  
  
  // Check for null, undefined, or string 'null'/'undefined'
  if (!envUrl || envUrl === 'null' || envUrl === 'undefined' || String(envUrl).trim() === '') {
    const defaultUrl = 'http://localhost:8082/api';
    return defaultUrl;
  }
  
  // Clean URL
  const cleanUrl = String(envUrl).replace(/\/$/, '').trim();
  
  // Validate URL format safely
  if (!cleanUrl || cleanUrl === 'null' || cleanUrl === 'undefined') {
    return 'http://localhost:8082/api';
  }
  
  // Basic validation - check if it looks like a URL
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return 'http://localhost:8082/api';
  }
  
  const finalUrl = `${cleanUrl}/api`;
  return finalUrl;
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
    let accessToken: string | null = null;
    
    // Use AuthService abstraction instead of direct localStorage access
    if (typeof window !== 'undefined') {
      if (serviceType === 'admin') {
        // Use AdminAuthService.getToken() - single source of truth
        accessToken = adminAuthService.getToken();
      } else {
        // Use AuthService.getToken() - single source of truth
        accessToken = authService.getToken();
      }
    }
    
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return headers;
  };

  private getRelativePath = (api: string) => {
    return api.startsWith('/') ? api.substring(1) : api;
  };

  getAxios = (api: string, skipAuth = false, serviceType: 'standard' | 'admin' = 'standard') => {
    // Ensure we're on client-side before creating axios instance
    if (typeof window === 'undefined') {
      throw new Error('HttpService can only be used on the client side');
    }
    
    const baseURL = this.getHostUrl(serviceType);
    const relativePath = this.getRelativePath(api);
    
    // Get headers - skip auth if requested
    const headers = skipAuth 
      ? { 'Content-Type': 'application/json' }
      : this.getHeaders(serviceType);
    
    const axio = axios.create({
      baseURL: baseURL,
      timeout: this.getTimeoutTime(api),
      headers: headers,
    });
    
    // Request interceptor
    axio.interceptors.request.use(config => {
      return config;
    });

    // Response interceptor for token refresh
    axio.interceptors.response.use(
      (response) => {
        return response;
      }, 
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          if (originalRequest.url && (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register'))) {
            return Promise.reject(error);
          }
          
          try {
            // Check if token is actually expired
            if (typeof window !== 'undefined') {
              let tokenExp: number | null = null;
              
              if (serviceType === 'admin') {
                tokenExp = adminAuthService.getTokenExpiry();
              } else {
                // Use AuthService.getTokenExpiry() - single source of truth
                tokenExp = authService.getTokenExpiry();
              }
              
              const currentTime = Math.floor(Date.now() / 1000);
              
              if (tokenExp && currentTime < tokenExp) {
                // Token hasn't expired yet - some other 401 issue
                return Promise.reject(error);
              }
            }

            // Only refresh for standard service for now
            if (serviceType === 'standard') {
              // Use AuthService.refreshToken() - single source of truth
              const refreshToken = authService.getRefreshToken();
              if (refreshToken) {
                try {
                  const refreshResponse = await authService.refreshToken({ refreshToken });
                  if (refreshResponse.success && refreshResponse.data?.accessToken) {
                    // Update headers with new token
                    originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
                    
                    // Retry original request
                    return axios(originalRequest);
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
    
    return axio;
  };

  // Method to refresh the token
  // NOTE: This method is deprecated. Use authService.refreshToken() instead.
  // Keeping for backward compatibility but delegating to AuthService
  async refreshToken() {
    try {
      // Delegate to AuthService - single source of truth for token refresh
      const refreshToken = authService.getRefreshToken();
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
  handleAuthFailure(serviceType: 'standard' | 'admin' = 'standard') {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      // Use centralized route config
      const isPublicRoute = PUBLIC_ROUTES.includes(currentPath as any);
      
      if (serviceType === 'admin') {
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminTokenExpiry');
        if (currentPath !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      } else {
        // Use AuthService to clear auth data
        authService.logout().catch(() => {
          // Ignore errors during logout - we still want to redirect
        });
        
        // Redirect to login if not already on a public route
        if (!isPublicRoute && currentPath !== '/login') {
          window.location.href = '/login';
        }
      }
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
    
    const axio = axios.create({
      baseURL: this.getHostUrl(serviceType),
      timeout: this.getTimeoutTime(api),
      headers: {
        ...this.getHeaders(serviceType),
        'Content-Type': 'multipart/form-data'
      },
    });
    
    return axio.post(this.getRelativePath(api), formData);
  };
}

// Export singleton instance
export const httpService = HttpService.getInstance();