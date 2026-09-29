import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck, Building2, ChevronDown, Clock3, MapPin, Send } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';
import { apiRequestBranch } from '../../src/services/api';
import { useTranslation } from '../../src/i18n';
import Toast from 'react-native-toast-message';

const categories = ['Sartaroshxona', 'Klinika', 'Avtoyuvish', 'Kafe va restoran', 'Boshqa'];

export default function BusinessOnboarding() {
  const router = useRouter();
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const text = useTranslation(language);
  const color = Colors[theme];
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const translatedCategories = [text.barber || 'Sartaroshxona', text.clinic || 'Klinika', text.carwash || 'Avtoyuvish', 'Kafe', 'Boshqa'];
  const [category, setCategory] = useState(translatedCategories[0]);

  const handleSubmit = async () => {
    if (!businessName || !phone) {
      Toast.show({ type: 'error', text1: 'Xatolik', text2: text.fillRequired });
      return;
    }
    
    setLoading(true);
    try {
      await apiRequestBranch({
        name: businessName,
        category: category === text.other ? customCategory : category,
        address: address || null,
        working_hours: "09:00-18:00",
        avg_service_minutes: 15
      });
      setSubmitted(true);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Xatolik', text2: e.message || 'Error' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: color.background }]}>
        <View style={[styles.statusIcon, { backgroundColor: color.warning + '20' }]}><Clock3 color={color.warning} size={34} /></View>
        <Text style={[styles.successTitle, { color: color.text }]}>{text.applicationSuccess}</Text>
        <Text style={[styles.successText, { color: color.textSecondary }]}>{text.applicationSuccessDesc}</Text>
        <View style={[styles.pendingCard, { backgroundColor: color.surface, borderColor: color.border }]}>
          <Text style={[styles.pendingLabel, { color: color.textSecondary }]}>HOLAT</Text>
          <Text style={[styles.pendingValue, { color: color.warning }]}>Kutilmoqda</Text>
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: color.primary }]} onPress={() => router.replace('/seller/dashboard')}>
          <Text style={styles.buttonText}>{text.sellerPanelMenu}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: color.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { borderBottomColor: color.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><ArrowLeft color={color.text} size={24} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: color.text }]}>{text.joinBusiness.split('(')[0]}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, { backgroundColor: color.primary + '12' }]}>
          <View style={[styles.heroIcon, { backgroundColor: color.primary }]}><Building2 color="#fff" size={24} /></View>
          <View style={styles.heroCopy}><Text style={[styles.heroTitle, { color: color.text }]}>{text.joinBusiness}</Text></View>
        </View>

        <Text style={[styles.label, { color: color.textSecondary }]}>{text.businessName}</Text>
        <TextInput value={businessName} onChangeText={setBusinessName} placeholder="QueueLess Barber" placeholderTextColor={color.textSecondary} style={[styles.input, { color: color.text, borderColor: color.border, backgroundColor: color.surface }]} />
        <Text style={[styles.label, { color: color.textSecondary }]}>{text.category}</Text>
        <View style={[styles.select, { borderColor: color.border, backgroundColor: color.surface }]}>
          <Text style={[styles.selectText, { color: color.text }]}>{category}</Text><ChevronDown color={color.textSecondary} size={19} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {translatedCategories.map((item) => <TouchableOpacity key={item} onPress={() => setCategory(item)} style={[styles.category, { borderColor: category === item ? color.primary : color.border, backgroundColor: category === item ? color.primary + '12' : color.surface }]}><Text style={{ color: category === item ? color.primary : color.textSecondary, fontSize: 12, fontWeight: '700' }}>{item}</Text></TouchableOpacity>)}
        </ScrollView>
        {category === 'Boshqa' && <>
          <Text style={[styles.label, { color: color.textSecondary }]}>{text.otherCategory}</Text>
          <TextInput value={customCategory} onChangeText={setCustomCategory} placeholderTextColor={color.textSecondary} style={[styles.input, { color: color.text, borderColor: color.border, backgroundColor: color.surface }]} />
        </>}
        <Text style={[styles.label, { color: color.textSecondary }]}>{text.businessPhone}</Text>
        <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={[styles.input, { color: color.text, borderColor: color.border, backgroundColor: color.surface }]} />
        <Text style={[styles.label, { color: color.textSecondary }]}>{text.address}</Text>
        <View style={[styles.inputWithIcon, { borderColor: color.border, backgroundColor: color.surface }]}><MapPin color={color.textSecondary} size={18} /><TextInput value={address} onChangeText={setAddress} placeholderTextColor={color.textSecondary} style={[styles.iconInput, { color: color.text }]} /></View>
        
        <View style={{ height: 40 }} />
        <TouchableOpacity style={[styles.button, { backgroundColor: color.primary }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <><Send color="#fff" size={18} /><Text style={styles.buttonText}>{text.submitApplication}</Text></>}
        </TouchableOpacity>
        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { paddingTop: 58, paddingBottom: 16, paddingHorizontal: 22, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 4 }, headerTitle: { fontSize: 18, fontWeight: '800' }, headerSpacer: { width: 32 },
  content: { padding: 24, paddingBottom: 40 }, hero: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 16, marginBottom: 28 }, heroIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, heroCopy: { flex: 1, marginLeft: 13 }, heroTitle: { fontSize: 16, fontWeight: '800', marginBottom: 5 }, heroText: { fontSize: 12, lineHeight: 18 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 18 }, label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 14 }, input: { borderWidth: 1, borderRadius: 13, padding: 15, fontSize: 15 }, select: { borderWidth: 1, borderRadius: 13, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, selectText: { fontSize: 15 }, categoryRow: { paddingTop: 10, gap: 8 }, category: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1 }, inputWithIcon: { borderWidth: 1, borderRadius: 13, paddingLeft: 14, flexDirection: 'row', alignItems: 'center' }, iconInput: { flex: 1, padding: 15, paddingLeft: 10, fontSize: 15 }, note: { marginTop: 22, padding: 13, borderRadius: 12, flexDirection: 'row', alignItems: 'flex-start' }, noteText: { flex: 1, fontSize: 12, lineHeight: 18, marginLeft: 9 }, button: { marginTop: 24, minHeight: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, buttonText: { color: '#fff', fontSize: 15, fontWeight: '800' }, statusIcon: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }, successTitle: { fontSize: 26, fontWeight: '800', marginBottom: 9 }, successText: { fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 330 }, pendingCard: { width: '100%', borderWidth: 1, borderRadius: 16, padding: 18, marginTop: 26, marginBottom: 4 }, pendingLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 }, pendingValue: { fontSize: 20, fontWeight: '800', marginTop: 7, marginBottom: 4 }, pendingHint: { fontSize: 12 },
});
