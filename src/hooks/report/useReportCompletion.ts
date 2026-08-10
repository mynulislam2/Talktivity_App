import { useState, useCallback } from 'react';

export interface UseReportCompletionReturn {
  completeReport: () => Promise<void>;
  isCompleting: boolean;
}

export function useReportCompletion(): UseReportCompletionReturn {
  const [isCompleting, setIsCompleting] = useState(false);

  const completeReport = useCallback(async () => {
    setIsCompleting(true);
    try {
      // Report completion is handled by the screen-level navigation
      // This hook provides the completion state management
    } catch {
    } finally {
      setIsCompleting(false);
    }
  }, []);

  return {
    completeReport,
    isCompleting,
  };
}
