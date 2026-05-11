import { create } from 'zustand';

export const DEFAULT_SEED_SEARCH_QUERY = 'tomato early blight leaf spots and treatment';

type InputSeedState = {
  searchSeedTick: number;
  lastSearchQuery: string;
  uploadSeedTick: number;
  loginSeedTick: number;
  seedSmartSearch: (query?: string) => void;
  seedSampleUpload: () => void;
  seedLoginCredentials: () => void;
};

export const useInputSeedStore = create<InputSeedState>((set) => ({
  searchSeedTick: 0,
  lastSearchQuery: DEFAULT_SEED_SEARCH_QUERY,
  uploadSeedTick: 0,
  loginSeedTick: 0,
  seedSmartSearch: (query) =>
    set((s) => ({
      searchSeedTick: s.searchSeedTick + 1,
      lastSearchQuery: (query ?? DEFAULT_SEED_SEARCH_QUERY).trim() || DEFAULT_SEED_SEARCH_QUERY,
    })),
  seedSampleUpload: () => set((s) => ({ uploadSeedTick: s.uploadSeedTick + 1 })),
  seedLoginCredentials: () => set((s) => ({ loginSeedTick: s.loginSeedTick + 1 })),
}));
