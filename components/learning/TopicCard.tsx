/**
 * Topic Card Component
 * 
 * Displays a learning topic in card format
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

export interface Topic {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  lessonsCount: number;
  icon?: string;
}

interface TopicCardProps {
  topic: Topic;
  onPress: (topic: Topic) => void;
  style?: ViewStyle;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onPress, style }) => {
  const levelColors = {
    beginner: '#4CAF50',
    intermediate: '#FFC107',
    advanced: '#F44336',
  };

  const levelLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress(topic)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={topic.icon || 'book'}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{topic.title}</Text>
          <View style={styles.levelBadge}>
            <View style={[styles.levelDot, { backgroundColor: levelColors[topic.level] }]} />
            <Text style={styles.levelText}>{levelLabels[topic.level]}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {topic.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.lessonsInfo}>
          <Ionicons name="layers" size={16} color="#999" />
          <Text style={styles.lessonsText}>{topic.lessonsCount} lessons</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  levelText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  lessonsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonsText: {
    fontSize: 12,
    color: '#999',
    marginLeft: spacing.xs,
  },
});

export default TopicCard;
