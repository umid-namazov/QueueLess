import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { apiLogin } from '../../src/services/api';
import { AppLanguage, useSettingsStore } from '../../src/store/settingsStore';
import { useTranslation } from '../../src/i18n/index';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { theme, language, setLanguage } = useSettingsStore();
  const color = Colors[theme];
  const t = useTranslation(language);
  const insets = useSafeAreaInsets();
  
  const { setToken } = useAuthStore();
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (phone.length < 13 || password.length < 6) {
      setError(t.invalidPhonePassword);
      return;
    }

    try {
      setLoading(true);
      const { access_token: accessToken } = await apiLogin(phone, password);
      await setToken(accessToken);
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : t.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: color.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TouchableOpacity style={[styles.languageButton, { borderColor: color.border }]} onPress={() => setLanguageModalVisible(true)}>
          <Text style={[styles.languageButtonText, { color: color.primary }]}>{language === 'uz' ? 'O‘zbekcha' : language === 'ru' ? 'Русский' : 'English'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: color.text }]}>{t.welcome}</Text>
        <Text style={[styles.subtitle, { color: color.textSecondary }]}>
          {t.loginSubtitle}
        </Text>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: color.error + '20' }]}>
            <Text style={[styles.errorText, { color: color.error }]}>{error}</Text>
          </View>
        ) : null}

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
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? t.loggingIn : t.login}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={{ color: color.textSecondary }}>{t.noAccount} </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={{ color: color.primary, fontWeight: '600' }}>{t.register}</Text>
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  languageButton: { alignSelf: 'flex-end', borderWidth: 1, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 7, marginBottom: 26 },
  languageButtonText: { fontSize: 12, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  languageModal: { borderRadius: 16, paddingHorizontal: 20 },
  languageOption: { paddingVertical: 18, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
  languageOptionText: { fontSize: 16, fontWeight: '500' }
});
