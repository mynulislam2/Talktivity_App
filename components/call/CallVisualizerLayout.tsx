/**
 * CallVisualizerLayout Component (React Native)
 * 
 * Wraps the call page with gradient visualizers that respond to voice activity.
 * Matches Next.js implementation.
 */

import React, { useState, createContext, useContext } from 'react';
import { View, StyleSheet } from 'react-native';

interface VoiceVolumeContextType {
  userVolumeStrength: number;
  agentVolumeStrength: number;
  setUserVolumeStrength: (strength: number) => void;
  setAgentVolumeStrength: (strength: number) => void;
}

const VoiceVolumeContext = createContext<VoiceVolumeContextType | undefined>(undefined);

export const useVoiceVolume = () => {
  const context = useContext(VoiceVolumeContext);
  if (!context) {
    throw new Error('useVoiceVolume must be used within CallVisualizerLayout');
  }
  return context;
};

interface CallVisualizerLayoutProps {
  children: React.ReactNode;
}

export function CallVisualizerLayout({ children }: CallVisualizerLayoutProps) {
  const [userVolumeStrength, setUserVolumeStrength] = useState(0);
  const [agentVolumeStrength, setAgentVolumeStrength] = useState(0);

  // Calculate color based on volume strength (0-1)
  const getAgentColor = (strength: number) => {
    const minColor = [15, 15, 35];
    const maxColor = [40, 50, 100];
    const r = Math.round(minColor[0] + (maxColor[0] - minColor[0]) * strength);
    const g = Math.round(minColor[1] + (maxColor[1] - minColor[1]) * strength);
    const b = Math.round(minColor[2] + (maxColor[2] - minColor[2]) * strength);
    return `rgba(${r}, ${g}, ${b}, ${0.6 + strength * 0.3})`;
  };

  const getUserColor = (strength: number) => {
    const minColor = [15, 15, 35];
    const maxColor = [40, 50, 100];
    const r = Math.round(minColor[0] + (maxColor[0] - minColor[0]) * strength);
    const g = Math.round(minColor[1] + (maxColor[1] - minColor[1]) * strength);
    const b = Math.round(minColor[2] + (maxColor[2] - minColor[2]) * strength);
    return `rgba(${r}, ${g}, ${b}, ${0.6 + strength * 0.3})`;
  };

  const finalAgentOpacity = agentVolumeStrength > 0.05 ? 1 : 0;
  const finalUserOpacity = userVolumeStrength > 0.05 ? 1 : 0;

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
        {/* Agent gradient overlay (top) */}
        {finalAgentOpacity > 0 && (
          <View
            style={[
              styles.agentGradient,
              { backgroundColor: getAgentColor(agentVolumeStrength), opacity: finalAgentOpacity }
            ]}
          />
        )}

        {/* User gradient overlay (bottom) */}
        {finalUserOpacity > 0 && (
          <View
            style={[
              styles.userGradient,
              { backgroundColor: getUserColor(userVolumeStrength), opacity: finalUserOpacity }
            ]}
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </VoiceVolumeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    position: 'relative',
  },
  agentGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '20%',
    zIndex: 1,
  },
  userGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
});
