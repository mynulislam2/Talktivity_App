/**
 * CertificatesTeaserCard Component (React Native)
 *
 * Teaser card for certificates — matches frontend.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function CertificatesTeaserCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Certificates</Text>

      <View style={styles.body}>
        <View style={styles.iconContainer}>
          <Ionicons name="ribbon-outline" size={64} color="#5bb7ff" />
        </View>
        <Text style={styles.bodyText}>
          Complete courses to get certificates
        </Text>
      </View>

      <View style={styles.comingSoonRow}>
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Coming soon</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.12,
    color: '#fff',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  iconContainer: {
    width: 96,
    height: 82,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyText: {
    fontSize: 18,
    fontFamily: 'Poppins',
    lineHeight: 25,
    color: '#fff',
    flex: 1,
  },
  comingSoonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  comingSoonBadge: {
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 16,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 22,
    color: '#fff',
  },
});
