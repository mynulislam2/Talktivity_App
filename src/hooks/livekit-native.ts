import React from 'react';

export const AudioSession: React.FC<{ children: React.ReactNode }> & {
  startAudioSession: () => Promise<void>;
  stopAudioSession: () => Promise<void>;
} = Object.assign(
  ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  {
    startAudioSession: async () => {},
    stopAudioSession: async () => {},
  }
);

export function useIOSAudioManagement(_room?: any, _enabled?: boolean): {} {
  return {};
}

export interface LocalParticipantInfo {
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenShareEnabled: boolean;
  cameraTrack: any;
  microphoneTrack: any;
  localParticipant: any;
}

export function useLocalParticipant(): LocalParticipantInfo {
  return {
    isMicrophoneEnabled: false,
    isCameraEnabled: false,
    isScreenShareEnabled: false,
    cameraTrack: null,
    microphoneTrack: null,
    localParticipant: null,
  };
}

export function useParticipantTracks(..._args: any[]): any[] {
  return [];
}

export function useRoomContext(): any {
  return {};
}

export const VideoTrack: React.FC<{ trackRef?: any; style?: any }> = () => {
  return null;
};

export const BarVisualizer: React.FC<any> = () => {
  return null;
};

export function useRemoteParticipants(): any[] {
  return [];
}

export function useTracks(): any[] {
  return [];
}

export function useConnectionState(): string {
  return 'disconnected';
}

export function useTrackToggle(_options: { source: any }): {
  toggle: () => void;
  enabled: boolean;
} {
  return { toggle: () => {}, enabled: false };
}

export function useSessionMessages(): {
  messages: any[];
  send: (msg: string) => void;
} {
  return { messages: [], send: () => {} };
}
