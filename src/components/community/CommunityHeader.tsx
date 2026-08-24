/**
 * CommunityHeader Component (React Native)
 *
 * Matches frontend: centered title with safe area padding, plus a back
 * control (frontend: CommunityHeader.tsx:14-30) that routes to Home.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/theme/tokens';

export interface CommunityHeaderProps {
  title?: string;
}

export function CommunityHeader({ title = 'Community' }: CommunityHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const buttonSize = tokens.control.height;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Left: back button */}
      <TouchableOpacity
        onPress={() => (navigation as any).navigate('Home')}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color="rgba(255,255,255,0.8)"
        />
      </TouchableOpacity>

      {/* Center: title — truly centered across full width */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right: spacer with same width as back button to balance the layout */}
      <View style={{ width: buttonSize }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backButton: {
    width: tokens.control.height,
    height: tokens.control.height,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: -0.02,
    color: '#fff',
    textAlign: 'center',
  },
});
