import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PUBLIC_ROUTES } from '@/config/routes';

let authServiceInstance: any = null;

const getAuthService = () => {
  if (!authServiceInstance) {
    const { authService } = require('../auth');
    authServiceInstance = authService;
  }
  return authServiceInstance;
};

const getApiBaseURL = () => {
  const envUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL;
  const { normalizeUrl } = require('@/lib/network/urlNormalizer');

  const fixLocalhost = (url: string) => normalizeUrl(url);

  if (
    !envUrl ||
    envUrl === 'null' ||
    envUrl === 'undefined' ||
    String(envUrl).trim() === ''
  ) {
    const defaultUrl = 'http://localhost:8082/api';
    return fixLocalhost(defaultUrl);
  }

  const cleanUrl = fixLocalhost(String(envUrl).replace(/\/$/, '').trim());

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    const defaultUrl = 'http://localhost:8082/api';
    return fixLocalhost(defaultUrl);
  }

  if (cleanUrl.endsWith('/api')) {
    return cleanUrl;
  }

  return `${cleanUrl}/api`;
};

export class HttpService {
  static httpService: HttpService;

  private constructor() {}

  static getInstance() {
    if (!HttpService.httpService) HttpService.httpService = new HttpService();
    return HttpService.httpService;
  }

  getHostUrl = () => {
    let url = getApiBaseURL();
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
      return 120000;
    } else {
      return 15000;
    }
  };

  getHeaders = () => {
    return { 'Content-Type': 'application/json' };
  };

  private getRelativePath = (api: string) => {
    return api.startsWith('/') ? api.substring(1) : api;
  };

  getAxios = (api: string, skipAuth = false) => {
    const baseURL = this.getHostUrl();
    const relativePath = this.getRelativePath(api);
    const headers = this.getHeaders();

    const instance = axios.create({
      baseURL: baseURL,
      timeout: this.getTimeoutTime(api),
      headers: headers,
    });

    instance.interceptors.request.use(async (config) => {
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      if (!skipAuth) {
        const authService = getAuthService();
        const accessToken = (await authService?.getToken?.()) || null;

        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        const isExpected404 =
          error.response?.status === 404 &&
          (originalRequest?.url?.includes('/courses/get-active') ||
            originalRequest?.url?.includes('/courses/initialize')) &&
          (error.response?.data?.code === 'NO_ACTIVE_COURSE' ||
            error.response?.data?.error?.includes('No active course'));

        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          if (
            originalRequest.url &&
            (originalRequest.url.includes('/auth/login') ||
              originalRequest.url.includes('/auth/register'))
          ) {
            return Promise.reject(error);
          }

          try {
            const authService = getAuthService();
            const refreshToken = await authService?.getRefreshToken?.();

            if (refreshToken) {
              try {
                const refreshResponse = await authService.refreshToken({
                  refreshToken,
                });
                if (
                  refreshResponse.success &&
                  refreshResponse.data?.accessToken
                ) {
                  originalRequest.headers[
                    'Authorization'
                  ] = `Bearer ${refreshResponse.data.accessToken}`;
                  return instance(originalRequest);
                }
              } catch (refreshError) {
                console.warn('[HttpService] Token refresh attempt failed:', refreshError);
              }
            }

            authService?.logout?.().catch(() => {});
            return Promise.reject(error);
          } catch (refreshError) {
            const authService = getAuthService();
            authService?.logout?.().catch(() => {});
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  };

  async refreshToken() {
    try {
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

  get = (
    api: string,
    skipAuthOrOptions: boolean | { params?: any; skipAuth?: boolean } = false
  ) => {
    let skipAuth = false;
    let params = undefined;

    if (
      skipAuthOrOptions &&
      typeof skipAuthOrOptions === 'object' &&
      !Array.isArray(skipAuthOrOptions)
    ) {
      params = (skipAuthOrOptions as any).params;
      skipAuth = (skipAuthOrOptions as any).skipAuth ?? false;
    } else {
      skipAuth = skipAuthOrOptions as boolean;
    }

    const ax = this.getAxios(api, skipAuth);
    return ax.get(this.getRelativePath(api), { params });
  };

  post = <T = any>(api: string, payload?: any) => {
    const ax = this.getAxios(api);
    return ax.post<T>(this.getRelativePath(api), payload);
  };

  put = <T = any>(api: string, payload?: any) => {
    const ax = this.getAxios(api);
    return ax.put<T>(this.getRelativePath(api), payload);
  };

  delete = <T = any>(api: string, payload?: any) => {
    const ax = this.getAxios(api);
    const options = payload ? { data: payload } : {};
    return ax.delete<T>(this.getRelativePath(api), options);
  };

  uploadFile = (api: string, file: File, additionalData: any) => {
    const formData = new FormData();
    formData.append('file', file);
    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    const instance = axios.create({
      baseURL: this.getHostUrl(),
      timeout: this.getTimeoutTime(api),
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    instance.interceptors.request.use(async (config) => {
      const authService = getAuthService();
      const accessToken = (await authService?.getToken?.()) || null;
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return config;
    });

    return instance.post(this.getRelativePath(api), formData);
  };
}

export const httpService = HttpService.getInstance();
