import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { CallScreenContent } from '../learning/CallScreen';

type AuthCallScreenProps = NativeStackScreenProps<AuthStackParamList, 'CallScreen'>;

const AuthCallScreen: React.FC<AuthCallScreenProps> = ({ navigation, route }) => {
  return <CallScreenContent navigation={navigation} route={route} />;
};

export default AuthCallScreen;

