import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '../src/store/settingsStore';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  const theme = useSettingsStore((state) => state.theme);
  // Hydration index.tsx da await bilan bajariladi — bu yerda ikkinchi marta chaqirish shart emas

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
