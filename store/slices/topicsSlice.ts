/**
 * Redux Toolkit Topics Slice
 * 
 * Manages global topics state including topic categories and custom topic creation.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { topicService } from '@/service/TopicService';
import type { TopicCategory } from '@/types/topics';

/**
 * Topics state interface
 */
interface TopicsState {
  categories: TopicCategory[];
  loading: boolean;
  error: string | null;
  creating: boolean; // For custom topic creation
}

/**
 * Initial state
 */
const initialState: TopicsState = {
  categories: [],
  loading: false,
  error: null,
  creating: false,
};

/**
 * Async thunk: Load topics
 */
export const loadTopics = createAsyncThunk(
  'topics/loadTopics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await topicService.getTopics();
      // Handle both wrapped and direct responses
      if (response.success && response.data) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      }
      return rejectWithValue(response.message || 'Failed to load topics');
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || 'Failed to load topics'
      );
    }
  }
);

/**
 * Async thunk: Create custom topic
 */
export const createCustomTopic = createAsyncThunk(
  'topics/createCustomTopic',
  async (
    { category, topic }: { category: string; topic: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await topicService.createTopic(category, topic);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to create topic');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create topic');
    }
  }
);

/**
 * Async thunk: Refresh topics
 */
export const refreshTopics = createAsyncThunk(
  'topics/refreshTopics',
  async (_, { dispatch }) => {
    await dispatch(loadTopics());
  }
);

/**
 * Topics slice
 */
const topicsSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    /**
     * Set categories manually (if needed)
     */
    setCategories: (state, action: PayloadAction<TopicCategory[]>) => {
      state.categories = action.payload;
    },
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
    resetTopics: (state) => {
      state.categories = [];
      state.loading = false;
      state.error = null;
      state.creating = false;
    },
  },
  extraReducers: (builder) => {
    // Load topics
    builder
      .addCase(loadTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTopics.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(loadTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create custom topic
    builder
      .addCase(createCustomTopic.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createCustomTopic.fulfilled, (state) => {
        state.creating = false;
        // Don't update categories here - refreshTopics will be called separately
      })
      .addCase(createCustomTopic.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });

    // Refresh topics
    builder
      .addCase(refreshTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshTopics.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(refreshTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCategories, clearError, resetTopics } = topicsSlice.actions;

/**
 * Selectors
 */
export const selectTopicsCategories = (state: { topics: TopicsState }) => state.topics.categories;

// Added for compatibility with screens/learning/TopicsScreen.tsx and LearningScreen.tsx
export const selectTopics = (state: { topics: TopicsState }) => {
  if (!state.topics.categories) return [];
  
  // Flatten all topics from all categories into a single array
  return state.topics.categories.reduce((allTopics, category) => {
    // Add category info to each topic
    const topicsWithCategory = (category.topics || []).map(topic => ({
      ...topic,
      categoryName: category.category_name,
      categoryId: category.id,
      // Map difficulty to level for compatibility with TopicsScreen.tsx and TopicCard
      level: (topic as any).level || (topic as any).difficulty || 'beginner',
      lessonsCount: (topic as any).lessonsCount || 0
    }));
    return [...allTopics, ...topicsWithCategory];
  }, [] as any[]);
};

export const selectTopicsLoading = (state: { topics: TopicsState }) => state.topics.loading;
export const selectTopicsError = (state: { topics: TopicsState }) => state.topics.error;
export const selectIsCreatingTopic = (state: { topics: TopicsState }) => state.topics.creating;

export default topicsSlice.reducer;
