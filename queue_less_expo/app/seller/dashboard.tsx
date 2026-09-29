import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowRight, CheckCircle2, Clock3, ScanLine, Users } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useTranslation } from '../../src/i18n';
import { apiGetMe, apiGetBranch, apiGetBranchQueue, apiGetMyBranches, apiCompleteQueue, User, Branch, QueueItem } from '../../src/services/api';
import Toast from 'react-native-toast-message';

export default function SellerDashboard() {
  const router = useRouter();
  const theme = useSettingsStore((state) => state.theme);
  const color = Colors[theme];

  const language = useSettingsStore((state) => state.language);
  const text = useTranslation(language);

  const [user, setUser] = useState<User | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [userData, myBranches] = await Promise.all([
        apiGetMe().catch(() => null),
        apiGetMyBranches().catch(() => [])
      ]);
      if (userData) setUser(userData);
      
      if (myBranches && myBranches.length > 0) {
        const firstBranch = myBranches[0];
        const [branchData, queueData] = await Promise.all([
          apiGetBranch(firstBranch.id).catch(() => null),
          apiGetBranchQueue(firstBranch.id).catch(() => [])
        ]);
        if (branchData) setBranch(branchData);
        setQueue(queueData || []);
      }
    } catch (e) {
      console.log('Seller dash error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: color.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  const waitingQueue = queue.filter(q => q.status === 'waiting');
  const confirmedQueue = queue.filter(q => q.status === 'confirmed');

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: color.primary }]}>{text.sellerPanelMenu.split('(')[0].toUpperCase()}</Text>
            <Text style={[styles.title, { color: color.text }]}>{text.welcome}, {user?.full_name?.split(' ')[0] || ''}</Text>
            <Text style={[styles.branch, { color: color.textSecondary }]}>{branch?.name || 'Filial'}</Text>
          </View>
          <View style={[styles.status, { backgroundColor: color.success + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: color.success }]} />
            <Text style={[styles.statusText, { color: color.success }]}>{text.open}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.scanButton, { backgroundColor: color.primary }]}
          onPress={() => router.push('/seller/scanner')}>
          <View style={styles.scanIcon}><ScanLine color="#fff" size={25} /></View>
          <View style={styles.scanCopy}>
            <Text style={styles.scanTitle}>{text.scanQrCode}</Text>
            <Text style={styles.scanSubtitle}>{text.confirmClientTurn}</Text>
          </View>
          <ArrowRight color="#fff" size={22} />
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: color.surface, borderColor: color.border }]}>
            <Users color={color.primary} size={20} />
            <Text style={[styles.statNumber, { color: color.text }]}>{queue.length}</Text>
            <Text style={[styles.statLabel, { color: color.textSecondary }]}>{text.activeQueues}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: color.surface, borderColor: color.border }]}
            onPress={() => router.push('/seller/history')}
          >
            <Clock3 color={color.primary} size={20} />
            <Text style={[styles.statNumber, { color: color.text }]}>—</Text>
            <Text style={[styles.statLabel, { color: color.textSecondary }]}>{text.queueHistory}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: color.text }]}>{text.activeQueues}</Text>
          <Text style={[styles.liveText, { color: color.success }]}>Jonli</Text>
        </View>

        {queue.length === 0 ? (
          <Text style={{ color: color.textSecondary, marginTop: 10 }}>Hozircha navbatda hech kim yo'q.</Text>
        ) : (
          queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled').map((item) => {
            const isActive = item.status === 'confirmed';
            return (
              <View key={item.id} style={[styles.queueCard, { backgroundColor: color.surface, borderColor: isActive ? color.primary : color.border, flexDirection: 'column', alignItems: 'stretch' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.ticket, { backgroundColor: isActive ? color.primary : color.border }]}>
                    <Text style={[styles.ticketText, { color: isActive ? '#fff' : color.text }]}>A-{(item.queue_number).toString().padStart(3, '0')}</Text>
                  </View>
                  <View style={styles.customerCopy}>
                    <Text style={[styles.customerName, { color: color.text }]}>{isActive ? 'Tasdiqlangan mijoz' : 'Kutayotgan mijoz'}</Text>
                    <Text style={[styles.service, { color: color.textSecondary }]}>Umumiy xizmat</Text>
                  </View>
                  <View style={styles.waitCopy}>
                    {isActive ? <CheckCircle2 color={color.success} size={18} /> : <Clock3 color={color.textSecondary} size={17} />}
                    <Text style={[styles.wait, { color: color.textSecondary }]}>{isActive ? 'Xizmatda' : `${item.estimated_wait_minutes} min`}</Text>
                  </View>
                </View>
                
                {isActive && (
                  <TouchableOpacity 
                    style={{ marginTop: 12, backgroundColor: color.success, padding: 12, borderRadius: 10, alignItems: 'center' }}
                    onPress={async () => {
                      try {
                        await apiCompleteQueue(item.id);
                        fetchData();
                        Toast.show({ type: 'success', text1: 'Yakunlandi', text2: "Mijozga xizmat ko'rsatish yakunlandi!" });
                      } catch (e: any) {
                        Toast.show({ type: 'error', text1: 'Xatolik', text2: e.message || "Xatolik yuz berdi" });
                      }
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tugatish (Yakunlash)</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  title: { fontSize: 25, fontWeight: '800', marginBottom: 6 },
  branch: { fontSize: 13 },
  status: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },
  scanButton: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 18, marginBottom: 18 },
  scanIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: '#ffffff25', alignItems: 'center', justifyContent: 'center' },
  scanCopy: { flex: 1, marginLeft: 14 },
  scanTitle: { color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 4 },
  scanSubtitle: { color: '#DBEAFE', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1 },
  statNumber: { fontSize: 27, fontWeight: '800', marginTop: 12, marginBottom: 2 },
  statLabel: { fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 19, fontWeight: '800' },
  liveText: { fontSize: 12, fontWeight: '700' },
  queueCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  ticket: { width: 57, height: 57, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  ticketText: { fontSize: 14, fontWeight: '800' },
  customerCopy: { flex: 1, marginLeft: 13 },
  customerName: { fontSize: 15, fontWeight: '700', marginBottom: 5 },
  service: { fontSize: 12 },
  waitCopy: { alignItems: 'flex-end', gap: 5 },
  wait: { fontSize: 11 },
});
