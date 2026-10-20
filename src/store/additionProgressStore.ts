// Addition progress store (per mode per tier)
// Evidence: UNKNOWN - structure inferred from 9 tiers per topic

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameConstants } from '../constants/game';

export interface TierProgress {
  bestScore: number;      // Green chip count (first-try correct)
  bestRetryCount: number; // Red chip count (retries)
  stars: number;          // 0-3
  completed: boolean;
  lastPlayed: number;     // Timestamp
}

export interface AdditionProgressState {
  tiers: Record<string, TierProgress>; // key: 'game1' | 'game2' | ...
  updateTier: (tier: string, data: Partial<TierProgress>) => void;
  getTier: (tier: string) => TierProgress | undefined;
  reset: () => void;
}

const emptyTier: TierProgress = {
  bestScore: 0,
  bestRetryCount: 0,
  stars: 0,
  completed: false,
  lastPlayed: 0,
};

export const useAdditionProgressStore = create<AdditionProgressState>()(
  persist(
    (set, get) => ({
      tiers: {},
      updateTier: (tier, data) =>
        set((state) => ({
          tiers: {
            ...state.tiers,
            [tier]: { ...(state.tiers[tier] || emptyTier), ...data, lastPlayed: Date.now() },
          },
        })),
      getTier: (tier) => get().tiers[tier],
      reset: () => set({ tiers: {} }),
    }),
    {
      name: GameConstants.STORAGE_KEYS.ADDITION_PROGRESS,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);