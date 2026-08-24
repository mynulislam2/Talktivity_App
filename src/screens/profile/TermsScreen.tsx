import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenBackground from '../../components/common/ScreenBackground';

interface TermsScreenProps {
  navigation: any;
}

const TermsScreen: React.FC<TermsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View
          style={[styles.header, { paddingTop: Math.max(insets.top + 8, 16) }]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.text}>
            Welcome to Talktivity. These Terms of Service ("Terms") govern your
            use of our platform, website, and mobile applications (collectively,
            the "Service"). By accessing or using Talktivity, you agree to be
            bound by these Terms.
          </Text>
          {/* ... shorter version for brevity - keeping legal content concise */}
          <Text style={styles.text}>
            For the full terms and conditions, please visit our website or contact
            support@talktivity.com
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: { flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#fff',
    textAlign: 'center',
  },
  content: { padding: 20, gap: 16 },
  text: { fontSize: 14, lineHeight: 22, color: 'rgba(255,255,255,0.7)' },
});

export default TermsScreen;
