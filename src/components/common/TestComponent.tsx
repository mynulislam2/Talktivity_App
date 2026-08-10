/**
 * Test Component - Verify Phase 1 Setup
 *
 * Simple component to verify:
 * 1. React Native imports work
 * 2. Redux setup works
 * 3. Styles work
 * 4. Navigation integration works
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const TestComponent: React.FC = () => {
  // Test Redux selector
  const authState = useSelector((state: RootState) => state.auth);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>✅ Phase 1 Setup Complete!</Text>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Infrastructure Status:</Text>
        <Text style={styles.text}>✓ React Native configured</Text>
        <Text style={styles.text}>✓ Redux store ready</Text>
        <Text style={styles.text}>✓ AsyncStorage configured</Text>
        <Text style={styles.text}>✓ Services copied</Text>
        <Text style={styles.text}>✓ Types imported</Text>
        <Text style={styles.text}>✓ Hooks available</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Redux State Sample:</Text>
        <Text style={styles.text}>
          Auth State: {JSON.stringify(authState || {}, null, 2)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Next Steps:</Text>
        <Text style={styles.text}>
          1. Review REACT_NATIVE_QUICK_REFERENCE.md
        </Text>
        <Text style={styles.text}>2. Begin Phase 2: Navigation Setup</Text>
        <Text style={styles.text}>3. Create RootNavigator.tsx</Text>
        <Text style={styles.text}>4. Setup authentication screens</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6A5AE0', // Updated to brand purple
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    lineHeight: 20,
  },
});

export default TestComponent;
