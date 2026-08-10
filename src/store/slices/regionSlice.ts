import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { geoService } from '@/services/geo';

export type Region = 'local' | 'international';

interface RegionState {
  detected: Region | null;
  detectedCountry: string | null;
  override: Region | null;
  loading: boolean;
  loaded: boolean;
}

const initialState: RegionState = {
  detected: null,
  detectedCountry: null,
  override: null,
  loading: false,
  loaded: false,
};

export const loadRegion = createAsyncThunk('region/load', async () => {
  const result = await geoService.getLocation();
  return {
    suggested: result.suggested as Region,
    country: result.country,
  };
});

const regionSlice = createSlice({
  name: 'region',
  initialState,
  reducers: {
    setRegionOverride(state, action: PayloadAction<Region | null>) {
      state.override = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadRegion.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadRegion.fulfilled, (state, action) => {
        state.detected = action.payload.suggested;
        state.detectedCountry = action.payload.country
          ? action.payload.country.toLowerCase()
          : null;
        state.loading = false;
        state.loaded = true;
      })
      .addCase(loadRegion.rejected, (state) => {
        state.loading = false;
        state.loaded = true;
      });
  },
});

export const { setRegionOverride } = regionSlice.actions;

export const selectRegion = (state: { region: RegionState }): Region =>
  state.region.override ?? state.region.detected ?? 'international';

export const selectRegionOverride = (state: {
  region: RegionState;
}): Region | null => state.region.override;

export const selectDetectedRegion = (state: {
  region: RegionState;
}): Region | null => state.region.detected;

export const selectRegionLoaded = (state: { region: RegionState }): boolean =>
  state.region.loaded;

export const selectDetectedCountry = (state: {
  region: RegionState;
}): string | null => state.region.detectedCountry;

export default regionSlice.reducer;
