/**
 * useAuthGoogleLoginNative Hook (React Native)
 * 
 * Encapsulates Google OAuth login logic for React Native using expo-auth-session.
 * Handles the complete Google OAuth flow with success/error callbacks.
 * Matches Next.js useAuthGoogleLogin implementation.
 * 
 * NOTE: This requires native modules. If you get "Cannot find native module" error,
 * you need to rebuild the app:
 * 1. npx expo prebuild
 * 2. npx expo run:android (or run:ios)
 */

import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useAppDispatch } from '@/store/hooks';
import { googleOAuth } from '@/store/slices/authSlice';
import { loadLifecycle } from '@/store/slices/lifecycleSlice';
import { loadSubscriptionStatus } from '@/store/slices/subscriptionSlice';
import { getRedirectPath } from '@/lib/routing/getRedirectPath';
import { Alert, Platform } from 'react-native';
import type { AuthResponseData } from '@/types/auth';

// Try to load native modules
let AuthSession: any = null;
let WebBrowser: any = null;
let isModulesAvailable = false;

try {
  AuthSession = require('expo-auth-session');
  WebBrowser = require('expo-web-browser');
  if (WebBrowser?.maybeCompleteAuthSession) {
    WebBrowser.maybeCompleteAuthSession();
  }
  isModulesAvailable = true;
} catch (error) {
  // Modules not available - will show alert when user tries to use Google Sign-In
  isModulesAvailable = false;
}

export interface UseAuthGoogleLoginNativeOptions {
  onError?: (error: string) => void;
  form?: {
    setError: (field: string, message: string) => void;
  };
}

export interface UseAuthGoogleLoginNativeReturn {
  googleLogin: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useAuthGoogleLoginNative(
  options: UseAuthGoogleLoginNativeOptions = {}
): UseAuthGoogleLoginNativeReturn {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onError, form } = options;

  // Get Google OAuth configuration from environment
  const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

  const handleGoogleAuth = useCallback(
    async (code: string) => {
      return await dispatch(googleOAuth({ code }));
    },
    [dispatch]
  );

  const handleSuccess = useCallback(
    async (code: string) => {
      if (!code) {
        const errorMsg = 'Failed to get Google authorization code';
        form?.setError('email', errorMsg);
        onError?.(errorMsg);
        setError(errorMsg);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await handleGoogleAuth(code);

        if (googleOAuth.fulfilled.match(result)) {
          const authData = result.payload as AuthResponseData | undefined;

          // For brand-new Google registrations, send user to onboarding first
          if (authData?.isNewUser) {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Auth',
                    params: {
                      screen: 'Onboarding',
                    },
                  },
                ],
              })
            );
            return;
          }

          // Load both lifecycle and subscription to ensure complete state
          const lifecycleResult = await dispatch(loadLifecycle());
          await dispatch(loadSubscriptionStatus());

          if (loadLifecycle.fulfilled.match(lifecycleResult)) {
            const lifecycleData = lifecycleResult.payload;
            const redirectPath = getRedirectPath(lifecycleData);

            // Navigate based on redirect path
            if (redirectPath === '/onboarding') {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Auth',
                      params: {
                        screen: 'Onboarding',
                      },
                    },
                  ],
                })
              );
            } else if (redirectPath === '/call?CallStart=true') {
              console.log('📱 [GoogleLogin] Navigating to initial CallScreen in Auth stack with reset...');
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Auth',
                      params: {
                        screen: 'CallScreen',
                        params: { CallStart: true },
                      },
                    },
                  ],
                })
              );
            } else if (redirectPath === '/home') {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Main',
                      params: {
                        screen: 'Home',
                      },
                    },
                  ],
                })
              );
            } else {
              // Fallback to home
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Main',
                      params: {
                        screen: 'Home',
                      },
                    },
                  ],
                })
              );
            }
          } else {
            // If lifecycle load fails, fallback to home
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Main',
                    params: {
                      screen: 'Home',
                    },
                  },
                ],
              })
            );
          }
        } else {
          // Error handling
          const errorMessage =
            (googleOAuth.rejected.match(result) ? (result.payload as string) : null) ||
            'Google authentication failed';
          form?.setError('email', errorMessage);
          onError?.(errorMessage);
          setError(errorMessage);
        }
      } catch (err: any) {
        const errorMessage = err?.message || 'Google authentication failed';
        form?.setError('email', errorMessage);
        onError?.(errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [handleGoogleAuth, onError, form, navigation, dispatch]
  );

  const googleLogin = useCallback(async () => {
    // Check if Google Sign-In is available
    if (!isModulesAvailable) {
      Alert.alert(
        'Google Sign-In Not Available',
        `Google Sign-In requires native modules to be rebuilt.\n\nTo enable Google Sign-In:\n\n1. Stop the current dev server\n2. Run: npx expo prebuild\n3. Then: npx expo run:${Platform.OS === 'ios' ? 'ios' : 'android'}\n\nOr use email/password login for now.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      const errorMsg = 'Google OAuth is not configured. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID.';
      form?.setError('email', errorMsg);
      onError?.(errorMsg);
      setError(errorMsg);
      return;
    }

    // Try to use AuthSession if available
    if (!AuthSession || !AuthSession.useAuthRequest) {
      Alert.alert(
        'Google Sign-In Error',
        'Google Sign-In is not properly configured. Please rebuild the app.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For React Native with Web application OAuth client, we need to use a web redirect URI
      // Google doesn't accept custom schemes like talktivity://auth for Web application clients
      // We'll use the web redirect URI that's already configured: https://talktivity.app/auth/callback
      // Then we'll handle the redirect back to the app via deep linking
      
      // Use web redirect URI (must be HTTPS and registered in Google Cloud Console)
      const redirectUri = 'https://talktivity.app/auth/callback';
      
      // Alternative: Try to use Expo's makeRedirectUri which might generate a web URL in some cases
      // But for production, we should use the web redirect URI
      const expoRedirectUri = AuthSession.makeRedirectUri({
        useProxy: true, // Use Expo's proxy for development
      });
      
      // Use web redirect URI for production, or Expo proxy for development
      const finalRedirectUri = __DEV__ && expoRedirectUri.startsWith('https://') 
        ? expoRedirectUri 
        : redirectUri;

      console.log('🔐 Google OAuth Configuration:');
      console.log('   Redirect URI:', finalRedirectUri);
      console.log('   Client ID:', GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'MISSING');
      console.log('   ⚠️  Make sure this redirect URI is in "Authorized redirect URIs" section');
      console.log('   ⚠️  NOT "Authorized JavaScript origins" - that\'s for web apps only!');

      // Use AuthSession's promptAsync directly
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: finalRedirectUri,
        response_type: 'code',
        scope: 'openid profile email',
        access_type: 'offline',
        prompt: 'consent',
      }).toString()}`;

      console.log('Opening Google OAuth URL...');
      
      // Open browser for authentication
      // For web redirect URIs, we need to handle the callback differently
      const result = await WebBrowser.openAuthSessionAsync(authUrl, finalRedirectUri);

      console.log('Google OAuth Result:', result.type);

      if (result.type === 'success' && result.url) {
        // Extract code from URL
        // The URL might be the web redirect URI (https://talktivity.app/auth/callback?code=...)
        // or it might be a deep link back to the app
        try {
          const url = new URL(result.url);
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');
          const errorDescription = url.searchParams.get('error_description');
          
          if (error) {
            // Google returned an error
            const errorMsg = errorDescription || error || 'Google authentication failed';
            console.error('Google OAuth Error:', error, errorDescription);
            Alert.alert(
              'Google Sign-In Error',
              `Error: ${error}\n\n${errorDescription || 'Please check your Google Cloud Console configuration.'}\n\nMake sure:\n1. Redirect URI is registered: ${finalRedirectUri}\n2. OAuth consent screen is configured\n3. Client ID is correct`,
              [{ text: 'OK' }]
            );
            form?.setError('email', errorMsg);
            onError?.(errorMsg);
            setError(errorMsg);
            setIsLoading(false);
            return;
          }
          
          if (code) {
            console.log('✅ Got authorization code, exchanging for token...');
            await handleSuccess(code);
          } else {
            const errorMsg = 'Failed to get authorization code from Google';
            console.error('❌ No code in response URL:', result.url);
            form?.setError('email', errorMsg);
            onError?.(errorMsg);
            setError(errorMsg);
            setIsLoading(false);
          }
        } catch (urlError: any) {
          // If URL parsing fails, try to extract code from the URL string directly
          console.log('⚠️ URL parsing failed, trying string extraction...', urlError);
          const codeMatch = result.url.match(/[?&]code=([^&]+)/);
          const errorMatch = result.url.match(/[?&]error=([^&]+)/);
          
          if (errorMatch) {
            const errorMsg = `Google authentication error: ${errorMatch[1]}`;
            console.error('Google OAuth Error:', errorMsg);
            Alert.alert('Google Sign-In Error', errorMsg, [{ text: 'OK' }]);
            form?.setError('email', errorMsg);
            onError?.(errorMsg);
            setError(errorMsg);
            setIsLoading(false);
            return;
          }
          
          if (codeMatch) {
            console.log('✅ Got authorization code (from string extraction), exchanging for token...');
            await handleSuccess(decodeURIComponent(codeMatch[1]));
          } else {
            console.error('❌ Error parsing OAuth response URL:', urlError);
            const errorMsg = 'Failed to parse Google authentication response';
            form?.setError('email', errorMsg);
            onError?.(errorMsg);
            setError(errorMsg);
            setIsLoading(false);
          }
        }
      } else if (result.type === 'cancel') {
        const errorMsg = 'Google login was cancelled';
        console.log('User cancelled Google login');
        setError(errorMsg);
        setIsLoading(false);
      } else {
        const errorMsg = `Google login failed: ${result.type}`;
        console.error('Google OAuth failed:', result);
        form?.setError('email', errorMsg);
        onError?.(errorMsg);
        setError(errorMsg);
        setIsLoading(false);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Google login was cancelled or failed';
      form?.setError('email', errorMessage);
      onError?.(errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [handleSuccess, form, onError, GOOGLE_CLIENT_ID]);

  return {
    googleLogin,
    isLoading,
    error,
  };
}
