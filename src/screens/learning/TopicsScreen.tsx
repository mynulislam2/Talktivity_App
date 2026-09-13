/**
 * Topics Screen
 *
 * Browse and select learning topics - matches Next.js /topics page
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

import {
  useTopics,
  useTopicCategories,
  useRolePlayGeneration,
  useTopicSelection,
  useUserRoleplays,
} from '@/hooks/topics';
import { Header } from '@/components/home';
import {
  TopicCategory,
  TopicCard,
  CategoryTabs,
  RolePlayModal,
  TopicsLoadingState,
  TopicsErrorState,
} from '@/components/topics';
import type { Topic } from '@/types/topics';
import { TopicsScreenProps } from '@/navigation/types';
import { spacing } from '@/styles/spacing';
import { colors } from '@/styles/colors';
import ScreenBackground from '../../components/common/ScreenBackground';

const TopicsScreen: React.FC<TopicsScreenProps> = () => {
  const navigation = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom hooks
  const { categories, isLoading, error, refreshTopics } = useTopics();
  const { roleplays, refreshRoleplays } = useUserRoleplays();

  const mergedCategories = useMemo(() => {
    const filtered = (categories || []).filter(
      (c: any) =>
        c.category_name !== 'Role Play Scenarios' &&
        c.category_name !== 'Custom Category'
    );

    const roleplayTopics: Topic[] = [
      ...(roleplays || []).map((rp: any) => ({
        id: String(rp.id),
        title: rp.title,
        imageUrl: rp.image_url || undefined,
        prompt: rp.prompt,
        firstPrompt: rp.first_prompt,
        isCustom: false,
        customScenarioDetails: {
          myRole: rp.my_role,
          otherRole: rp.other_role,
          situation: rp.situation,
        },
        created_at: rp.created_at,
        updated_at: rp.updated_at,
        categoryName: 'Role Play Scenarios',
      })),
    ];

    const roleplayCategory = {
      id: 'role-play-user',
      category_name: 'Role Play Scenarios',
      topics: roleplayTopics,
      totalTopics: roleplayTopics.length,
      displayedTopics: roleplayTopics.length,
      planType: 'All',
      restricted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return [roleplayCategory, ...filtered];
  }, [categories, roleplays]);

  const { processedCategories } = useTopicCategories(mergedCategories as any);
  const { isGenerating, generateRolePlay } = useRolePlayGeneration();
  const { handleTopicSelect } = useTopicSelection();

  // Handle topic selection
  const handleDiscussClick = useCallback(
    (topic: Topic, categoryName: string) => {
      handleTopicSelect(topic);
      // Navigate within current stack if the target screen exists
      try {
        (navigation as any).navigate('RoleplaySession');
      } catch {
        // Screen not available in this navigator — ignore
      }
    },
    [handleTopicSelect, navigation]
  );

  // Handle custom roleplay creation
  const handleStartCustomRolePlay = useCallback(
    async (data: { myRole: string; otherRole: string; situation: string }) => {
      try {
        const createdTopic = await generateRolePlay(data);

        // Mark this as a roleplay session
        await AsyncStorage.setItem('isRoleplaySession', 'true');
        await AsyncStorage.setItem(
          'selectedRoleplayTopic',
          JSON.stringify(createdTopic)
        );

        setIsModalOpen(false);
        await refreshRoleplays();

        // Navigate to roleplay session
        try {
          (navigation as any).navigate('RoleplaySession');
        } catch {
          navigation.dispatch(
            CommonActions.navigate({
              name: 'LearningStack',
              params: { screen: 'PracticeScreen' },
            })
          );
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create custom topic.';
        // Show error alert
        // In a real app, you might want to use a toast library
        console.error(errorMessage);
      }
    },
    [generateRolePlay, refreshRoleplays, navigation]
  );

  const handleCustomRolePlayClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const roleplayCategory = useMemo(() => {
    return (processedCategories as any[]).find(
      (c) => c.category_name === 'Role Play Scenarios'
    );
  }, [processedCategories]);

  const contentCategories = useMemo(() => {
    return (processedCategories as any[]).filter(
      (c) => c.category_name !== 'Role Play Scenarios'
    );
  }, [processedCategories]);

  const activeCategoryId =
    selectedCategoryId ||
    (contentCategories[0]
      ? String(contentCategories[0].id || contentCategories[0].category_name)
      : '');

  const activeCategory = useMemo(() => {
    return (
      contentCategories.find(
        (c) => String(c.id || c.category_name) === activeCategoryId
      ) || contentCategories[0]
    );
  }, [contentCategories, activeCategoryId]);

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <Header />
      {isLoading ? (
        <TopicsLoadingState />
      ) : error ? (
        <TopicsErrorState error={error} onRetry={refreshTopics} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Custom Roleplay Section (Top) */}
          {roleplayCategory && (
            <TopicCategory
              category={roleplayCategory}
              onDiscuss={handleDiscussClick}
              onCustomClick={handleCustomRolePlayClick}
            />
          )}

          {/* 2. Category Pill Tabs */}
          {contentCategories.length > 0 && (
            <CategoryTabs
              categories={contentCategories}
              activeCategoryId={activeCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          )}

          {/* 3. 2-Column Topics Grid */}
          {activeCategory && activeCategory.topics && activeCategory.topics.length > 0 ? (
            <View style={styles.gridContainer}>
              {activeCategory.topics
                .filter((t: any) => !t.isCustom)
                .map((topic: any) => (
                  <View key={topic.id || topic.title} style={styles.gridItem}>
                    <TopicCard
                      topic={topic}
                      onDiscuss={handleDiscussClick}
                      onCustomClick={handleCustomRolePlayClick}
                      categoryName={activeCategory.category_name}
                    />
                  </View>
                ))}
            </View>
          ) : contentCategories.length === 0 && !roleplayCategory ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No topic categories found from the server.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      <RolePlayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={handleStartCustomRolePlay}
        isGenerating={isGenerating}
      />
      </SafeAreaView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 24,
  },
  gridItem: {
    width: '48%',
    height: 180,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
});

export default TopicsScreen;

