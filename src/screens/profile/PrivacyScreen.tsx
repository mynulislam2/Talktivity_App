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

interface PrivacyScreenProps {
  navigation: any;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <ScreenBackground>
      <SafeAreaView style={s.container} edges={['left', 'right']}>
        <View style={[s.header, { paddingTop: Math.max(insets.top + 8, 16) }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>
          <View style={s.spacer} />
          <Text style={s.title}>Privacy Policy</Text>
          <View style={s.spacer} />
        </View>
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.text}>
            Your privacy is important to us. We collect and use personal data only
            as necessary to provide and improve our service. We do not sell your
            personal information to third parties. For the full privacy policy,
            please visit our website or contact support@talktivity.com.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: { flex: 1 },
  title: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    textAlign: 'center',
  },
  content: { padding: 20 },
  text: { fontSize: 14, fontFamily: 'Poppins', lineHeight: 22, color: 'rgba(255,255,255,0.7)' },
});

export default PrivacyScreen;

