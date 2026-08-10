/**
 * URL Normalizer for React Native
 *
 * Handles localhost/127.0.0.1 URL mapping for different environments:
 * - Android Emulator: maps to 10.0.2.2 (host machine)
 * - iOS Simulator: keeps localhost (works natively)
 * - Real Device: requires PC's local network IP (via EXPO_PUBLIC_API_URL or EXPO_PUBLIC_DEV_HOST_IP)
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Get the host IP for development on real devices.
 * Falls back to emulator mapping if not set.
 */
const getDevHostIP = (): string => {
  // Check for explicit dev host IP (for real devices)
  const devHostIP =
    process.env.EXPO_PUBLIC_DEV_HOST_IP ||
    Constants.expoConfig?.extra?.DEV_HOST_IP;

  if (
    devHostIP &&
    devHostIP !== 'null' &&
    devHostIP !== 'undefined' &&
    String(devHostIP).trim() !== ''
  ) {
    return String(devHostIP).trim();
  }

  // Default to emulator mapping
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

/**
 * Normalize a URL by replacing localhost/127.0.0.1 with the appropriate host IP.
 *
 * @param url - The URL to normalize (e.g., "http://localhost:8082/api" or "ws://127.0.0.1:7880")
 * @returns Normalized URL with correct host IP
 *
 * @example
 * // Android Emulator:
 * normalizeUrl('http://localhost:8082/api') // => 'http://10.0.2.2:8082/api'
 *
 * // Real Device (if EXPO_PUBLIC_DEV_HOST_IP=192.168.1.100):
 * normalizeUrl('http://localhost:8082/api') // => 'http://192.168.1.100:8082/api'
 */
export function normalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    console.log('🔗 [URLNormalizer] Invalid URL input:', {
      url,
      type: typeof url,
    });
    return url;
  }

  // Don't modify URLs that already have a specific IP or domain
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
    console.log(
      '🔗 [URLNormalizer] URL already has specific IP/domain, no normalization needed:',
      url
    );
    return url;
  }

  const hostIP = getDevHostIP();
  const isRealDev = isRealDevice();

  console.log('🔗 [URLNormalizer] Normalizing URL:', {
    original: url,
    platform: Platform.OS,
    isRealDevice: isRealDev,
    devHostIP: hostIP,
    devHostIPSource:
      process.env.EXPO_PUBLIC_DEV_HOST_IP ||
      Constants.expoConfig?.extra?.DEV_HOST_IP ||
      'default',
  });

  // Replace localhost and 127.0.0.1 with the appropriate host IP
  let normalized = url
    .replace(/localhost/g, hostIP)
    .replace(/127\.0\.0\.1/g, hostIP);

  console.log('🔗 [URLNormalizer] Normalized URL:', {
    original: url,
    normalized: normalized,
    changed: url !== normalized,
  });

  return normalized;
}

/**
 * Check if we're likely running on a real device (not emulator/simulator).
 * This is a best-effort check and may not be 100% accurate.
 */
export function isRealDevice(): boolean {
  // If DEV_HOST_IP is explicitly set, assume real device
  const devHostIP =
    process.env.EXPO_PUBLIC_DEV_HOST_IP ||
    Constants.expoConfig?.extra?.DEV_HOST_IP;

  if (
    devHostIP &&
    devHostIP !== 'null' &&
    devHostIP !== 'undefined' &&
    String(devHostIP).trim() !== ''
  ) {
    return true;
  }

  // On Android, check if we're using the emulator IP
  // Real devices won't have 10.0.2.2 accessible
  if (Platform.OS === 'android') {
    // If user hasn't set DEV_HOST_IP, assume emulator for now
    // They should set it for real device testing
    return false;
  }

  // iOS Simulator uses localhost natively, so this is less reliable
  // Best to set EXPO_PUBLIC_DEV_HOST_IP for real iOS devices
  return false;
}
