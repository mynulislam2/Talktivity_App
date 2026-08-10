import type { UserProgress } from '@/types/progress';
import { progressService } from './index';

type ProgressListener = (progress: UserProgress) => void;

class ProgressStateManager {
  private listeners: Set<ProgressListener> = new Set();
  private currentProgress: Map<number, UserProgress> = new Map();

  async getProgress(userId: number): Promise<UserProgress> {
    if (this.currentProgress.has(userId)) {
      return this.currentProgress.get(userId)!;
    }
    return this.refreshProgress(userId);
  }

  async refreshProgress(userId: number): Promise<UserProgress> {
    const response = await progressService.getDailyProgress(String(userId));
    const progress = response as unknown as UserProgress;
    this.currentProgress.set(userId, progress);
    return progress;
  }

  async updateProgress(
    userId: number,
    updates: Partial<UserProgress>,
    optimistic: boolean
  ): Promise<boolean> {
    if (optimistic && this.currentProgress.has(userId)) {
      const current = { ...this.currentProgress.get(userId)!, ...updates };
      this.currentProgress.set(userId, current);
      this.notifyListeners(current);
    }
    return true;
  }

  subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(progress: UserProgress): void {
    this.listeners.forEach((listener) => listener(progress));
  }
}

export const progressStateManager = new ProgressStateManager();
