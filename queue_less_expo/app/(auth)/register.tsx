import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { apiRegister } from '../../src/services/api';
import { AppLanguage, useSettingsStore } from '../../src/store/settingsStore';
import { useTranslation } from '../../src/i18n/index';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme, language, setLanguage } = useSettingsStore();
  const color = Colors[theme];
  const t = useTranslation(language);
  const insets = useSafeAreaInsets();
  
  const { setToken } = useAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'customer' | 'seller'>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || phone.length < 13 || password.length < 6) {
      setError('Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring.');
      return;
    }

    try {
      setLoading(true);
      const { access_token: accessToken } = await apiRegister(name, phone, password);
      await setToken(accessToken);
      router.replace(accountType === 'seller' ? ('/business' as never) : '/(tabs)/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : t.registerError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: color.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={[styles.languageButton, { borderColor: color.border }]} onPress={() => setLanguageModalVisible(true)}>
          <Text style={[styles.languageButtonText, { color: color.primary }]}>{language === 'uz' ? 'O‘zbekcha' : language === 'ru' ? 'Русский' : 'English'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: color.text }]}>{t.registerTitle} 🚀</Text>
        <Text style={[styles.subtitle, { color: color.textSecondary }]}>
          {t.registerSubtitle}
        </Text>

        <Text style={[styles.label, { color: color.textSecondary }]}>{language === 'uz' ? 'Siz kim sifatida foydalanasiz?' : language === 'ru' ? 'Кем вы будете пользоваться?' : 'How will you use the app?'}</Text>
        <View style={styles.accountTypes}>
          {(['customer', 'seller'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.accountType, { borderColor: accountType === type ? color.primary : color.border, backgroundColor: accountType === type ? color.primary + '12' : color.surface }]}
              onPress={() => setAccountType(type)}>
              <Text style={[styles.accountTypeTitle, { color: accountType === type ? color.primary : color.text }]}>{type === 'customer' ? (language === 'uz' ? 'Mijoz' : language === 'ru' ? 'Клиент' : 'Customer') : 'Seller'}</Text>
              <Text style={[styles.accountTypeText, { color: color.textSecondary }]}>{type === 'customer' ? (language === 'uz' ? 'Navbat band qilaman' : language === 'ru' ? 'Бронирую очередь' : 'I book a queue') : (language === 'uz' ? 'Biznesim bor' : language === 'ru' ? 'У меня есть бизнес' : 'I have a business')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: color.error + '20' }]}>
            <Text style={[styles.errorText, { color: color.error }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: color.textSecondary }]}>{t.fullName}</Text>
          <TextInput
            style={[styles.input, { color: color.text, borderColor: color.border }]}
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor={color.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: color.textSecondary }]}>{t.phone}</Text>
          <TextInput
            style={[styles.input, { color: color.text, borderColor: color.border }]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={color.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: color.textSecondary }]}>{t.password}</Text>
          <TextInput
            style={[styles.input, { color: color.text, borderColor: color.border }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={color.textSecondary}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: color.primary }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? (language === 'uz' ? "Ro'yxatdan o'tilmoqda..." : language === 'ru' ? 'Регистрация...' : 'Signing up...') : t.registerButton}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={{ color: color.textSecondary }}>{language === 'uz' ? 'Hisobingiz bormi?' : language === 'ru' ? 'У вас есть аккаунт?' : 'Already have an account?'} </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={{ color: color.primary, fontWeight: '600' }}>{t.login}</Text>
          </TouchableOpacity>
        </View>
        <Modal visible={languageModalVisible} transparent animationType="fade" onRequestClose={() => setLanguageModalVisible(false)}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setLanguageModalVisible(false)}>
            <View style={[styles.languageModal, { backgroundColor: color.surface }]}>
              {([['uz', t.uzbek], ['ru', t.russian], ['en', t.english]] as [AppLanguage, string][]).map(([value, label]) => (
                <TouchableOpacity key={value} style={[styles.languageOption, { borderBottomColor: color.border }]} onPress={() => { setLanguage(value); setLanguageModalVisible(false); }}>
                  <Text style={[styles.languageOptionText, { color: color.text }]}>{label}</Text>
                  {language === value && <Text style={{ color: color.primary }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  accountTypes: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  accountType: { flex: 1, borderWidth: 1, borderRadius: 13, padding: 14 },
  accountTypeTitle: { fontSize: 15, fontWeight: '800', marginBottom: 5 },
  accountTypeText: { fontSize: 11 }
  ,languageButton: { alignSelf: 'flex-end', borderWidth: 1, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 7, marginBottom: 26 },
  languageButtonText: { fontSize: 12, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  languageModal: { borderRadius: 16, paddingHorizontal: 20 },
  languageOption: { paddingVertical: 18, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
  languageOptionText: { fontSize: 16, fontWeight: '500' }
});
