/**
 * Metro configuration.
 *
 * The only customisation here is a WEB-ONLY module swap. Native-only
 * packages (LiveKit + its WebRTC bindings, expo-speech-recognition) cannot
 * resolve under react-native-web — they need `requireNativeComponent` and
 * platform APIs a browser does not have, and importing them crashes the web
 * bundle before anything renders.
 *
 * Swapping them for a stub when platform === 'web' lets the real app be
 * rendered in a browser for visual design review (comparing screens against
 * the web app's reference screenshots). iOS and Android bundles are
 * completely unaffected — the branch below never runs for them.
 */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const WEB_STUBBED_MODULES = new Set([
  '@livekit/react-native',
  '@livekit/react-native-webrtc',
  'livekit-client',
  '@livekit/components-react',
  'expo-speech-recognition',
]);

const stubPath = path.resolve(__dirname, 'web-preview/native-stub.js');

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && WEB_STUBBED_MODULES.has(moduleName)) {
    return { type: 'sourceFile', filePath: stubPath };
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
