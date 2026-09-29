import { useState, useCallback } from 'react';
import { CalendarDays, CheckCircle2, Clock3 } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useFocusEffect } from 'expo-router';
import { apiGetBranchHistory, apiGetMyBranches, QueueItem } from '../../src/services/api';

export default function SellerHistory() {
  const theme = useSettingsStore((state) => state.theme);
  const color = Colors[theme];
  const [history, setHistory] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [avgMinutes, setAvgMinutes] = useState(0);

  const fetchHistory = async () => {
    try {
      const myBranches = await apiGetMyBranches().catch(() => []);
      if (myBranches && myBranches.length > 0) {
        const branchId = myBranches[0].id;
        const queueData = await apiGetBranchHistory(branchId).catch(() => []);
        setHistory(queueData);
        setTodayCount(queueData.length);
        if (queueData.length > 0) {
          const totalWait = queueData.reduce((sum, q) => sum + (q.estimated_wait_minutes || 0), 0);
          setAvgMinutes(Math.round(totalWait / queueData.length));
        } else {
          setAvgMinutes(0);
        }
      } else {
        setHistory([]);
        setTodayCount(0);
        setAvgMinutes(0);
      }
    } catch (e) {
      console.log('History fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.primary} />}
      >
        <Text style={[styles.eyebrow, { color: color.primary }]}>SELLER PANELI</Text>
        <Text style={[styles.title, { color: color.text }]}>Navbat tarixi</Text>
        <Text style={[styles.subtitle, { color: color.textSecondary }]}>Bugungi navbatlar va statistika</Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: color.primary }]}>
            <Text style={styles.summaryLabel}>BUGUN</Text>
            <Text style={styles.summaryNumber}>{todayCount}</Text>
            <Text style={styles.summaryHint}>navbat</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: color.success }]}>
            <Text style={styles.summaryLabel}>O'RTACHA</Text>
            <Text style={styles.summaryNumber}>{avgMinutes}</Text>
            <Text style={styles.summaryHint}>daqiqa</Text>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: color.text }]}>Bugungi navbatlar</Text>
          <View style={styles.dateLabel}>
            <CalendarDays color={color.textSecondary} size={15} />
            <Text style={[styles.dateText, { color: color.textSecondary }]}>Bugun</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={color.primary} style={{ marginTop: 30 }} />
        ) : history.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: color.textSecondary }}>Bugun hozircha navbat yo'q.</Text>
          </View>
        ) : (
          history.map((item) => (
            <View key={item.id} style={[styles.historyCard, { backgroundColor: color.surface, borderColor: color.border }]}>
              <View style={[styles.ticket, { backgroundColor: color.success + '18' }]}>
                <Text style={[styles.ticketText, { color: color.success }]}>
                  A-{item.queue_number.toString().padStart(3, '0')}
                </Text>
              </View>
              <View style={styles.copy}>
                <Text style={[styles.name, { color: color.text }]}>Navbat #{item.queue_number}</Text>
                <Text style={[styles.service, { color: color.textSecondary }]}>
                  {item.status === 'waiting'
                    ? 'Kutilmoqda'
                    : item.status === 'confirmed'
                    ? 'Tasdiqlangan'
                    : item.status === 'completed'
                    ? 'Yakunlangan'
                    : 'Bekor qilingan'}
                </Text>
              </View>
              <View style={styles.result}>
                <CheckCircle2
                  color={item.status === 'completed' ? color.success : color.textSecondary}
                  size={18}
                />
                <View style={styles.duration}>
                  <Clock3 color={color.textSecondary} size={12} />
                  <Text style={[styles.durationText, { color: color.textSecondary }]}>
                    {item.estimated_wait_minutes} min
                  </Text>
                </View>
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
  content: { padding: 24, paddingTop: 60, paddingBottom: 30 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  title: { fontSize: 27, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 13, marginBottom: 25 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16 },
  summaryLabel: { color: '#DBEAFE', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  summaryNumber: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 10 },
  summaryHint: { color: '#E0F2FE', fontSize: 12 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 19, fontWeight: '800' },
  dateLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 12 },
  historyCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 10 },
  ticket: { width: 58, height: 58, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ticketText: { fontSize: 13, fontWeight: '900' },
  copy: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  service: { fontSize: 12, marginBottom: 5 },
  result: { alignItems: 'flex-end', gap: 7 },
  duration: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText: { fontSize: 11 },
});
