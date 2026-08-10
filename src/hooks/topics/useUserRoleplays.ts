import { useCallback, useEffect, useState } from 'react';
import { roleplayService, RoleplaySession } from '@/services/roleplay';

export function useUserRoleplays() {
  const [roleplays, setRoleplays] = useState<RoleplaySession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRoleplays = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await roleplayService.getRoleplays();
      setRoleplays(res.data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load roleplays');
      setRoleplays([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRoleplays();
  }, [refreshRoleplays]);

  return { roleplays, isLoading, error, refreshRoleplays };
}
