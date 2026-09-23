import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { Home, Bookmark, User } from 'lucide-react-native';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function TabsLayout() {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const color = Colors[theme];

  const tabTitles = {
    uz: { home: 'Asosiy', bookings: 'Navbatlarim', profile: 'Profil' },
    ru: { home: 'Главная', bookings: 'Мои очереди', profile: 'Профиль' },
    en: { home: 'Home', bookings: 'Bookings', profile: 'Profile' },
  };

  const titles = tabTitles[language];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.textSecondary,
        tabBarStyle: {
          backgroundColor: color.background,
          borderTopColor: color.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: titles.home,
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: titles.bookings,
          tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: titles.profile,
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
