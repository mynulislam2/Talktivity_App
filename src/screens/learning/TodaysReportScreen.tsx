import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
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
import { DiscourseCard } from '@/components/report/DiscourseCard';
import { ReportLoadingCard } from '@/components/report/ReportLoadingCard';
import { ReportErrorCard } from '@/components/report/ReportErrorCard';
import { TodayReportStepHeader } from '@/components/report/TodayReportStepHeader';

function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {children}
    </View>
  );
}

export default function TodaysReportScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const courseStatus = useAppSelector(selectCourseStatus);
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { report, isLoading, error, isExamDay, refresh, complete } =
    useTodayReportNative();
  const { overallScores, radarData } = useReportCalculations(report);

  useEffect(() => {
    if (!courseStatus) {
      dispatch(loadCourseStatus());
    }
  }, [courseStatus, dispatch]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleContinue = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    setStep((prev) => prev + 1);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFinish = async () => {
    if (isExamDay) {
      await complete();
    }
    // Navigate back to Home tab
    navigation.dispatch(
      CommonActions.navigate({ name: 'Home' })
    );
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <View style={ss.backBtnWrap}>
            <TouchableOpacity onPress={goBack} style={ss.backBtn}>
              <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
          <ReportLoadingCard />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (error || !report) {
    return (
      <GradientBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <View style={ss.backBtnWrap}>
            <TouchableOpacity onPress={goBack} style={ss.backBtn}>
              <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
          <ReportErrorCard
            error={error}
            title="Daily Report Not Available"
            onRetry={refresh}
          />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (!overallScores) {
    return (
      <GradientBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <View style={ss.backBtnWrap}>
            <TouchableOpacity onPress={goBack} style={ss.backBtn}>
              <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
          <ReportErrorCard
            error="Unable to calculate report scores"
            title="Daily Report Not Available"
            onRetry={refresh}
          />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const stepIconNames = ['bar-chart', 'chatbubbles', 'book', 'layers', 'link'] as const;
  const stepTitles = [
    'Your English Score',
    'Fluency Analysis',
    'Grammar Analysis',
    'Vocabulary Analysis',
    'Discourse Analysis',
  ] as const;
  const stepLevels = [
    String(overallScores.level ?? ''),
    String(report.fluency.fluencyLevel ?? ''),
    String(report.grammar.grammarLevel ?? ''),
    String(report.vocabulary.vocabularyLevel ?? ''),
    String(report.discourse.discourseLevel ?? ''),
  ] as const;

  const enhancedRadarData = radarData.map((item: any, index: number) => ({
    ...item,
    icon: ['chatbubble', 'trending-up', 'book', 'link'][index],
    iconColor: ['#7B70FF', '#fb923c', '#a78bfa', '#818cf8'][index],
    bgColor: [
      'rgba(59,130,246,0.2)',
      'rgba(251,146,60,0.2)',
      'rgba(167,139,250,0.2)',
      'rgba(129,140,248,0.2)',
    ][index],
    description: [
      'Fluency is the ability to speak smoothly and confidently without unnecessary pauses.',
      'Vocabulary is the range of words you know and can use to express your thoughts clearly.',
      'Grammar is the set of rules that structure sentences correctly and meaningfully.',
      'Discourse refers to how ideas are connected and organized in longer speech or writing.',
    ][index],
  }));

  const pages: React.ReactNode[] = [
    <EnglishScoreCard
      key="overview"
      overallScores={overallScores}
      radarData={enhancedRadarData}
      onContinue={handleContinue}
      showIcons
      hideHeroTitle
    />,
    <FluencyCard
      key="fluency"
      fluency={report.fluency}
      onContinue={handleContinue}
      hideSectionHeader
    />,
    <GrammarCard
      key="grammar"
      grammar={report.grammar}
      onContinue={handleContinue}
      hideSectionHeader
    />,
    <VocabularyCard
      key="vocabulary"
      vocabulary={report.vocabulary}
      onContinue={handleContinue}
      hideSectionHeader
    />,
    <DiscourseCard
      key="discourse"
      discourse={report.discourse}
      onFinish={handleFinish}
      hideSectionHeader
    />,
  ].filter(Boolean);

  return (
    <GradientBackground>
      <SafeAreaView style={ss.safe} edges={['top']}>
        <View style={ss.backBtnWrap}>
          <TouchableOpacity onPress={goBack} style={ss.backBtn}>
            <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        <TodayReportStepHeader
          title={stepTitles[step]}
          level={stepLevels[step]}
          iconName={stepIconNames[step]}
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
    </GradientBackground>
  );
}

const ss = StyleSheet.create({
  safe: { flex: 1 },
  page: { flex: 1 },
  backBtnWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
