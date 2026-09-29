import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useState, useEffect } from 'react';
import { apiConfirmQueue } from '../../src/services/api';
import Toast from 'react-native-toast-message';

export default function SellerConfirm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const qrCode = params.data as string;
  const theme = useSettingsStore((state) => state.theme);
  const color = Colors[theme];

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (qrCode) {
      confirmCode(qrCode);
    } else {
      setLoading(false);
      setErrorMsg("QR kod topilmadi");
    }
  }, [qrCode]);

  const confirmCode = async (code: string) => {
    try {
      const res = await apiConfirmQueue(code);
      setBooking(res);
      setSuccess(true);
    } catch (e: any) {
      setErrorMsg(e.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

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
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={color.primary} />
            <Text style={{ marginTop: 15, color: color.text }}>Tasdiqlanmoqda...</Text>
          </View>
        ) : success ? (
          <>
            <View style={[styles.successIcon, { backgroundColor: color.success + '18' }]}>
              <CheckCircle2 color={color.success} size={30} />
            </View>
            <Text style={[styles.title, { color: color.text }]}>Navbat tasdiqlandi!</Text>
            <Text style={[styles.subtitle, { color: color.textSecondary }]}>Mijoz xizmati boshlandi</Text>

            <View style={[styles.ticketPanel, { backgroundColor: color.primary }]}>
              <Text style={styles.ticketLabel}>NAVBAT RAQAMI</Text>
              <Text style={styles.ticket}>{booking?.queue_number}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.successIcon, { backgroundColor: color.error + '18' }]}>
              <AlertCircle color={color.error} size={30} />
            </View>
            <Text style={[styles.title, { color: color.text }]}>Xatolik</Text>
            <Text style={[styles.subtitle, { color: color.textSecondary, textAlign: 'center' }]}>{errorMsg}</Text>
          </>
        )}
      </View>

      <View style={[styles.footer, { borderTopColor: color.border, backgroundColor: color.background }]}>
        <TouchableOpacity style={[styles.confirmButton, { backgroundColor: success ? color.primary : color.error }]} onPress={() => router.replace('/seller/dashboard')}>
          <Text style={styles.confirmText}>Bosh sahifaga qaytish</Text>
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
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  successIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  title: { fontSize: 25, fontWeight: '800', marginTop: 16, marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  ticketPanel: { width: '100%', borderRadius: 18, padding: 18, alignItems: 'center', marginTop: 14 },
  ticketLabel: { color: '#DBEAFE', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  ticket: { color: '#fff', fontSize: 40, fontWeight: '900', marginVertical: 4 },
  footer: { borderTopWidth: 1, padding: 20, paddingBottom: 30 },
  confirmButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 17, borderRadius: 14 },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '800', marginLeft: 8 },
});
