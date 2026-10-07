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
import ProgressScreen from '../screens/learning/ProgressScreen';
import ReportScreen from '../screens/learning/ReportScreen';
import TodaysReportScreen from '../screens/learning/TodaysReportScreen';
import QuizScreen from '../screens/learning/QuizScreen';
import ListeningScreen from '../screens/learning/ListeningScreen';
import ListeningQuizScreen from '../screens/learning/ListeningQuizScreen';
import IeltsListeningScreen from '../screens/learning/IeltsListeningScreen';
import IeltsSpeakingScreen from '../screens/learning/IeltsSpeakingScreen';
import GrammarHubScreen from '../screens/grammar/GrammarHubScreen';
import GrammarLessonScreen from '../screens/grammar/GrammarLessonScreen';
import GrammarQuizScreen from '../screens/grammar/GrammarQuizScreen';
import VocabularyHomeScreen from '../screens/vocabulary/VocabularyHomeScreen';
import VocabularyAllTopicsScreen from '../screens/vocabulary/VocabularyAllTopicsScreen';
import VocabularyTopicScreen from '../screens/vocabulary/VocabularyTopicScreen';
import VocabularyLearnScreen from '../screens/vocabulary/VocabularyLearnScreen';
import VocabularySavedScreen from '../screens/vocabulary/VocabularySavedScreen';

import { LearningStackParamList } from './types';

const Stack = createNativeStackNavigator<LearningStackParamList>();

const LearningNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="TopicsScreen" component={TopicsScreen} />
      <Stack.Screen name="PracticeScreen" component={PracticeScreen} />
      <Stack.Screen name="ProgressScreen" component={ProgressScreen} />
      <Stack.Screen name="ReportScreen" component={ReportScreen} options={{}} />
      <Stack.Screen
        name="TodaysReportScreen"
        component={TodaysReportScreen}
        options={{}}
      />
      <Stack.Screen name="QuizScreen" component={QuizScreen} options={{}} />
      <Stack.Screen
        name="ListeningScreen"
        component={ListeningScreen}
        options={{}}
      />
      <Stack.Screen
        name="ListeningQuizScreen"
        component={ListeningQuizScreen}
        options={{}}
      />
      <Stack.Screen
        name="IeltsListeningScreen"
        component={IeltsListeningScreen}
        options={{}}
      />
      <Stack.Screen
        name="IeltsSpeakingScreen"
        component={IeltsSpeakingScreen}
        options={{}}
      />
      <Stack.Screen
        name="GrammarHubScreen"
        component={GrammarHubScreen}
        options={{}}
      />
      <Stack.Screen
        name="GrammarLessonScreen"
        component={GrammarLessonScreen}
        options={{}}
      />
      <Stack.Screen
        name="GrammarQuizScreen"
        component={GrammarQuizScreen}
        options={{}}
      />
      <Stack.Screen
        name="VocabularyHomeScreen"
        component={VocabularyHomeScreen}
        options={{}}
      />
      <Stack.Screen
        name="VocabularyAllTopicsScreen"
        component={VocabularyAllTopicsScreen}
        options={{}}
      />
      <Stack.Screen
        name="VocabularyTopicScreen"
        component={VocabularyTopicScreen}
        options={{}}
      />
      <Stack.Screen
        name="VocabularyLearnScreen"
        component={VocabularyLearnScreen}
        options={{}}
      />
      <Stack.Screen
        name="VocabularySavedScreen"
        component={VocabularySavedScreen}
        options={{}}
      />
    </Stack.Navigator>
  );
};

export default LearningNavigator;

