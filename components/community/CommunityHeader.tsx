/**
 * CommunityHeader Component (React Native)
 * 
 * Header component for the community page with back button and title.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export function CommunityHeader() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) + 8 }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              (navigation as any).navigate('MainTabs', { screen: 'Home' });
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#d1d5db" />
          </TouchableOpacity>
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={20} color="#fff" />
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>Connect & Learn Together</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
    paddingBottom: 12,
    backgroundColor: 'rgba(26, 27, 60, 0.9)',
  },
  content: {
    width: '100%',
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  titleSection: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7B70FF',
  },
  subtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});
