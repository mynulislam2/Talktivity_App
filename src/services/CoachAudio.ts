import { NativeModules } from 'react-native';

const { CoachAudioModule } = NativeModules;

export async function playCoachAudioFile(filePath: string): Promise<void> {
  if (!CoachAudioModule) {
    throw new Error('CoachAudioModule not available');
  }
  return CoachAudioModule.playFile(filePath);
}

export function stopCoachAudio(): void {
  CoachAudioModule?.stop();
}
