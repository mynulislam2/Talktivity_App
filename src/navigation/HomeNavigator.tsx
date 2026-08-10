/**
 * Home Navigator
 *
 * Stack navigation for home-related screens:
 * - HomeScreen (dashboard)
 * - PracticeScreen (shared with Topics/Roleplay stack)
 * - Quiz / Listening Quiz / Report (as needed from Home)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import HomePracticeScreen from '../screens/home/HomePracticeScreen';
import GeneralPracticeScreen from '../screens/learning/GeneralPracticeScreen';
import QuizScreen from '../screens/learning/QuizScreen';
import { ReviewScreen } from '../screens/review/ReviewScreen';
import ListeningScreen from '../screens/learning/ListeningScreen';
import ListeningQuizScreen from '../screens/learning/ListeningQuizScreen';
import ReportScreen from '../screens/learning/ReportScreen';
import TodaysReportScreen from '../screens/learning/TodaysReportScreen';

import { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="HomeScreen"
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen as any} />
      <Stack.Screen name="PracticeScreen" component={HomePracticeScreen} />
      <Stack.Screen name="GeneralPracticeScreen" component={GeneralPracticeScreen} />
      <Stack.Screen
        name="QuizScreen"
        component={QuizScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ReviewScreen"
        component={ReviewScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ListeningScreen"
        component={ListeningScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ListeningQuizScreen"
        component={ListeningQuizScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ReportScreen"
        component={ReportScreen as any}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="TodaysReportScreen"
        component={TodaysReportScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
