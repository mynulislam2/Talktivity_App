/**
 * QuizShell Component (React Native)
 *
 * Container for quiz content with header and footer. The question/options
 * body scrolls (matching the web's `flex-1 overflow-y-auto` quiz body) so
 * longer questions never get clipped by the footer.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

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
  },
  notFullScreen: {
    minHeight: 'auto',
  },
  header: {
    width: '100%',
  },
  headerContent: {
    maxWidth: tokens.layout.maxWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: tokens.layout.gutter,
    paddingTop: 6,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    maxWidth: tokens.layout.maxWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: tokens.layout.gutter,
    paddingTop: 24,
    paddingBottom: 24,
  },
  footer: {
    width: '100%',
  },
  footerContent: {
    maxWidth: tokens.layout.maxWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: tokens.layout.gutter,
    paddingTop: 16,
    paddingBottom: 18,
  },
});
