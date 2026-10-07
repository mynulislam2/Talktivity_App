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
import QuizScreen from '../screens/learning/QuizScreen';
import { ReviewScreen } from '../screens/review/ReviewScreen';
import ListeningScreen from '../screens/learning/ListeningScreen';
import ListeningQuizScreen from '../screens/learning/ListeningQuizScreen';
import IeltsListeningScreen from '../screens/learning/IeltsListeningScreen';
import IeltsSpeakingScreen from '../screens/learning/IeltsSpeakingScreen';
import ReportScreen from '../screens/learning/ReportScreen';
import TodaysReportScreen from '../screens/learning/TodaysReportScreen';
import GrammarHubScreen from '../screens/grammar/GrammarHubScreen';
import GrammarLessonScreen from '../screens/grammar/GrammarLessonScreen';
import GrammarQuizScreen from '../screens/grammar/GrammarQuizScreen';
import VocabularyHomeScreen from '../screens/vocabulary/VocabularyHomeScreen';
import VocabularyAllTopicsScreen from '../screens/vocabulary/VocabularyAllTopicsScreen';
import VocabularyTopicScreen from '../screens/vocabulary/VocabularyTopicScreen';
import VocabularyLearnScreen from '../screens/vocabulary/VocabularyLearnScreen';
import VocabularySavedScreen from '../screens/vocabulary/VocabularySavedScreen';

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
        name="IeltsListeningScreen"
        component={IeltsListeningScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="IeltsSpeakingScreen"
        component={IeltsSpeakingScreen}
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
      <Stack.Screen
        name="GrammarHubScreen"
        component={GrammarHubScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="GrammarLessonScreen"
        component={GrammarLessonScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="GrammarQuizScreen"
        component={GrammarQuizScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="VocabularyHomeScreen"
        component={VocabularyHomeScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="VocabularyAllTopicsScreen"
        component={VocabularyAllTopicsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="VocabularyTopicScreen"
        component={VocabularyTopicScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="VocabularyLearnScreen"
        component={VocabularyLearnScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="VocabularySavedScreen"
        component={VocabularySavedScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
