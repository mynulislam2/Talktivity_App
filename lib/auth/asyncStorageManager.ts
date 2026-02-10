/**
 * AsyncStorage Manager for Authentication
 * 
 * Replaces localStorage operations with AsyncStorage for React Native
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponseData } from '@/types/auth';

class AsyncStorageManager {
  private readonly ACCESS_TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';
  private readonly USER_KEY = 'user';

  /**
   * Store authentication data
   */
  async storeAuthData(data: AuthResponseData): Promise<void> {
    try {
      const token = data.accessToken || data.token;
      if (!token) {
        throw new Error('No access token provided in auth data');
      }

      // Store access token
      await AsyncStorage.setItem(this.ACCESS_TOKEN_KEY, token);

      // Store refresh token if provided
      if (data.refreshToken) {
        await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
      }

      // Calculate and store expiry time in seconds
      const expiryTime = Math.floor(Date.now() / 1000) + (data.expiresIn || 7 * 24 * 60 * 60);
      await AsyncStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());

      // Store user data
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    } catch (error) {
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Clear all authentication data
   */
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.ACCESS_TOKEN_KEY,
        this.REFRESH_TOKEN_KEY,
        this.TOKEN_EXPIRY_KEY,
        this.USER_KEY,
      ]);
    } catch (error) {
      // Silently fail on clear
    }
  }

  /**
   * Get stored access token
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get stored user
   */
  async getUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem(this.USER_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr) as User;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token expiry time
   */
  async getTokenExpiry(): Promise<number | null> {
    try {
      const expStr = await AsyncStorage.getItem(this.TOKEN_EXPIRY_KEY);
      return expStr ? parseInt(expStr, 10) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is valid (not expired)
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const expiryStr = await AsyncStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (!expiryStr) return false;

      const expiryTime = parseInt(expiryStr, 10);
      const currentTime = Math.floor(Date.now() / 1000);

      return currentTime < expiryTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getUser();
      const isValid = await this.isTokenValid();

      return !!(token && user && isValid);
    } catch (error) {
      return false;
    }
  }
}

export const asyncStorageManager = new AsyncStorageManager();
