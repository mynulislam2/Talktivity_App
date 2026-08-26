import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({
  visible,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Log Out?</Text>
          <Text style={styles.message}>
            Are you sure you want to log out of your account?
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText} numberOfLines={1} adjustsFontSizeToFit>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.endBtn}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.endText} numberOfLines={1} adjustsFontSizeToFit>
                Log Out
              </Text>
            </TouchableOpacity>
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
  },
  cancelText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  endBtn: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
    backgroundColor: 'rgba(255,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endText: {
    textAlign: 'center',
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});
