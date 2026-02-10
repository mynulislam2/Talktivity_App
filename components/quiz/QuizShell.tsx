/**
 * QuizShell Component (React Native)
 * 
 * Container for quiz content with header and footer.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

export interface QuizShellProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  fullScreen?: boolean;
}

export function QuizShell({
  header,
  children,
  footer,
  fullScreen = true,
}: QuizShellProps) {
  return (
    <View style={[styles.container, !fullScreen && styles.notFullScreen]}>
      {header ? (
        <View style={styles.header}>
          <View style={styles.headerContent}>{header}</View>
        </View>
      ) : null}

      <View style={styles.content}>{children}</View>

      {footer ? (
        <View style={styles.footer}>
          <View style={styles.footerContent}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0a0923',
  },
  notFullScreen: {
    minHeight: 'auto',
  },
  header: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
    backgroundColor: 'rgba(10, 9, 35, 0.3)',
  },
  headerContent: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  footer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.3)',
    backgroundColor: 'rgba(10, 9, 35, 0.3)',
  },
  footerContent: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
