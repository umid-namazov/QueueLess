import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { apiBookQueue } from '../../src/services/api';
import Toast from 'react-native-toast-message';

export default function BookingScreen() {
  const { id, branchName, service } = useLocalSearchParams();
  const theme = useSettingsStore((state) => state.theme);
  const color = Colors[theme];
  const router = useRouter();

  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const res = await apiBookQueue(Number(id));
      setTicketNumber(res.queue_number?.toString() || 'A-001');
      setIsSuccess(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Xatolik',
        text2: error.message || 'Navbat olishda xatolik yuz berdi'
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={[styles.container, styles.centerAll, { backgroundColor: color.background }]}>
        <CheckCircle color={color.success} size={80} />
        <Text style={[styles.successTitle, { color: color.text }]}>Muvaffaqiyatli!</Text>
        <Text style={[styles.successSubtitle, { color: color.textSecondary }]}>
          Navbatingiz band qilindi. Sizning taloningiz:
        </Text>
        <Text style={[styles.ticketNumber, { color: color.primary }]}>{ticketNumber}</Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: color.primary, width: '80%', marginTop: 32 }]}
          onPress={() => router.replace('/(tabs)/bookings')}
        >
          <Text style={styles.buttonText}>Navbatlarimga oʻtish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={[styles.header, { backgroundColor: color.background, borderBottomColor: color.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={color.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: color.text }]}>Tasdiqlash</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: color.surface, borderColor: color.border }]}>
          <Text style={[styles.summaryTitle, { color: color.textSecondary }]}>Filial:</Text>
          <Text style={[styles.summaryValue, { color: color.text }]}>{branchName || 'Noma\'lum filial'}</Text>
          
          <View style={styles.divider} />
          
          <Text style={[styles.summaryTitle, { color: color.textSecondary }]}>Xizmat turi:</Text>
          <Text style={[styles.summaryValue, { color: color.text }]}>{service || 'Umumiy xizmat'}</Text>

          <View style={styles.divider} />
          
          <Text style={[styles.summaryTitle, { color: color.textSecondary }]}>Sana va Vaqt:</Text>
          <Text style={[styles.summaryValue, { color: color.text }]}>{today} (jonli navbat)</Text>
        </View>

        <Text style={[styles.warningText, { color: color.warning }]}>
          Eslatma: Iltimos filialga borganingizdan so'ng, xodimga taloningizni ko'rsating.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: color.surface, borderTopColor: color.border }]}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: color.primary }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Navbat olish</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerAll: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 24 },
  summaryCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  summaryTitle: { fontSize: 14, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  warningText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 16 },
  footer: { padding: 24, borderTopWidth: 1 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  successTitle: { fontSize: 28, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  successSubtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  ticketNumber: { fontSize: 48, fontWeight: 'bold' }
});
