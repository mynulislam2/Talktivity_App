/**
 * Modal Component
 *
 * Reusable modal dialog wrapper
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ModalProps,
} from 'react-native';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

interface CustomModalProps extends Omit<ModalProps, 'children'> {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  showCloseButton?: boolean;
  closeButtonText?: string;
}

const Modal: React.FC<CustomModalProps> = ({
  title,
  children,
  onClose,
  showCloseButton = true,
  closeButtonText = 'Close',
  visible,
  ...props
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}

          <View style={styles.content}>{children}</View>

          {showCloseButton && (
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>{closeButtonText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    maxWidth: '90%',
    maxHeight: '90%',
  },
  header: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  content: {
    marginVertical: spacing.md,
  },
  closeButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.body2,
    color: '#fff',
    fontWeight: '600',
  },
});

export default Modal;
