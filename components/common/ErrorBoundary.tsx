/**
 * Error Boundary Component
 *
 * Catches rendering errors and displays fallback UI
 * Prevents full app crash on component errors
 */

import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logError, AppError, ErrorType } from '@/lib/errorHandler';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Custom Error Boundary for React Error handling
 * Note: React Native doesn't have built-in error boundaries,
 * so this is implemented as a class component wrapper
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state so the next render will show the fallback UI
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    logError(error, 'ErrorBoundary');

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use provided fallback or default error UI
      return (
        this.props.fallback || (
          <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
              <View style={styles.errorIcon}>
                <Ionicons name="alert-circle" size={80} color={colors.danger} />
              </View>

              <Text style={styles.title}>Something Went Wrong</Text>
              <Text style={styles.message}>
                An unexpected error occurred. Please try again or contact support if the problem persists.
              </Text>

              {/* Error Details (Development Only) */}
              {__DEV__ && this.state.error && (
                <View style={styles.debugSection}>
                  <Text style={styles.debugTitle}>Error Details (Dev Only)</Text>
                  <Text style={styles.errorMessage}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text style={styles.stackTrace}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              )}

              <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  errorIcon: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 24,
  },
  debugSection: {
    width: '100%',
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: spacing.lg,
    marginVertical: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'Menlo',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  stackTrace: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'Menlo',
    lineHeight: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: spacing.sm,
  },
});

export default ErrorBoundary;
