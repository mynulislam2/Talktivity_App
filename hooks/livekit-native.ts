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

// Use @livekit/components-react for web, @livekit/react-native for native
export const useLocalParticipant = LKNative.useLocalParticipant || LKComponents.useLocalParticipant;
export const useParticipantTracks = LKNative.useParticipantTracks || LKComponents.useParticipantTracks;
export const useRoomContext = LKNative.useRoomContext || LKComponents.useRoomContext;

export const VideoTrack = LKNative.VideoTrack || LKComponents.VideoTrack;
export const BarVisualizer = LKNative.BarVisualizer || (() => null);
