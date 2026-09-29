import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Bell, Building2, Check, Clock3, Globe2, LogOut, Moon, Pencil, Plus, Trash2, UserRound } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { AppLanguage, useSettingsStore } from '../../src/store/settingsStore';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/store/authStore';
import { apiGetMe, apiGetMyBranches, User, Branch } from '../../src/services/api';

type Service = { id: number; name: string; description: string; duration: string };

const initialServices: Service[] = [
  { id: 1, name: 'Kassa xizmati', description: "Naqd pul yechish va to'lovlarni amalga oshirish", duration: '10 daqiqa' },
  { id: 2, name: 'Plastik karta olish', description: 'Yangi karta ochish yoki tayyor kartani olish', duration: '15 daqiqa' },
  { id: 3, name: 'Hisob ochish', description: 'Jismoniy shaxslar uchun bank hisob raqami', duration: '20 daqiqa' },
];

export default function SellerSettings() {
  const router = useRouter();
  const { language, theme, setLanguage, setTheme, notificationsEnabled, setNotificationsEnabled } = useSettingsStore();
  const color = Colors[theme];
  const text = useTranslation(language);
  const logout = useAuthStore((state) => state.logout);
  
  const [user, setUser] = useState<User | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [services, setServices] = useState(initialServices);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('10');

  const fetchData = async () => {
    try {
      const [userData, myBranches] = await Promise.all([
        apiGetMe().catch(() => null),
        apiGetMyBranches().catch(() => []),
      ]);
      if (userData) setUser(userData);
      if (myBranches && myBranches.length > 0) {
        setBranch(myBranches[0]);
      }
    } catch (e) {
      console.log('Seller settings fetch error:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setName(service.name);
    setDescription(service.description);
    setDuration(service.duration.replace(' daqiqa', ''));
  };

  const startAdd = () => {
    setEditingId(0);
    setName('');
    setDescription('');
    setDuration('10');
  };

  const saveService = () => {
    if (!name.trim()) return;
    const service = { id: editingId || Date.now(), name: name.trim(), description: description.trim(), duration: `${duration || '10'} daqiqa` };
    setServices((current) => editingId ? current.map((item) => item.id === editingId ? service : item) : [...current, service]);
    setEditingId(null);
  };

  const removeService = (id: number) => setServices((current) => current.filter((item) => item.id !== id));

  const chooseProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={[styles.header, { borderBottomColor: color.border }]}>
        <TouchableOpacity onPress={() => router.replace('/seller/dashboard')} style={styles.backButton}><ArrowLeft color={color.text} size={24} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: color.text }]}>Seller sozlamalari</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.eyebrow, { color: color.primary }]}>PROFIL</Text>
        <View style={[styles.profileCard, { backgroundColor: color.surface, borderColor: color.border }]}>
          <TouchableOpacity onPress={chooseProfileImage} style={[styles.avatar, { backgroundColor: color.primary + '18' }]}>
            {profileImage ? <Image source={{ uri: profileImage }} style={styles.avatarImage} /> : <UserRound color={color.primary} size={31} />}
            <View style={[styles.cameraBadge, { backgroundColor: color.primary }]}><Pencil color="#fff" size={11} /></View>
          </TouchableOpacity>
          <View style={styles.profileCopy}>
            <Text style={[styles.profileName, { color: color.text }]}>{user?.full_name || 'Yuklanmoqda...'}</Text>
            <Text style={[styles.profilePhone, { color: color.textSecondary }]}>{user?.phone || '...'}</Text>
            <Text style={[styles.roleLabel, { color: color.primary }]}>Seller · {branch?.name || ''}</Text>
          </View>
        </View>

        <Text style={[styles.eyebrow, { color: color.primary }]}>UMUMIY SOZLAMALAR</Text>
        <View style={[styles.preferenceCard, { backgroundColor: color.surface, borderColor: color.border }]}>
          <View style={[styles.preferenceRow, { borderBottomColor: color.border }]}><View style={styles.preferenceIcon}><Moon color={color.textSecondary} size={19} /></View><View style={styles.preferenceCopy}><Text style={[styles.preferenceTitle, { color: color.text }]}>Tungi rejim</Text><Text style={[styles.preferenceHint, { color: color.textSecondary }]}>Ilova ko‘rinishini o‘zgartirish</Text></View><Switch value={theme === 'dark'} onValueChange={(enabled) => setTheme(enabled ? 'dark' : 'light')} /></View>
          <View style={styles.preferenceRow}><View style={styles.preferenceIcon}><Bell color={color.textSecondary} size={19} /></View><View style={styles.preferenceCopy}><Text style={[styles.preferenceTitle, { color: color.text }]}>{text.notifications}</Text><Text style={[styles.preferenceHint, { color: color.textSecondary }]}>Navbat va mijozlar haqida xabarlar</Text></View><Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} /></View>
          <TouchableOpacity style={styles.preferenceRow} onPress={() => setLanguageModalVisible(true)}><View style={styles.preferenceIcon}><Globe2 color={color.textSecondary} size={19} /></View><View style={styles.preferenceCopy}><Text style={[styles.preferenceTitle, { color: color.text }]}>{text.language}</Text><Text style={[styles.preferenceHint, { color: color.textSecondary }]}>{language === 'uz' ? text.uzbek : language === 'ru' ? text.russian : text.english}</Text></View><Text style={[styles.languageValue, { color: color.primary }]}>›</Text></TouchableOpacity>
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

        <Text style={[styles.eyebrow, { color: color.primary }]}>FILIAL MA’LUMOTLARI</Text>
        <View style={[styles.branchCard, { backgroundColor: color.surface, borderColor: color.border }]}>
          <View style={[styles.branchIcon, { backgroundColor: color.primary + '15' }]}><Building2 color={color.primary} size={23} /></View>
          <View style={styles.branchCopy}>
            <Text style={[styles.branchName, { color: color.text }]}>{branch?.name || 'Yuklanmoqda...'}</Text>
            <Text style={[styles.branchAddress, { color: color.textSecondary }]}>{branch?.address || ''}</Text>
          </View>
          <TouchableOpacity><Pencil color={color.textSecondary} size={18} /></TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}><View><Text style={[styles.sectionTitle, { color: color.text }]}>Xizmatlar</Text><Text style={[styles.sectionSubtitle, { color: color.textSecondary }]}>Mijozlar ko‘radigan xizmatlar ro‘yxati</Text></View><Text style={[styles.count, { color: color.primary }]}>{services.length} ta</Text></View>
        {services.map((service) => (
          <View key={service.id} style={[styles.serviceCard, { backgroundColor: color.surface, borderColor: color.border }]}>
            <View style={styles.serviceTop}><View style={[styles.serviceIcon, { backgroundColor: color.success + '18' }]}><Check color={color.success} size={17} /></View><View style={styles.serviceCopy}><Text style={[styles.serviceName, { color: color.text }]}>{service.name}</Text><Text style={[styles.serviceDescription, { color: color.textSecondary }]}>{service.description || 'Description kiritilmagan'}</Text></View><TouchableOpacity onPress={() => startEdit(service)} style={styles.action}><Pencil color={color.primary} size={17} /></TouchableOpacity><TouchableOpacity onPress={() => removeService(service.id)} style={styles.action}><Trash2 color={color.error} size={17} /></TouchableOpacity></View>
            <View style={styles.duration}><Clock3 color={color.textSecondary} size={14} /><Text style={[styles.durationText, { color: color.textSecondary }]}>{service.duration}</Text></View>
          </View>
        ))}
        <TouchableOpacity style={[styles.addButton, { borderColor: color.primary }]} onPress={startAdd}><Plus color={color.primary} size={20} /><Text style={[styles.addText, { color: color.primary }]}>Yangi xizmat qo‘shish</Text></TouchableOpacity>

        {editingId !== null && <View style={[styles.editor, { backgroundColor: color.surface, borderColor: color.border }]}>
          <Text style={[styles.editorTitle, { color: color.text }]}>{editingId === 0 ? 'Yangi xizmat' : 'Xizmatni tahrirlash'}</Text>
          <Text style={[styles.label, { color: color.textSecondary }]}>Xizmat nomi</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Masalan, Kredit maslahati" placeholderTextColor={color.textSecondary} style={[styles.input, { color: color.text, borderColor: color.border, backgroundColor: color.background }]} />
          <Text style={[styles.label, { color: color.textSecondary }]}>Qisqa description</Text>
          <TextInput value={description} onChangeText={setDescription} multiline placeholder="Mijoz bu xizmat haqida nimani bilishi kerak?" placeholderTextColor={color.textSecondary} style={[styles.input, styles.textArea, { color: color.text, borderColor: color.border, backgroundColor: color.background }]} />
          <Text style={[styles.label, { color: color.textSecondary }]}>Davomiyligi (daqiqa)</Text>
          <TextInput value={duration} onChangeText={setDuration} keyboardType="number-pad" style={[styles.input, { color: color.text, borderColor: color.border, backgroundColor: color.background }]} />
          <View style={styles.editorActions}><TouchableOpacity onPress={() => setEditingId(null)} style={[styles.cancelButton, { borderColor: color.border }]}><Text style={[styles.cancelText, { color: color.textSecondary }]}>Bekor qilish</Text></TouchableOpacity><TouchableOpacity onPress={saveService} style={[styles.saveButton, { backgroundColor: color.primary }]}><Check color="#fff" size={18} /><Text style={styles.saveText}>Saqlash</Text></TouchableOpacity></View>
        </View>}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: color.primary + '12', borderColor: color.primary, borderWidth: 1 }]} 
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Globe2 color={color.primary} size={19} />
          <Text style={[styles.logoutText, { color: color.primary }]}>Mijoz paneliga o'tish</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: color.error + '12' }]} onPress={() => { logout(); router.replace('/(auth)/login'); }}>
          <LogOut color={color.error} size={19} />
          <Text style={[styles.logoutText, { color: color.error }]}>Seller accountdan chiqish</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, header: { paddingTop: 58, paddingBottom: 16, paddingHorizontal: 22, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, backButton: { padding: 4 }, headerTitle: { fontSize: 18, fontWeight: '800' }, headerSpacer: { width: 32 }, content: { padding: 24, paddingBottom: 45 }, eyebrow: { fontSize: 11, letterSpacing: 1.1, fontWeight: '800', marginBottom: 10 }, profileCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 28 }, avatar: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible' }, avatarImage: { width: 68, height: 68, borderRadius: 22 }, cameraBadge: { position: 'absolute', right: -5, bottom: -5, width: 23, height: 23, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, profileCopy: { flex: 1, marginLeft: 14 }, profileName: { fontSize: 17, fontWeight: '800', marginBottom: 4 }, profilePhone: { fontSize: 12, marginBottom: 5 }, roleLabel: { fontSize: 12, fontWeight: '800' }, preferenceCard: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 15, marginBottom: 30 }, preferenceRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 }, preferenceIcon: { width: 32, alignItems: 'center' }, preferenceCopy: { flex: 1, marginLeft: 8 }, preferenceTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 }, preferenceHint: { fontSize: 11 }, languageValue: { fontSize: 25, fontWeight: '300' }, branchCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 30 }, branchIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, branchCopy: { flex: 1, marginLeft: 12 }, branchName: { fontSize: 16, fontWeight: '800', marginBottom: 4 }, branchAddress: { fontSize: 12 }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }, sectionTitle: { fontSize: 21, fontWeight: '800', marginBottom: 4 }, sectionSubtitle: { fontSize: 12 }, count: { fontSize: 13, fontWeight: '800' }, serviceCard: { padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 10 }, serviceTop: { flexDirection: 'row', alignItems: 'flex-start' }, serviceIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, serviceCopy: { flex: 1, marginLeft: 10 }, serviceName: { fontSize: 15, fontWeight: '800', marginBottom: 5 }, serviceDescription: { fontSize: 12, lineHeight: 17 }, action: { padding: 5, marginLeft: 2 }, duration: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginLeft: 40, gap: 5 }, durationText: { fontSize: 11 }, addButton: { minHeight: 52, borderWidth: 1, borderRadius: 14, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5 }, addText: { fontSize: 14, fontWeight: '800', marginLeft: 8 }, editor: { borderWidth: 1, borderRadius: 18, padding: 18, marginTop: 24 }, editorTitle: { fontSize: 18, fontWeight: '800', marginBottom: 3 }, label: { fontSize: 12, fontWeight: '700', marginTop: 14, marginBottom: 7 }, input: { borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 14 }, textArea: { minHeight: 78, textAlignVertical: 'top' }, editorActions: { flexDirection: 'row', gap: 10, marginTop: 20 }, cancelButton: { flex: 1, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 48 }, cancelText: { fontSize: 13, fontWeight: '700' }, saveButton: { flex: 1, borderRadius: 12, minHeight: 48, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 }, saveText: { color: '#fff', fontSize: 13, fontWeight: '800' }, modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 }, languageModal: { borderRadius: 16, paddingHorizontal: 20 }, languageOption: { paddingVertical: 18, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between' }, languageOptionText: { fontSize: 16, fontWeight: '500' }, logoutButton: { minHeight: 52, borderRadius: 14, marginTop: 28, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, logoutText: { fontSize: 14, fontWeight: '800', marginLeft: 8 },
});
