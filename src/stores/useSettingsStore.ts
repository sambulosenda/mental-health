import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings } from '@/src/types/settings';

interface SettingsState extends AppSettings {
  // Actions
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  setPasscodeEnabled: (enabled: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setOnboardingComplete: () => void;
  setInsightDepth: (depth: 'brief' | 'detailed') => void;
  setInsightTone: (tone: 'empathetic' | 'professional') => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  reminderEnabled: false,
  reminderTime: '20:00',
  passcodeEnabled: false,
  biometricEnabled: false,
  theme: 'system',
  hasCompletedOnboarding: false,
  insightDepth: 'brief',
  insightTone: 'empathetic',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setReminderEnabled: (enabled) => set({ reminderEnabled: enabled }),
      setReminderTime: (time) => set({ reminderTime: time }),
      setPasscodeEnabled: (enabled) => set({ passcodeEnabled: enabled }),
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      setTheme: (theme) => set({ theme }),
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      setInsightDepth: (depth) => set({ insightDepth: depth }),
      setInsightTone: (tone) => set({ insightTone: tone }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'daysi-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
