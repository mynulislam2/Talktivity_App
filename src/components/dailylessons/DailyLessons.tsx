/**
 * DailyLessons Component (React Native)
 *
 * Displays daily lesson cards.
 * Matches Next.js implementation.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LessonCard } from './LessonCard';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

const DailyLessons: React.FC = () => {
  const [isAvailable, setIsAvailable] = useState(false);

  const lessons = [
    {
      thumbnail: 'https://i.ibb.co.com/gbZkFp68/div-2.png',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      colors: ['rgba(74, 144, 226, 0.5)', '#000000'],
      title: 'Basic Greetings',
      duration: 2,
    },
    {
      thumbnail: 'https://i.ibb.co.com/1J2tyR3q/div-4.png',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      colors: ['rgba(155, 81, 224, 0.5)', '#000000'],
      title: 'Common Phrases',
      duration: 5,
    },
    {
      thumbnail:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      colors: ['rgba(74, 144, 226, 0.5)', '#000000'],
      title: 'Advanced Conversations',
      duration: 10,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Daily Lessons</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.lessonsList}
      >
        {lessons.map((lesson, index) => (
          <LessonCard
            key={index}
            lesson={lesson}
            setIsAvailable={setIsAvailable}
          />
        ))}
      </ScrollView>
      {isAvailable && (
        <Text style={styles.comingSoonText}>Daily Lessons Coming Soon</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  lessonsList: {
    gap: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
  },
  comingSoonText: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});

export default DailyLessons;
