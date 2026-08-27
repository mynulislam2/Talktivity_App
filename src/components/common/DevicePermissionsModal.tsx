import React from 'react';
import { View, Text, StyleSheet, Modal, PermissionsAndroid, Platform, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';

interface DevicePermissionsModalProps {
  visible: boolean;
  onClose: () => void;
  onGranted?: () => void;
}

export function DevicePermissionsModal({ visible, onClose, onGranted }: DevicePermissionsModalProps) {
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Access',
            message: 'Talktivity needs microphone access so you can speak to Aleena.',
            buttonPositive: 'Allow',
          }
        );
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          onGranted?.();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      onGranted?.();
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Audio Setup</Text>
          <Text style={styles.message}>
            Allow microphone access and turn up your volume to hear Aleena clearly.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText} numberOfLines={1} adjustsFontSizeToFit>
                Skip
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <FigmaPrimaryButton onPress={requestPermissions} style={{ paddingVertical: 12, height: 'auto', minHeight: 46 }}>
                <Text style={styles.continueText} numberOfLines={1} adjustsFontSizeToFit>
                  Continue
                </Text>
              </FigmaPrimaryButton>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: '#1c1f38',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#3d3e50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  cancelText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  continueText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});
