import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import * as SecureStore from 'expo-secure-store';
import { User as UserIcon, Bell, Moon, Globe, LogOut, ChevronRight, Building2, ShieldCheck, Briefcase } from 'lucide-react-native';
import { useSettingsStore, AppLanguage } from '../../src/store/settingsStore';
import { useTranslation } from '../../src/i18n';
import { apiGetMe, User } from '../../src/services/api';

function MenuItem({ icon, title, value, hasSwitch = false, switchValue = false, onPress = () => {}, onSwitchChange, color }: {
  icon: ReactNode;
  title: string;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
  color: typeof Colors.light;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: color.border }]}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.menuLeft}>
        {icon}
        <Text style={[styles.menuTitle, { color: color.text }]}>{title}</Text>
      </View>
      <View style={styles.menuRight}>
        {value && <Text style={[styles.menuValue, { color: color.textSecondary }]}>{value}</Text>}
        {hasSwitch ? (
          <Switch value={switchValue} onValueChange={onSwitchChange} />
        ) : (
          <ChevronRight color={color.textSecondary} size={20} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { language, theme, notificationsEnabled, setLanguage, setTheme, setNotificationsEnabled } = useSettingsStore();
  const text = useTranslation(language);
  const color = Colors[theme];
  const router = useRouter();
  const { setToken } = useAuthStore();
  
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await apiGetMe();
      setUser(data);
    } catch (error) {
      console.log('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('userToken');
    } else {
      await SecureStore.deleteItemAsync('userToken');
    }
    setToken(null);
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={[styles.header, { backgroundColor: color.background, borderBottomColor: color.border }]}>
        <Text style={[styles.headerTitle, { color: color.text }]}>{text.profile}</Text>
      </View>

      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: color.primary + '20' }]}>
          <UserIcon color={color.primary} size={40} />
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={color.primary} style={{ marginTop: 10 }} />
        ) : (
          <>
            <Text style={[styles.name, { color: color.text }]}>{user?.full_name || 'Foydalanuvchi'}</Text>
            <Text style={[styles.phone, { color: color.textSecondary }]}>{user?.phone || '+998 ** *** ** **'}</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <MenuItem 
          icon={<Globe color={color.textSecondary} size={24} />} 
          title={text.language}
          value={language === 'uz' ? text.uzbek : language === 'ru' ? text.russian : text.english}
          onPress={() => setLanguageModalVisible(true)}
          color={color}
        />
        <MenuItem 
          icon={<Bell color={color.textSecondary} size={24} />} 
          title={text.notifications}
          hasSwitch 
          switchValue={notificationsEnabled}
          onSwitchChange={setNotificationsEnabled}
          color={color}
        />
        <MenuItem 
          icon={<Moon color={color.textSecondary} size={24} />} 
          title={text.darkMode}
          hasSwitch 
          switchValue={theme === 'dark'}
          onSwitchChange={(enabled) => setTheme(enabled ? 'dark' : 'light')}
          color={color}
        />
        <MenuItem
          icon={<Building2 color={color.textSecondary} size={24} />}
          title="Biznes sifatida qo'shilish (Ariza)"
          onPress={() => router.push('/business' as never)}
          color={color}
        />
        <MenuItem
          icon={<Briefcase color={color.textSecondary} size={24} />}
          title="Sotuvchi paneli (Mening biznesim)"
          onPress={() => router.push('/seller' as never)}
          color={color}
        />
        {user?.is_admin && (
          <MenuItem
            icon={<ShieldCheck color={color.textSecondary} size={24} />}
            title="Admin paneli (Tasdiqlash)"
            onPress={() => router.push('/admin' as never)}
            color={color}
          />
        )}
      </View>

      <Modal visible={languageModalVisible} transparent animationType="fade" onRequestClose={() => setLanguageModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setLanguageModalVisible(false)}>
          <View style={[styles.languageModal, { backgroundColor: color.surface }]}>
            {([['uz', text.uzbek], ['ru', text.russian], ['en', text.english]] as [AppLanguage, string][]).map(([value, label]) => (
              <TouchableOpacity key={value} style={[styles.languageOption, { borderBottomColor: color.border }]} onPress={() => { setLanguage(value); setLanguageModalVisible(false); }}>
                <Text style={[styles.languageOptionText, { color: color.text }]}>{label}</Text>
                {language === value && <Text style={{ color: color.primary }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity 
        style={[styles.logoutBtn, { backgroundColor: color.error + '10' }]}
        onPress={handleLogout}
      >
        <LogOut color={color.error} size={20} />
        <Text style={[styles.logoutText, { color: color.error }]}>{text.logout}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  profileHeader: { alignItems: 'center', paddingVertical: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  phone: { fontSize: 14 },
  section: { paddingHorizontal: 24 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuTitle: { fontSize: 16, marginLeft: 16, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center' },
  menuValue: { fontSize: 14, marginRight: 8 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 24, marginTop: 32, paddingVertical: 16, borderRadius: 12 },
  logoutText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  languageModal: { borderRadius: 16, paddingHorizontal: 20 },
  languageOption: { paddingVertical: 18, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
  languageOptionText: { fontSize: 16, fontWeight: '500' }
});
