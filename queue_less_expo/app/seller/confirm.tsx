import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, MapPin, Phone, UserRound } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function SellerConfirm() {
  const router = useRouter();
  const theme = useSettingsStore((state) => state.theme);
  const color = Colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/seller/dashboard')} style={styles.backButton}>
          <ArrowLeft color={color.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: color.text }]}>Mijozni tekshirish</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={[styles.successIcon, { backgroundColor: color.success + '18' }]}>
          <CheckCircle2 color={color.success} size={30} />
        </View>
        <Text style={[styles.title, { color: color.text }]}>Mijoz topildi</Text>
        <Text style={[styles.subtitle, { color: color.textSecondary }]}>QR kod muvaffaqiyatli o‘qildi</Text>

        <View style={[styles.customerCard, { backgroundColor: color.surface, borderColor: color.border }]}>
          <View style={[styles.avatar, { backgroundColor: color.primary + '18' }]}><UserRound color={color.primary} size={25} /></View>
          <Text style={[styles.customerName, { color: color.text }]}>Ali Valiyev</Text>
          <Text style={[styles.service, { color: color.primary }]}>Kassa xizmati</Text>
          <View style={[styles.divider, { backgroundColor: color.border }]} />
          <View style={styles.detailRow}><MapPin color={color.textSecondary} size={18} /><Text style={[styles.detail, { color: color.textSecondary }]}>Kapitalbank · Amir Temur filiali</Text></View>
          <View style={styles.detailRow}><Phone color={color.textSecondary} size={18} /><Text style={[styles.detail, { color: color.textSecondary }]}>+998 ** *** 45 67</Text></View>
        </View>

        <View style={[styles.ticketPanel, { backgroundColor: color.primary }]}>
          <Text style={styles.ticketLabel}>NAVBAT RAQAMI</Text>
          <Text style={styles.ticket}>A-024</Text>
          <Text style={styles.ticketHint}>Kutilmoqda · 2 daqiqa</Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: color.border, backgroundColor: color.background }]}>
        <TouchableOpacity style={[styles.confirmButton, { backgroundColor: color.success }]} onPress={() => router.replace('/seller/dashboard')}>
          <CheckCircle2 color="#fff" size={20} />
          <Text style={styles.confirmText}>Navbatni tasdiqlash</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/seller/dashboard')} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: color.textSecondary }]}>Bekor qilish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 58, paddingHorizontal: 22, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerSpacer: { width: 32 },
  content: { padding: 24, alignItems: 'center' },
  successIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  title: { fontSize: 25, fontWeight: '800', marginTop: 16, marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  customerCard: { width: '100%', borderWidth: 1, borderRadius: 18, padding: 20, alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  customerName: { fontSize: 20, fontWeight: '800', marginBottom: 5 },
  service: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, width: '100%', marginVertical: 18 },
  detailRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 12 },
  detail: { fontSize: 13, marginLeft: 10 },
  ticketPanel: { width: '100%', borderRadius: 18, padding: 18, alignItems: 'center', marginTop: 14 },
  ticketLabel: { color: '#DBEAFE', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  ticket: { color: '#fff', fontSize: 40, fontWeight: '900', marginVertical: 4 },
  ticketHint: { color: '#DBEAFE', fontSize: 13 },
  footer: { borderTopWidth: 1, padding: 20, paddingBottom: 30 },
  confirmButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 17, borderRadius: 14 },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '800', marginLeft: 8 },
  cancelButton: { alignItems: 'center', padding: 14 },
  cancelText: { fontSize: 14, fontWeight: '600' },
});
