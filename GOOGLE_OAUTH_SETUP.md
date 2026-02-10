# Google OAuth Setup for React Native

## Error 400: invalid_request

This error occurs when the redirect URI doesn't match what's configured in Google Cloud Console.

## ⚠️ IMPORTANT: Redirect URI vs JavaScript Origins

**DO NOT** add `talktivity://auth` to "Authorized JavaScript origins" - that's for web apps only!

**DO** add it to **"Authorized redirect URIs"** section (scroll down on the same page).

## Setup Instructions

### 1. Get Your Redirect URI

The app uses the web redirect URI: `https://talktivity.app/auth/callback`

**Why not `talktivity://auth`?**
- Google's Web application OAuth client doesn't accept custom URI schemes
- Custom schemes only work with Android/iOS specific OAuth client IDs
- We use the web redirect URI which is already configured and works with your backend

To see the exact redirect URI your app is using, check the console logs when you try to sign in with Google.

### 2. Configure Google Cloud Console

**IMPORTANT:** Google's Web application OAuth client does NOT accept custom URI schemes like `talktivity://auth`.

You need to use a **web redirect URI** that's already configured: `https://talktivity.app/auth/callback`

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID (the one you're currently viewing: `845075130244-kr1afnggeqb0qjvn6gd3j3k8rbr9rrge`)
5. **Scroll down** to find the **"Authorized redirect URIs"** section
6. Make sure `https://talktivity.app/auth/callback` is in the list (it should already be there)
7. **Remove** `talktivity://auth` if you added it - it won't work with Web application client
8. Click **"Save"**

**Note:** The app will use `https://talktivity.app/auth/callback` as the redirect URI, which will then redirect back to the app via deep linking.

### 3. OAuth Consent Screen

Make sure your OAuth consent screen is configured:
1. Go to **APIs & Services** > **OAuth consent screen**
2. Fill in all required fields:
   - App name: Talktivity
   - User support email
   - Developer contact information
3. Add scopes: `openid`, `profile`, `email`
4. Add test users if your app is in testing mode

### 4. Client ID Types

For React Native apps, you may need:
- **Web application** client ID (for the redirect URI)
- **Android** client ID (if using Android-specific OAuth)
- **iOS** client ID (if using iOS-specific OAuth)

### 5. Environment Variable

Add your Google Client ID to your `.env` file:
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### 6. Rebuild the App

After configuring:
1. Stop the dev server
2. Run: `npx expo prebuild`
3. Run: `npx expo run:android` (or `run:ios`)

## Troubleshooting

- **Error 400: invalid_request**: Redirect URI not registered in Google Cloud Console
- **Error 403: access_denied**: OAuth consent screen not configured or app not verified
- **Error 401: invalid_client**: Client ID is incorrect or doesn't exist

## Check Redirect URI

The app will log the redirect URI to the console. Make sure this exact URI is registered in Google Cloud Console.
