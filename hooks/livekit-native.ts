import { Platform } from 'react-native';
import * as LKComponents from '@livekit/components-react';

let LKNative: any = {};

if (Platform.OS !== 'web') {
  try {
    LKNative = require('@livekit/react-native');
  } catch (e) {
    console.error('Failed to require @livekit/react-native', e);
  }
}

export const AudioSession = LKNative.AudioSession || {
  startAudioSession: async () => {},
  stopAudioSession: async () => {},
};

export const useIOSAudioManagement = LKNative.useIOSAudioManagement || (() => {});

// Shared LiveKit hooks: use native implementations on mobile, web implementations in browser
export const useLocalParticipant =
  LKNative.useLocalParticipant || LKComponents.useLocalParticipant;
export const useParticipantTracks =
  LKNative.useParticipantTracks || LKComponents.useParticipantTracks;
export const useRoomContext = LKNative.useRoomContext || LKComponents.useRoomContext;
export const useRoom = LKNative.useRoom || LKComponents.useRoom;
export const useRemoteParticipants =
  LKNative.useRemoteParticipants || LKComponents.useRemoteParticipants;
export const useConnectionState =
  LKNative.useConnectionState || LKComponents.useConnectionState;

export const VideoTrack = LKNative.VideoTrack || LKComponents.VideoTrack;
export const BarVisualizer = LKNative.BarVisualizer || (() => null);
