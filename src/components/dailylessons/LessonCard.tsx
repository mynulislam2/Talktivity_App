/**
 * LessonCard Component (React Native)
 *
 * Individual lesson card for daily lessons.
 * Matches Next.js implementation.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface Lesson {
  thumbnail: string;
  url: string;
  colors: string[];
  title: string;
  duration: number;
}

interface LessonCardProps {
  lesson: Lesson;
  setIsAvailable: (available: boolean) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  setIsAvailable,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePlay = () => {
    setLoading(true);
    setIsAvailable(true);
    // In a real app, you'd open a video player here
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <View style={[styles.card, { backgroundColor: lesson.colors[0] }]}>
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDuration}>{lesson.duration} mins</Text>
      </View>
      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: lesson.colors[0] }]}
        onPress={handlePlay}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="play" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 120,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: spacing.md,
  },
  lessonInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  lessonDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
