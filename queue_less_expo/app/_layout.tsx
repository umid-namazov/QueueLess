import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useSettingsStore } from '../src/store/settingsStore';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  const hydrate = useSettingsStore((state) => state.hydrate);
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="branch" />
        <Stack.Screen name="seller" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="business" />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Toast />
    </>
  );
}
