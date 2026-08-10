import { useEffect, useState } from 'react';
import { httpService } from '@/services/http/httpservice';
import AsyncStorage from '@react-native-async-storage/async-storage';

type GeoSuggested = 'local' | 'international';
export interface GeoRegion {
  country: string | null;
  suggested: GeoSuggested | null;
  isLoading: boolean;
  isBD: boolean;
}

const CACHE_KEY = 'talktivity:geoRegion:v1';

interface CachedShape {
  country: string | null;
  suggested: GeoSuggested | null;
}

async function readCache(): Promise<CachedShape | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as CachedShape;
  } catch {
    /* swallow */
  }
  return null;
}

async function writeCache(value: CachedShape) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    /* swallow */
  }
}

export function useGeoRegion(): GeoRegion {
  const [country, setCountry] = useState<string | null>(null);
  const [suggested, setSuggested] = useState<GeoSuggested | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await readCache();
      if (cached) {
        if (!cancelled) {
          setCountry(cached.country);
          setSuggested(cached.suggested);
          setIsLoading(false);
        }
        return;
      }
      try {
        const response = await httpService.get('/geo/location');
        const data = response?.data?.data ?? response?.data ?? {};
        const next: CachedShape = {
          country: typeof data.country === 'string' ? data.country : null,
          suggested:
            data.suggested === 'local' || data.suggested === 'international'
              ? data.suggested
              : null,
        };
        if (!cancelled) {
          setCountry(next.country);
          setSuggested(next.suggested);
          await writeCache(next);
        }
      } catch {
        // Network failure
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    country,
    suggested,
    isLoading,
    isBD: country === 'BD' || suggested === 'local',
  };
}
