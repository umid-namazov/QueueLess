import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type AppLanguage = 'uz' | 'ru' | 'en';
export type ThemeMode = 'light' | 'dark';

interface SettingsState {
  language: AppLanguage;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  hydrated: boolean;
  setLanguage: (language: AppLanguage) => void;
  setTheme: (theme: ThemeMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  hydrate: () => Promise<void>;
}

const SETTINGS_KEY = 'queueLessSettings';

async function getSettings() {
  return Platform.OS === 'web'
    ? localStorage.getItem(SETTINGS_KEY)
    : SecureStore.getItemAsync(SETTINGS_KEY);
}

async function saveSettings(value: string) {
  if (Platform.OS === 'web') localStorage.setItem(SETTINGS_KEY, value);
  else await SecureStore.setItemAsync(SETTINGS_KEY, value);
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'uz',
  theme: 'light',
  notificationsEnabled: true,
  hydrated: false,
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  hydrate: async () => {
    try {
      const saved = await getSettings();
      if (saved) {
        const settings = JSON.parse(saved) as Partial<SettingsState>;
        set({
          language: settings.language ?? 'uz',
          theme: settings.theme ?? 'light',
          notificationsEnabled: settings.notificationsEnabled ?? true,
        });
      }
    } finally {
      set({ hydrated: true });
    }
  },
}));

useSettingsStore.subscribe((state) => {
  if (!state.hydrated) return;
  saveSettings(JSON.stringify({
    language: state.language,
    theme: state.theme,
    notificationsEnabled: state.notificationsEnabled,
  })).catch(() => undefined);
});