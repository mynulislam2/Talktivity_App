/**
 * HomeViewToggle Component (React Native)
 *
 * Switch between 'today' and 'timeline' views.
 * Active tab uses gradient matching FigmaPrimaryButton (#2C5BFF → #A45DFF).
 * Matches talktivity_frontend/components/home/HomeViewToggle.tsx.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';

export interface HomeViewToggleProps {
  viewMode: 'today' | 'timeline';
  onViewModeChange: (mode: 'today' | 'timeline') => void;
}

export const HomeViewToggle: React.FC<HomeViewToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Today's Plan Button */}
        <TouchableOpacity
          onPress={() => onViewModeChange('today')}
          style={styles.tabWrapper}
          activeOpacity={0.7}
          aria-label="Switch to today's plan view"
        >
          {viewMode === 'today' ? (
            <LinearGradient
              colors={['#2C5BFF', '#A45DFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tabActiveGradient}
            >
              <Feather
                name="calendar"
                size={16}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.tabTextActive}>Today&apos;s Plan</Text>
            </LinearGradient>
          ) : (
            <View style={styles.tabInactive}>
              <Feather
                name="calendar"
                size={16}
                color="rgba(255,255,255,0.5)"
                style={styles.icon}
              />
              <Text style={styles.tabTextInactive}>Today&apos;s Plan</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Full Timeline Button */}
        <TouchableOpacity
          onPress={() => onViewModeChange('timeline')}
          style={styles.tabWrapper}
          activeOpacity={0.7}
          aria-label="Switch to full timeline view"
        >
          {viewMode === 'timeline' ? (
            <LinearGradient
              colors={['#2C5BFF', '#A45DFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tabActiveGradient}
            >
              <Feather
                name="bar-chart-2"
                size={16}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.tabTextActive}>Full Timeline</Text>
            </LinearGradient>
          ) : (
            <View style={styles.tabInactive}>
              <Feather
                name="bar-chart-2"
                size={16}
                color="rgba(255,255,255,0.5)"
                style={styles.icon}
              />
              <Text style={styles.tabTextInactive}>Full Timeline</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  inner: {
    marginTop: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabWrapper: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tabActiveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: 'rgba(41,73,255,0.18)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 4,
  },
  tabInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  icon: {
    zIndex: 1,
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    zIndex: 1,
  },
  tabTextInactive: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  glowDark: {
    position: 'absolute',
    left: '50%',
    top: '58%',
    width: '72%',
    height: 18,
    transform: [{ translateX: '-50%' }, { translateY: -9 }],
    borderRadius: 100,
    backgroundColor: '#381d45',
    opacity: 0.95,
  },
  glowMagenta: {
    position: 'absolute',
    left: '50%',
    top: '73%',
    width: '64%',
    height: 16,
    transform: [{ translateX: '-50%' }, { translateY: -8 }],
    borderRadius: 100,
    backgroundColor: 'rgba(187,45,255,0.52)',
  },
});
