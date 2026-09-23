import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { getToken } from '../src/services/tokenStorage';
import * as SplashScreen from 'expo-splash-screen';
import { useSettingsStore } from '../src/store/settingsStore';

SplashScreen.preventAutoHideAsync();

export default function AppIndex() {
  const router = useRouter();
  const { setToken, setLoading } = useAuthStore();
  const hydrateSettings = useSettingsStore((state) => state.hydrate);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await hydrateSettings();
        const token = await getToken();
        
        if (token) {
          await setToken(token);
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error checking auth token:', error);
        router.replace('/(auth)/login');
      } finally {
        setLoading(false);
        // Add a small delay for smoother transition
        setTimeout(() => SplashScreen.hideAsync(), 100);
      }
    };

    checkAuth();
  }, [hydrateSettings, router, setLoading, setToken]);

  return null;
}
