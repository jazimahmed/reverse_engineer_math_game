// Equations (Math Pieces Easy) progress store
// Evidence: E-RT-012 (level list with padlocks), E-RT-016 (5x5 board, not timerGameLevels)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameConstants } from '../constants/game';

export interface EquationsLevelProgress {
  unlocked: boolean;
  stars: number;        // 0-3 (E-APK-016: 0, <40%, 40-90%, >90%)
  bestTime: number | null; // Countdown timer remaining at completion
  completed: boolean;
  lastPlayed: number;
}

export interface EquationsProgressState {
  levels: Record<number, EquationsLevelProgress>; // 1-based level index
  unlockLevel: (level: number) => void;
  updateLevel: (level: number, data: Partial<EquationsLevelProgress>) => void;
  getLevel: (level: number) => EquationsLevelProgress;
  reset: () => void;
}

const defaultLevel = (level: number): EquationsLevelProgress => ({
  unlocked: level === 1, // Level 1 unlocked initially (E-RT-012)
  stars: 0,
  bestTime: null,
  completed: false,
  lastPlayed: 0,
});

export const useEquationsProgressStore = create<EquationsProgressState>()(
  persist(
    (set, get) => ({
      levels: {},
      unlockLevel: (level) =>
        set((state) => ({
          levels: {
            ...state.levels,
            [level]: { ...(state.levels[level] || defaultLevel(level)), unlocked: true },
          },
        })),
      updateLevel: (level, data) =>
        set((state) => ({
          levels: {
            ...state.levels,
            [level]: { ...(state.levels[level] || defaultLevel(level)), ...data, lastPlayed: Date.now() },
          },
        })),
      getLevel: (level) => get().levels[level] || defaultLevel(level),
      reset: () => set({ levels: {} }),
    }),
    {
      name: GameConstants.STORAGE_KEYS.EQUATIONS_PROGRESS,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);