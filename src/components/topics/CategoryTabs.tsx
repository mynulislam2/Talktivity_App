import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { TopicCategory } from '@/types/topics';

export interface CategoryTabsProps {
  categories: TopicCategory[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'IELTS & Exam Prep': '🎯',
  'Debate & Discussion': '⚖️',
  'Personal Growth': '🌱',
  'Hot Topics': '🔥',
  'Trending Now': '📈',
};

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const catId = String(category.id || category.category_name);
          const isActive = catId === activeCategoryId;
          const icon = CATEGORY_ICONS[category.category_name] || '💡';

          if (isActive) {
            return (
              <Pressable
                key={catId}
                onPress={() => onSelectCategory(catId)}
                style={styles.activePillWrapper}
              >
                <LinearGradient
                  colors={['rgba(41, 73, 255, 0.35)', 'rgba(181, 92, 255, 0.35)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activePillGradient}
                >
                  <Text style={styles.icon}>{icon}</Text>
                  <Text style={styles.activeText}>{category.category_name}</Text>
                </LinearGradient>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={catId}
              onPress={() => onSelectCategory(catId)}
              style={styles.inactivePill}
            >
              <Text style={styles.icon}>{icon}</Text>
              <Text style={styles.inactiveText}>{category.category_name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  activePillWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.7)',
  },
  activePillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
  },
  inactivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  activeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  inactiveText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
});
