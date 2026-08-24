/**
 * DEV-ONLY web preview stub.
 *
 * Not shipped to iOS or Android. metro.config.js swaps the native-only
 * modules for this file when (and only when) bundling for platform 'web',
 * so the app can be rendered in a browser for visual design review against
 * the web app's reference screenshots.
 *
 * These modules cannot run under react-native-web: they require native
 * views (`requireNativeComponent`) or platform APIs that do not exist in a
 * browser. Screens that genuinely depend on them (Practice, Roleplay,
 * GeneralPractice, and Review's speech recognition) will render their
 * layout but will not function — which is fine, because this harness exists
 * to check colour, typography, spacing and layout, not behaviour.
 */
const React = require('react');
const { View } = require('react-native');

const noop = () => {};
const NullComponent = ({ children }) => React.createElement(View, null, children);

// @livekit/react-native — App.tsx calls registerGlobals() at startup.
const registerGlobals = noop;

// Room / participant surfaces used by the call screens.
const useRoomContext = () => ({ state: 'disconnected', localParticipant: {} });
const useLocalParticipant = () => ({
  localParticipant: { isMicrophoneEnabled: false, setMicrophoneEnabled: noop },
});
const useParticipants = () => [];
const useTracks = () => [];
const useVoiceAssistant = () => ({ state: 'disconnected', audioTrack: null, agent: null });
const useConnectionState = () => 'disconnected';
const useIOSAudioManagement = noop;
const AudioSession = { startAudioSession: noop, stopAudioSession: noop, configureAudio: noop };
const Room = class {};
const Track = { Source: { Microphone: 'microphone', Camera: 'camera' } };
const ConnectionState = { Disconnected: 'disconnected', Connected: 'connected' };

// expo-speech-recognition — used by ReviewScreen.
const ExpoSpeechRecognitionModule = {
  requestPermissionsAsync: async () => ({ granted: false }),
  getPermissionsAsync: async () => ({ granted: false }),
  start: noop,
  stop: noop,
  abort: noop,
};
const useSpeechRecognitionEvent = noop;

module.exports = {
  __esModule: true,
  default: NullComponent,
  registerGlobals,
  LiveKitRoom: NullComponent,
  RoomContext: React.createContext(null),
  AudioSession,
  Room,
  Track,
  ConnectionState,
  useRoomContext,
  useLocalParticipant,
  useParticipants,
  useTracks,
  useVoiceAssistant,
  useConnectionState,
  useIOSAudioManagement,
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  registerGlobalsForWeb: noop,
};
