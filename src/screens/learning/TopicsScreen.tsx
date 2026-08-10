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
import { TopicCategory } from '@/components/topics/TopicCategory';
import { RolePlayModal } from '@/components/topics/RolePlayModal';
import { TopicsLoadingState } from '@/components/topics/TopicsLoadingState';
import { TopicsErrorState } from '@/components/topics/TopicsErrorState';
import type { Topic } from '@/types/topics';
import { TopicsScreenProps } from '@/navigation/types';
import { spacing } from '@/styles/spacing';
import { colors } from '@/styles/colors';

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
      planType: 'Basic/FreeTrial',
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
          {processedCategories.length > 0 ? (
            processedCategories.map((category: any) => (
              <TopicCategory
                key={category.id || category.category_name}
                category={category}
                onDiscuss={handleDiscussClick}
                onCustomClick={handleCustomRolePlayClick}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No topic categories found from the server.
              </Text>
              {/* Retry button could be added here */}
            </View>
          )}
        </ScrollView>
      )}

      <RolePlayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={handleStartCustomRolePlay}
        isGenerating={isGenerating}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
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
    textAlign: 'center',
  },
});

export default TopicsScreen;
