// Settings store with AsyncStorage persistence
// Evidence: E-RT-011 (Night mode persists across force-stop+relaunch)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameConstants } from '../constants/game';

export interface SettingsState {
  music: boolean;
  sound: boolean;
  night: boolean;
  setMusic: (v: boolean) => void;
  setSound: (v: boolean) => void;
  setNight: (v: boolean) => void;
  reset: () => void;
}

const defaults = GameConstants.SETTINGS_DEFAULTS;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      music: defaults.music,
      sound: defaults.sound,
      night: defaults.night,
      setMusic: (v) => set({ music: v }),
      setSound: (v) => set({ sound: v }),
      setNight: (v) => set({ night: v }),
      reset: () => set(defaults),
    }),
    {
      name: GameConstants.STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);