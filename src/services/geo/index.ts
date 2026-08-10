import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';

export interface GeoLocationResponse {
  country?: string;
  region?: string;
  timezone?: string;
  suggested?: string;
}

export interface RegionSuggestion {
  name: string;
  code: string;
}

class GeoService {
  async getLocation(): Promise<GeoLocationResponse> {
    const response = await httpService.get(API_URLS.GEO.LOCATION);
    return response.data as GeoLocationResponse;
  }

  async getRegionSuggestions(query: string): Promise<RegionSuggestion[]> {
    const response = await httpService.get(API_URLS.GEO.SUGGESTIONS, {
      params: { query },
    });
    return response.data as RegionSuggestion[];
  }
}

export const geoService = new GeoService();
export { GeoService };
