/**
 * MainNavigatorWrapper Component
 *
 * Wraps MainNavigator with global route protection.
 * Handles lifecycle-based redirects for authenticated users.
 */

import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainNavigator from './MainNavigator';
import { useGlobalRouteGuard } from '@/hooks/navigation/useGlobalRouteGuard';
import { DevicePermissionsModal } from '@/components/common/DevicePermissionsModal';

import { PermissionsAndroid, Platform } from 'react-native';

export default function MainNavigatorWrapper() {
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // Apply global route protection
  useGlobalRouteGuard();

  useEffect(() => {
    const checkPermissionsModal = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenPermissionsModal');
        if (!hasSeen) {
          let hasPermission = false;
          if (Platform.OS === 'android') {
            hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
          }
          
          if (hasPermission) {
            // Already has permission, silently mark as seen
            await AsyncStorage.setItem('hasSeenPermissionsModal', 'true');
          } else {
            setShowPermissionsModal(true);
          }
        }
      } catch (err) {
        console.warn(err);
      }
    };
    checkPermissionsModal();
  }, []);

  const handleCloseModal = async () => {
    setShowPermissionsModal(false);
    try {
      await AsyncStorage.setItem('hasSeenPermissionsModal', 'true');
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <>
      <MainNavigator />
      <DevicePermissionsModal 
        visible={showPermissionsModal} 
        onClose={handleCloseModal} 
      />
    </>
  );
}
