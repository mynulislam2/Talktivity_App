import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadCourseStatus,
  selectCourseStatus,
} from '@/store/slices/courseSlice';
import { useTodayReportNative } from '@/hooks/report/useTodayReportNative';
import { useReportCalculations } from '@/hooks/report/useReportCalculations';
import { EnglishScoreCard } from '@/components/report/EnglishScoreCard';
import { FluencyCard } from '@/components/report/FluencyCard';
import { GrammarCard } from '@/components/report/GrammarCard';
import { VocabularyCard } from '@/components/report/VocabularyCard';
import { PronunciationCard } from '@/components/report/PronunciationCard';
import { ActionPlanCard } from '@/components/report/ActionPlanCard';
import { ReportLoadingCard } from '@/components/report/ReportLoadingCard';
import { TodayReportStepHeader } from '@/components/report/TodayReportStepHeader';
import { tokens } from '@/theme/tokens';
import { AppBackground } from '../../components/common/AppBackground';

export default function TodaysReportScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const courseStatus = useAppSelector(selectCourseStatus);
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { report, isLoading, isExamDay, complete } =
    useTodayReportNative();
  const { overallScores } = useReportCalculations(report);

  useEffect(() => {
    if (!courseStatus) {
      dispatch(loadCourseStatus());
    }
  }, [courseStatus, dispatch]);

  const handleContinue = () => {
    if (step < 5) {
      // Smooth horizontal transition between deep dive steps
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setStep((prev) => prev + 1);
        slideAnim.setValue(30);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleFinish = async () => {
    if (isExamDay) {
      await complete();
    }
    // Navigate back to Home / Today's Plan
    navigation.dispatch(
      CommonActions.navigate({ name: 'Home' })
    );
  };

  if (isLoading) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <TouchableOpacity
            onPress={goBack}
            style={ss.loadingBackBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <ReportLoadingCard />
        </SafeAreaView>
      </AppBackground>
    );
  }

  const stepTitles = [
    'IELTS Speaking Score',
    'Fluency & Coherence',
    'Lexical Resource',
    'Grammar & Accuracy',
    'Pronunciation',
    'Action Plan',
  ] as const;

  const pages: React.ReactNode[] = [
    <EnglishScoreCard
      key="overview"
      overallScores={overallScores}
      onContinue={handleContinue}
      showIcons
    />,
    <FluencyCard
      key="fluency"
      fluency={report?.fluency}
      onContinue={handleContinue}
      hideSectionHeader
    />,
    <VocabularyCard
      key="vocabulary"
      vocabulary={report?.vocabulary}
      onContinue={handleContinue}
      hideSectionHeader
    />,
    <GrammarCard
      key="grammar"
      grammar={report?.grammar}
      onContinue={handleContinue}
      hideSectionHeader
    />,
    <PronunciationCard
      key="pronunciation"
      pronunciation={report?.pronunciation}
      onContinue={handleContinue}
      hideSectionHeader
    />,
    <ActionPlanCard
      key="actionPlan"
      report={report ?? undefined}
      onFinish={handleFinish}
      hideSectionHeader
    />,
  ];

  return (
    <AppBackground>
      <SafeAreaView style={ss.safe} edges={['top']}>
        <TodayReportStepHeader
          title={stepTitles[step]}
          onBack={goBack}
        />
        <Animated.View
          style={[
            ss.page,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          {pages[step]}
        </Animated.View>
      </SafeAreaView>
    </AppBackground>
  );
}

const ss = StyleSheet.create({
  safe: { flex: 1 },
  page: { flex: 1 },
  loadingBackBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
});
