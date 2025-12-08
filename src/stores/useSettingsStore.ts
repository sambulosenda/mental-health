import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AppSettings,
  SmartRemindersSettings,
  ReminderType,
} from '@/src/types/settings';
import { defaultSmartReminders } from '@/src/types/settings';
import {
  scheduleReminder,
  scheduleAllReminders,
  cancelReminder,
} from '@/src/lib/notifications';

interface SettingsState extends AppSettings {
  // Smart reminder actions
  setReminderEnabled: (type: ReminderType, enabled: boolean) => Promise<void>;
  setReminderTime: (type: ReminderType, time: string) => Promise<void>;
  setFollowUpEnabled: (type: ReminderType, enabled: boolean) => Promise<void>;
  setFollowUpTime: (type: ReminderType, time: string) => Promise<void>;
  setStreakNotificationsEnabled: (enabled: boolean) => Promise<void>;
  refreshAllReminders: () => Promise<void>;

  // Other actions
  setPasscodeEnabled: (enabled: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setOnboardingComplete: () => void;
  setInsightDepth: (depth: 'brief' | 'detailed') => void;
  setInsightTone: (tone: 'empathetic' | 'professional') => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  smartReminders: defaultSmartReminders,
  passcodeEnabled: false,
  biometricEnabled: false,
  theme: 'system',
  hasCompletedOnboarding: false,
  insightDepth: 'brief',
  insightTone: 'empathetic',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      // Smart reminder actions
      setReminderEnabled: async (type, enabled) => {
        const current = get().smartReminders;
        const updated: SmartRemindersSettings = {
          ...current,
          [type]: { ...current[type], enabled },
        };
        set({ smartReminders: updated });

        if (enabled) {
          await scheduleReminder(type, updated[type], updated.streakNotificationsEnabled);
        } else {
          await cancelReminder(type);
        }
      },

      setReminderTime: async (type, time) => {
        const current = get().smartReminders;
        const updated: SmartRemindersSettings = {
          ...current,
          [type]: { ...current[type], time },
        };
        set({ smartReminders: updated });

        if (updated[type].enabled) {
          await scheduleReminder(type, updated[type], updated.streakNotificationsEnabled);
        }
      },

      setFollowUpEnabled: async (type, enabled) => {
        const current = get().smartReminders;
        const updated: SmartRemindersSettings = {
          ...current,
          [type]: { ...current[type], followUpEnabled: enabled },
        };
        set({ smartReminders: updated });

        if (updated[type].enabled) {
          await scheduleReminder(type, updated[type], updated.streakNotificationsEnabled);
        }
      },

      setFollowUpTime: async (type, time) => {
        const current = get().smartReminders;
        const updated: SmartRemindersSettings = {
          ...current,
          [type]: { ...current[type], followUpTime: time },
        };
        set({ smartReminders: updated });

        if (updated[type].enabled && updated[type].followUpEnabled) {
          await scheduleReminder(type, updated[type], updated.streakNotificationsEnabled);
        }
      },

      setStreakNotificationsEnabled: async (enabled) => {
        const current = get().smartReminders;
        const updated: SmartRemindersSettings = {
          ...current,
          streakNotificationsEnabled: enabled,
        };
        set({ smartReminders: updated });

        // Reschedule all enabled reminders with new streak setting
        await scheduleAllReminders(updated);
      },

      refreshAllReminders: async () => {
        const settings = get().smartReminders;
        await scheduleAllReminders(settings);
      },

      // Other actions
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
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persistedState: unknown, version: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = persistedState as any;

        if (version < 2) {
          // Migrate from old reminder format to smart reminders
          if (state.reminderEnabled !== undefined || state.reminderTime !== undefined) {
            state.smartReminders = {
              ...defaultSmartReminders,
              mood: {
                ...defaultSmartReminders.mood,
                enabled: Boolean(state.reminderEnabled),
                time: state.reminderTime || '09:00',
              },
            };
            delete state.reminderEnabled;
            delete state.reminderTime;
          } else if (!state.smartReminders) {
            state.smartReminders = defaultSmartReminders;
          }
        }

        return state;
      },
    }
  )
);
