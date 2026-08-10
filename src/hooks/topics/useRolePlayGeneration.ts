import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AiService } from '@/services/ai';
import { roleplayService } from '@/services/roleplay';
import type { Topic } from '@/types/topics';
import {
  loadSubscriptionStatus,
  selectCurrentSubscription,
} from '@/store/slices/subscriptionSlice';

export interface RolePlayGenerationData {
  myRole: string;
  otherRole: string;
  situation: string;
}

export interface UseRolePlayGenerationReturn {
  isGenerating: boolean;
  generateRolePlay: (data: RolePlayGenerationData) => Promise<Topic>;
}

export function useRolePlayGeneration(): UseRolePlayGenerationReturn {
  const dispatch = useAppDispatch();
  const currentSubscription = useAppSelector(selectCurrentSubscription);
  const [isGenerating, setIsGenerating] = useState(false);
  const aiService = AiService.getInstance();

  const generateRolePlay = useCallback(
    async (data: RolePlayGenerationData): Promise<Topic> => {
      setIsGenerating(true);
      try {
        let planType = currentSubscription?.subscription?.plan_type as
          | string
          | undefined;
        if (!planType) {
          try {
            const updated = await dispatch(loadSubscriptionStatus()).unwrap();
            planType = updated?.subscription?.plan_type;
          } catch {
            planType = 'Basic';
          }
        }

        if (planType !== 'Pro') {
          const existing = await roleplayService.getRoleplays();
          const count = (existing.data || []).length;
          if (count >= 5) {
            throw new Error(
              'You can create up to 5 custom role-play scenarios on your current plan. Upgrade to Pro for unlimited.'
            );
          }
        }

        const { myRole, otherRole, situation } = data;

        const {
          success,
          data: aiData,
          error,
        } = await aiService.generateRolePlay(myRole, otherRole, situation);

        if (!success) {
          throw new Error(error || 'Failed to generate roleplay data');
        }

        const { prompt: generatedPrompt, firstPrompt: generatedFirstPrompt } =
          aiData || {};

        const newCustomTopic: Topic = {
          id: `custom-ai-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          title: `Custom: ${myRole} vs ${otherRole}`,
          imageUrl: `https://placehold.co/400x600/1a202c/ffffff?text=${encodeURIComponent(
            myRole.substring(0, Math.min(myRole.length, 5))
          )}%20vs%20${encodeURIComponent(
            otherRole.substring(0, Math.min(otherRole.length, 5))
          )}`,
          prompt: generatedPrompt,
          firstPrompt: generatedFirstPrompt,
          isCustom: false,
          customScenarioDetails: { myRole, otherRole, situation },
        };

        const saveResponse = await roleplayService.createRoleplay({
          title: newCustomTopic.title,
          prompt: generatedPrompt ?? '',
          firstPrompt: generatedFirstPrompt ?? '',
          myRole,
          otherRole,
          situation,
          imageUrl: newCustomTopic.imageUrl || null,
        });

        const created = saveResponse.data;
        return {
          id: String(created.id),
          title: created.title,
          imageUrl: created.image_url || undefined,
          prompt: created.prompt || '',
          firstPrompt: created.first_prompt || '',
          isCustom: false,
          customScenarioDetails: { myRole, otherRole, situation },
          created_at: created.created_at,
          updated_at: created.updated_at,
          categoryName: 'Role Play Scenarios',
        };
      } finally {
        setIsGenerating(false);
      }
    },
    [aiService, dispatch, currentSubscription]
  );

  return {
    isGenerating,
    generateRolePlay,
  };
}
