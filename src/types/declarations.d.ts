declare module 'livekit-react-native' {
  export * from '@livekit/react-native';
  export const VideoView: any;
  export const Room: any;
  export const AudioSession: any;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function useSearchParams(): any;
  export function usePathname(): any;
}

declare module '@react-oauth/google' {
  export const GoogleLogin: any;
  export const googleLogout: any;
  export function useGoogleLogin(): any;
}

declare module 'react-speech-recognition' {
  export function useSpeechRecognition(): any;
  export const SpeechRecognition: any;
  export default SpeechRecognition;
}

declare module '@/app/api/connection-details/route' {
  const content: any;
  export default content;
}

declare module 'expo-av' {
  export namespace Audio {
    class Sound {
      static createAsync(
        source: { uri: string } | number,
        initialStatus?: any,
        onPlaybackStatusUpdate?: (status: any) => void
      ): Promise<{ sound: Sound; status: any }>;
      playAsync(): Promise<any>;
      pauseAsync(): Promise<any>;
      stopAsync(): Promise<any>;
      unloadAsync(): Promise<any>;
      setOnPlaybackStatusUpdate(onPlaybackStatusUpdate: (status: any) => void): void;
      getStatusAsync(): Promise<any>;
      setPositionAsync(millis: number): Promise<any>;
      setVolumeAsync(volume: number): Promise<any>;
    }
    function setAudioModeAsync(mode: {
      allowsRecordingIOS?: boolean;
      playsInSilentModeIOS?: boolean;
      staysActiveInBackground?: boolean;
      shouldDuckAndroid?: boolean;
      playThroughEarpieceAndroid?: boolean;
    }): Promise<void>;
    function setIsAudioEnabledAsync(enabled: boolean): Promise<void>;
  }
  export const Video: any;
}
