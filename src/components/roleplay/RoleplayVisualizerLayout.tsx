/**
 * RoleplayVisualizerLayout Component
 *
 * Wraps the roleplay page. Voice visualizer gradients removed — clean wrapper only.
 */

import React, { useState, createContext, useContext } from 'react';
import { View, StyleSheet } from 'react-native';

interface VoiceVolumeContextType {
  userVolumeStrength: number;
  agentVolumeStrength: number;
  setUserVolumeStrength: (strength: number) => void;
  setAgentVolumeStrength: (strength: number) => void;
}

const VoiceVolumeContext = createContext<VoiceVolumeContextType | undefined>(
  undefined
);

export const useVoiceVolume = () => {
  const context = useContext(VoiceVolumeContext);
  if (!context) {
    throw new Error(
      'useVoiceVolume must be used within RoleplayVisualizerLayout'
    );
  }
  return context;
};

interface RoleplayVisualizerLayoutProps {
  children: React.ReactNode;
}

export function RoleplayVisualizerLayout({
  children,
}: RoleplayVisualizerLayoutProps) {
  const [userVolumeStrength, setUserVolumeStrength] = useState(0);
  const [agentVolumeStrength, setAgentVolumeStrength] = useState(0);

  return (
    <VoiceVolumeContext.Provider
      value={{
        userVolumeStrength,
        agentVolumeStrength,
        setUserVolumeStrength,
        setAgentVolumeStrength,
      }}
    >
      <View style={styles.container}>
        <View style={styles.content}>{children}</View>
      </View>
    </VoiceVolumeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  content: {
    flex: 1,
  },
});
