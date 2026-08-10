import React from 'react';
import { ActivityIndicator, StyleSheet, View, Modal } from 'react-native';

import { colors } from '../../styles/colors';

interface LoaderProps {
  visible?: boolean;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({
  visible = true,
  fullScreen = false,
  size = 'large',
  color = colors.brand.buttonPrimary,
}) => {
  if (fullScreen) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <ActivityIndicator size={size} color={color} />
        </View>
      </Modal>
    );
  }

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loader;
