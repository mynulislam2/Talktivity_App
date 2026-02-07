import { authService } from "../AuthService";
import { httpService } from "../httpservice";

/**
 * Course Status Type
 * Represents the current state of a user's active course
 */
export interface CourseStatus {
  course: {
    id: number;
    currentWeek: number;
    currentDay: number;
    totalWeeks: number;
    totalDays: number;
    batchNumber: number;
    batchStatus?: {
      action: string;
      message: string;
      batchNumber: number;
    };
    todayTopic: {
      title: string;
      description?: string;
      prompt?: string;
      imageUrl?: string;
      category?: string;
    } | null;
    todayListeningTopic: {
      title: string;
      description?: string;
    } | null;
    dayType?: 'all_activities' | 'speaking_exam'; // Calculated on frontend if not provided
  };
  progress?: {
    current_streak?: number;
    [key: string]: any;
  };
}

/**
 * Course Analytics Type
 */
export interface CourseAnalytics {
  course?: {
    id: number;
    startDate: string;
    endDate: string;
    currentWeek: number;
    currentDay: number;
  };
  progress?: {
    speaking_days?: number;
    quiz_days?: number;
    listening_days?: number;
    listening_quiz_days?: number;
    current_streak?: number;
    total_speaking_time?: number;
    total_roleplay_time?: number;
    total_practice_time?: number;
    avg_quiz_score?: number;
    avg_listening_quiz_score?: number;
    avg_exam_score?: number;
    [key: string]: any;
  };
  weeklyExams?: any[];
  speakingSessions?: any[];
  monthlyTrends?: Array<{
    month: number;
    year: number;
    speaking_days: number;
    quiz_days: number;
    listening_days: number;
    listening_quiz_days: number;
    total_speaking_time: number;
  }>;
  skillTrends?: Array<{
    week_number: number;
    avg_score: number;
  }>;
}

/**
 * User Achievements Type
 */
export interface UserAchievements {
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress?: number;
  }>;
  level: {
    current: number;
    xp: number;
    xpForNextLevel: number;
    xpProgress: number;
  };
  stats: {
    currentStreak: number;
    perfectScores: number;
    highScores: number;
    fullSessions: number;
    totalQuizzes: number;
    totalExams: number;
    totalSpeakingTime: number;
    totalRoleplayTime: number;
    totalPracticeTime: number;
    examsPassed?: number;
  };
}

/**
 * Monthly Report Type
 */
export interface MonthlyReport {
  sessions?: any[];
  quizzes?: any[];
  listeningSessions?: any[];
  listeningQuizzes?: any[];
  exams?: any[];
}

class CourseService {
  // 1. Initialize course (first-time onboarding)
  async initializeCourse(): Promise<any> {
    const response = await httpService.post("/courses/initialize", {});
    return response.data;
  }

  // 2. Get active course (no batch trigger)
  async getCourseStatus(): Promise<CourseStatus> {
    const response = await httpService.get("/courses/get-active");
    if (response.status === 404 || response.data?.code === 'NO_ACTIVE_COURSE') {
      const data = response.data || {};
      const code = data.code || data.error || '';
      const message = data.error || 'No active course found';
      const error: any = new Error(message);
      (error.code as any) = code;
      (error.status as any) = 404;
      throw error;
    }
    return response.data.data as CourseStatus;
  }

  // 3. Check and create next batch
  async checkAndCreateNextBatch(): Promise<any> {
    const response = await httpService.post("/courses/check-and-create-next-batch", {});
    return response.data;
  }

  // 4. Get full course timeline (12 weeks)
  async getFullCourseTimeline(date?: string): Promise<{
    timeline: Array<{
      week: number;
      day: number;
      dayIndex: number;
      date: string;
      dayType: string;
      isCompleted: boolean;
      isCurrentDay: boolean;
      isPast: boolean;
      personalizedTopic?: {
        title: string;
        description?: string;
        prompt?: string;
        imageUrl?: string;
        category?: string;
      } | null;
      progress?: {
        speaking_duration_seconds?: number;
      };
    }>;
    course: {
      totalWeeks: number;
      currentWeek: number;
      progress: number;
    };
  }> {
    // Use UTC date for API calls (business logic)
    // Frontend will convert UTC to user's local timezone for display
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getUtcToday } = require('@/Utils/timezoneUtils');
    let targetDate = date;
    if (!targetDate) {
      targetDate = getUtcToday();
    }
    
    const response = await httpService.get("/courses/timeline", {
      params: { date: targetDate },
    });
    return response.data.data;
  }

  // 5. Get course analytics (uses progress/overview endpoint)
  async getCourseAnalytics(): Promise<CourseAnalytics> {
    try {
      const response = await httpService.get("/progress/overview");
      const data = response.data;
      const overview = data.data || data;

      // Map progress/overview response to CourseAnalytics format
      // The overview.analytics.progress contains the stats we need
      const analytics = overview?.analytics?.progress || {};

      return {
        progress: {
          speaking_days: analytics.speaking_days || 0,
          quiz_days: analytics.quiz_days || 0,
          listening_days: analytics.listening_days || 0,
          avg_quiz_score: analytics.avg_quiz_score || 0,
          avg_listening_quiz_score: analytics.avg_listening_quiz_score || 0,
        },
      };
    } catch (error: any) {
      // Return empty analytics on error (graceful degradation)
      // Analytics endpoint not available, returning empty analytics
      return { progress: {} };
    }
  }

  // 6. Get monthly report (placeholder - endpoint may not exist)
  async getMonthlyReport(month: number, year: number): Promise<MonthlyReport> {
    // Try to fetch monthly report, but return empty if endpoint doesn't exist
    try {
      const response = await httpService.get(`/reports/monthly?month=${month}&year=${year}`);
      const data = response.data;
      return data.data || data;
    } catch (error: any) {
      // Return empty report on error (graceful degradation)
      // Monthly report endpoint not available, returning empty report
      return {
        sessions: [],
        quizzes: [],
        listeningSessions: [],
        listeningQuizzes: [],
        exams: [],
      };
    }
  }

  // 7. Get progress page data (analytics + achievements)
  async getProgressPageData(): Promise<{ analytics: CourseAnalytics; achievements: UserAchievements } | null> {
    try {
      const response = await httpService.get("/progress/overview");
      const data = response.data;
      const overview = data.data || data;

      // Return the full structure as expected by components
      return {
        analytics: overview.analytics || {},
        achievements: overview.achievements || {
          badges: [],
          level: { current: 1, xp: 0, xpForNextLevel: 100, xpProgress: 0 },
          stats: {
            currentStreak: 0,
            perfectScores: 0,
            highScores: 0,
            fullSessions: 0,
            totalQuizzes: 0,
            totalExams: 0,
            totalSpeakingTime: 0,
            totalRoleplayTime: 0,
            totalPracticeTime: 0,
          },
        },
      };
    } catch (error: any) {
      // Error fetching progress page data
      throw error;
    }
  }

  // Helper: format speaking time for UI
  formatSpeakingTime(seconds: number): string {
    const totalSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins <= 0) return `${secs}s`;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }

  // Helper: get level name from level number
  getLevelName(level: number): string {
    const levelNames: Record<number, string> = {
      1: 'Beginner',
      2: 'Elementary',
      3: 'Pre-Intermediate',
      4: 'Intermediate',
      5: 'Upper-Intermediate',
      6: 'Advanced',
      7: 'Proficient',
      8: 'Expert',
      9: 'Master',
      10: 'Grand Master',
    };

    if (level <= 10) {
      return levelNames[level] || `Level ${level}`;
    }

    // For levels above 10, use a formula
    if (level <= 20) {
      return `Expert ${level - 7}`;
    }
    if (level <= 30) {
      return `Master ${level - 17}`;
    }
    return `Grand Master ${level - 27}`;
  }
}

export const courseService = new CourseService();
