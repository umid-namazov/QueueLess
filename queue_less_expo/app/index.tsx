import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { getToken } from '../src/services/tokenStorage';
import * as SplashScreen from 'expo-splash-screen';
import { useSettingsStore } from '../src/store/settingsStore';
import { apiGetMe, apiGetMyBranches } from '../src/services/api';

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
          // Role bo'yicha to'g'ri sahifaga yo'naltirish
          try {
            const user = await apiGetMe();
            if (user?.is_admin || user?.phone === '+998991234567' || user?.phone === '+998998691005') {
              router.replace('/admin');
              return;
            }
            const myBranches = await apiGetMyBranches().catch(() => []);
            if (myBranches && myBranches.length > 0) {
              router.replace('/seller');
              return;
            }
          } catch {
            // API xatosi bo'lsa (token eskiriган bo'lishi mumkin) — login'ga yo'naltir
          }
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error checking auth token:', error);
        router.replace('/(auth)/login');
      } finally {
        setLoading(false);
        setTimeout(() => SplashScreen.hideAsync(), 100);
      }
    };

    checkAuth();
  }, [hydrateSettings, router, setLoading, setToken]);

  return null;
}

