import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react-native';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';
import { apiGetPendingBranches, apiApproveBranch, Branch } from '../../src/services/api';
import Toast from 'react-native-toast-message';

export default function AdminDashboard() {
  const router = useRouter();
  const theme = useSettingsStore((state) => state.theme);
  const color = Colors[theme];
  
  const [pending, setPending] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPending = async () => {
    try {
      const data = await apiGetPendingBranches();
      setPending(data);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Xatolik', text2: 'Ma\'lumotlarni olishda xatolik' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPending();
    }, [])
  );

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await apiApproveBranch(id);
      Toast.show({ type: 'success', text1: 'Tasdiqlandi', text2: 'Biznes muvaffaqiyatli tasdiqlandi' });
      fetchPending();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Xatolik', text2: e.message || 'Tasdiqlashda xatolik' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={[styles.header, { borderBottomColor: color.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={color.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: color.text }]}>Admin Paneli</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: color.primary + '12' }]}>
          <View style={[styles.heroIcon, { backgroundColor: color.primary }]}>
            <ShieldCheck color="#fff" size={24} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroTitle, { color: color.text }]}>Sotuvchilarni tasdiqlash</Text>
            <Text style={[styles.heroText, { color: color.textSecondary }]}>Yangi kelib tushgan biznes arizalarini ko'rib chiqing.</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: color.text }]}>Kutilayotgan arizalar ({pending.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" color={color.primary} style={{ marginTop: 40 }} />
        ) : pending.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle2 color={color.success} size={48} />
            <Text style={[styles.emptyTitle, { color: color.text }]}>Hamma arizalar tasdiqlangan</Text>
            <Text style={[styles.emptyText, { color: color.textSecondary }]}>Yangi arizalar yo'q.</Text>
          </View>
        ) : (
          pending.map((branch) => (
            <View key={branch.id} style={[styles.card, { backgroundColor: color.surface, borderColor: color.border }]}>
              <Text style={[styles.cardTitle, { color: color.text }]}>{branch.name}</Text>
              <Text style={[styles.cardSub, { color: color.textSecondary }]}>Kategoriya: {branch.category}</Text>
              <Text style={[styles.cardSub, { color: color.textSecondary }]}>Manzil: {branch.address || 'Kiritilmagan'}</Text>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={[styles.btnApprove, { backgroundColor: color.success }]}
                  onPress={() => handleApprove(branch.id)}
                  disabled={processingId === branch.id}
                >
                  {processingId === branch.id ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>Tasdiqlash</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 58, paddingBottom: 16, paddingHorizontal: 22, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerSpacer: { width: 32 },
  content: { padding: 24, paddingBottom: 40 },
  hero: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 16, marginBottom: 28 },
  heroIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1, marginLeft: 13 },
  heroTitle: { fontSize: 16, fontWeight: '800', marginBottom: 5 },
  heroText: { fontSize: 12, lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardSub: { fontSize: 13, marginBottom: 4 },
  actions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  btnApprove: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  btnReject: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
