import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { QuizResult, QuizQuestion } from '@/types/quiz';
import type { RootState } from '@/store';
import { quizService } from '@/service/QuizService';
import { AiService } from '@/service/AiService';

interface QuizState {
  lastQuiz: QuizResult | null;
  lastListeningQuiz: QuizResult | null;
  questions: QuizQuestion[] | null;
  listeningQuestions: QuizQuestion[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  lastQuiz: null,
  lastListeningQuiz: null,
  questions: null,
  listeningQuestions: null,
  loading: false,
  error: null,
};

// Async thunk for generating quiz questions
export const generateQuizQuestions = createAsyncThunk(
  'quiz/generateQuizQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const aiService = AiService.getInstance();
      const result = await aiService.generateQuiz();
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error || 'Failed to generate quiz');
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || 'Failed to generate quiz'
      );
    }
  }
);

// Async thunk for generating listening quiz questions
export const generateListeningQuizQuestions = createAsyncThunk(
  'quiz/generateListeningQuizQuestions',
  async (conversation: string, { rejectWithValue }) => {
    try {
      const aiService = AiService.getInstance();
      const result = await aiService.generateListeningQuiz(conversation);
      if (result.success) {
        return result.data;
      }
      return rejectWithValue(result.error || 'Failed to generate listening quiz');
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || 'Failed to generate listening quiz'
      );
    }
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setLastQuiz(state, action: PayloadAction<QuizResult>) {
      state.lastQuiz = action.payload;
    },
    setLastListeningQuiz(state, action: PayloadAction<QuizResult>) {
      state.lastListeningQuiz = action.payload;
    },
    resetQuiz: (state) => {
      state.lastQuiz = null;
      state.lastListeningQuiz = null;
      state.questions = null;
      state.listeningQuestions = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate Quiz Questions
      .addCase(generateQuizQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateQuizQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
        state.error = null;
      })
      .addCase(generateQuizQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to generate quiz';
      })
      // Generate Listening Quiz Questions
      .addCase(generateListeningQuizQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateListeningQuizQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.listeningQuestions = action.payload;
        state.error = null;
      })
      .addCase(generateListeningQuizQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to generate listening quiz';
      });
  },
});

export const { setLastQuiz, setLastListeningQuiz, resetQuiz, clearError } = quizSlice.actions;
export default quizSlice.reducer;

// Selectors
export const selectLastQuiz = (state: RootState) => state.quiz.lastQuiz;
export const selectLastListeningQuiz = (state: RootState) => state.quiz.lastListeningQuiz;
export const selectQuizQuestions = (state: RootState) => state.quiz.questions;
export const selectListeningQuizQuestions = (state: RootState) => state.quiz.listeningQuestions;
export const selectQuizLoading = (state: RootState) => state.quiz.loading;
export const selectQuizError = (state: RootState) => state.quiz.error;

