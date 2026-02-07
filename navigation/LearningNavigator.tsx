/**
 * Learning Navigator
 * 
 * Stack navigation for learning features:
 * - Topics (entry point)
 * - Practice
 * - Call
 * - Roleplay
 * - Progress
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TopicsScreen from '../screens/learning/TopicsScreen';
import PracticeScreen from '../screens/learning/PracticeScreen';
import CallScreen from '../screens/learning/CallScreen';
import RoleplayScreen from '../screens/learning/RoleplayScreen';
import ProgressScreen from '../screens/learning/ProgressScreen';
import ReportScreen from '../screens/learning/ReportScreen';
import QuizScreen from '../screens/learning/QuizScreen';
import ListeningQuizScreen from '../screens/learning/ListeningQuizScreen';

import { LearningStackParamList } from './types';

const Stack = createNativeStackNavigator<LearningStackParamList>();

const LearningNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="TopicsScreen"
        component={TopicsScreen}
      />
      <Stack.Screen
        name="PracticeScreen"
        component={PracticeScreen}
      />
      <Stack.Screen
        name="CallScreen"
        component={CallScreen}
      />
      <Stack.Screen
        name="RoleplayScreen"
        component={RoleplayScreen}
      />
      <Stack.Screen
        name="ProgressScreen"
        component={ProgressScreen}
      />
      <Stack.Screen
        name="ReportScreen"
        component={ReportScreen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="QuizScreen"
        component={QuizScreen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="ListeningQuizScreen"
        component={ListeningQuizScreen}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default LearningNavigator;
