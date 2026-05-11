import { create } from 'zustand';

export const DEFAULT_SEED_SEARCH_QUERY = 'tomato early blight leaf spots and treatment';

type InputSeedState = {
  searchSeedTick: number;
  searchSeedHandledUpTo: number;
  lastSearchQuery: string;
  uploadSeedTick: number;
  uploadSeedHandledUpTo: number;
  seedSmartSearch: (query?: string) => void;
  seedSampleUpload: () => void;
};

export const useInputSeedStore = create<InputSeedState>((set) => ({
  searchSeedTick: 0,
  searchSeedHandledUpTo: 0,
  lastSearchQuery: DEFAULT_SEED_SEARCH_QUERY,
  uploadSeedTick: 0,
  uploadSeedHandledUpTo: 0,
  seedSmartSearch: (query) =>
    set((s) => ({
      searchSeedTick: s.searchSeedTick + 1,
      lastSearchQuery: (query ?? DEFAULT_SEED_SEARCH_QUERY).trim() || DEFAULT_SEED_SEARCH_QUERY,
    })),
  seedSampleUpload: () => set((s) => ({ uploadSeedTick: s.uploadSeedTick + 1 })),
}));
