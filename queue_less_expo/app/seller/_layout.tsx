import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { BarChart3, Home, Settings } from 'lucide-react-native';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function SellerLayout() {
  const theme = useSettingsStore((state) => state.theme);
  const color = Colors[theme];

  return (
    <Tabs screenOptions={{
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
      <Tabs.Screen name="dashboard" options={{ title: 'Home', tabBarIcon: ({ color: iconColor, size }) => <Home color={iconColor} size={size} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Xizmat tarixi', tabBarIcon: ({ color: iconColor, size }) => <BarChart3 color={iconColor} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Sozlamalar', tabBarIcon: ({ color: iconColor, size }) => <Settings color={iconColor} size={size} /> }} />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="scanner" options={{ href: null }} />
      <Tabs.Screen name="confirm" options={{ href: null }} />
    </Tabs>
  );
}
