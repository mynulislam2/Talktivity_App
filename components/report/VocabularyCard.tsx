/**
 * Vocabulary Card
 * 
 * Displays vocabulary usage and progress
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface VocabularyData {
  score: number;
  totalWords: number;
  uniqueWords: number;
  newWords: string[];
  vocabulary_level: string;
}

interface VocabularyCardProps {
  data: VocabularyData;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({ data }) => {
  const uniquePercentage = Math.round(
    (data.uniqueWords / Math.max(data.totalWords, 1)) * 100
  );

  const getLevelColor = (level: string): string => {
    switch (level?.toLowerCase()) {
      case 'advanced':
        return '#4CAF50';
      case 'intermediate':
        return '#2196F3';
      case 'beginner':
        return '#FF9800';
      default:
        return colors.primary;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="language" size={24} color={colors.primary} />
        <Text style={styles.title}>Vocabulary Usage</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{data.totalWords}</Text>
          <Text style={styles.statLabel}>Total Words</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{data.uniqueWords}</Text>
          <Text style={styles.statLabel}>Unique Words</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{uniquePercentage}%</Text>
          <Text style={styles.statLabel}>Variety</Text>
        </View>
      </View>

      {/* Level Indicator */}
      <View
        style={[
          styles.levelBox,
          { borderLeftColor: getLevelColor(data.vocabulary_level) },
        ]}
      >
        <View>
          <Text style={styles.levelLabel}>Vocabulary Level</Text>
          <Text
            style={[
              styles.levelValue,
              { color: getLevelColor(data.vocabulary_level) },
            ]}
          >
            {data.vocabulary_level?.charAt(0).toUpperCase() +
              data.vocabulary_level?.slice(1)}
          </Text>
        </View>
        <Text style={styles.levelDescription}>
          {data.vocabulary_level?.toLowerCase() === 'advanced'
            ? 'Using sophisticated and varied vocabulary'
            : data.vocabulary_level?.toLowerCase() === 'intermediate'
            ? 'Using appropriate vocabulary for your level'
            : 'Building foundational vocabulary'}
        </Text>
      </View>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{data.score}</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreLabel}>Vocabulary Score</Text>
          <Text style={styles.scoreInterpretation}>
            {data.score >= 80
              ? 'Excellent vocabulary control'
              : data.score >= 70
              ? 'Good vocabulary range'
              : 'Developing vocabulary base'}
          </Text>
        </View>
      </View>

      {/* New Words Learned */}
      {data.newWords && data.newWords.length > 0 && (
        <View style={styles.newWordsSection}>
          <Text style={styles.sectionTitle}>New Words You Used</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.wordList}
          >
            {data.newWords.slice(0, 5).map((word, index) => (
              <View key={index} style={styles.wordTag}>
                <Ionicons name="star" size={12} color={colors.primary} />
                <Text style={styles.wordText}>{word}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recommendations */}
      <View style={styles.tipsContainer}>
        <Ionicons name="bulb" size={20} color={colors.primary} />
        <Text style={styles.tipsText}>
          Create flashcards for new vocabulary and practice using them in sentences
          daily.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  levelBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  levelLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  levelValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  levelDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  scoreInterpretation: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  newWordsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  wordList: {
    flexDirection: 'row',
  },
  wordTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
    gap: spacing.xs,
  },
  wordText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  tipsText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default VocabularyCard;
