import { CalendarDays, CheckCircle2, Clock3 } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';

const history: any[] = [];

export default function SellerHistory() {
  const theme = useSettingsStore((state) => state.theme);
  const color = Colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.eyebrow, { color: color.primary }]}>SELLER PANELI</Text>
        <Text style={[styles.title, { color: color.text }]}>Xizmat tarixi</Text>
        <Text style={[styles.subtitle, { color: color.textSecondary }]}>Tasdiqlangan mijozlar va bajarilgan xizmatlar</Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: color.primary }]}><Text style={styles.summaryLabel}>BUGUN</Text><Text style={styles.summaryNumber}>0</Text><Text style={styles.summaryHint}>mijoz</Text></View>
          <View style={[styles.summaryCard, { backgroundColor: color.success }]}><Text style={styles.summaryLabel}>O‘RTACHA</Text><Text style={styles.summaryNumber}>0</Text><Text style={styles.summaryHint}>daqiqa</Text></View>
        </View>

        <View style={styles.listHeader}><Text style={[styles.sectionTitle, { color: color.text }]}>So‘nggi xizmatlar</Text><View style={styles.dateLabel}><CalendarDays color={color.textSecondary} size={15} /><Text style={[styles.dateText, { color: color.textSecondary }]}>Bugun</Text></View></View>
        {history.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: color.textSecondary }}>Hozircha xizmat tarixi yo'q.</Text>
          </View>
        ) : (
          history.map((item) => (
            <View key={item.number} style={[styles.historyCard, { backgroundColor: color.surface, borderColor: color.border }]}>
              <View style={[styles.ticket, { backgroundColor: color.success + '18' }]}><Text style={[styles.ticketText, { color: color.success }]}>{item.number}</Text></View>
              <View style={styles.copy}><Text style={[styles.name, { color: color.text }]}>{item.name}</Text><Text style={[styles.service, { color: color.textSecondary }]}>{item.service}</Text><Text style={[styles.time, { color: color.textSecondary }]}>{item.time}</Text></View>
              <View style={styles.result}><CheckCircle2 color={color.success} size={18} /><View style={styles.duration}><Clock3 color={color.textSecondary} size={12} /><Text style={[styles.durationText, { color: color.textSecondary }]}>{item.duration}</Text></View></View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 24, paddingTop: 60, paddingBottom: 30 }, eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 }, title: { fontSize: 27, fontWeight: '800', marginBottom: 6 }, subtitle: { fontSize: 13, marginBottom: 25 }, summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 30 }, summaryCard: { flex: 1, borderRadius: 16, padding: 16 }, summaryLabel: { color: '#DBEAFE', fontSize: 10, fontWeight: '800', letterSpacing: 1 }, summaryNumber: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 10 }, summaryHint: { color: '#E0F2FE', fontSize: 12 }, listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }, sectionTitle: { fontSize: 19, fontWeight: '800' }, dateLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 }, dateText: { fontSize: 12 }, historyCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 10 }, ticket: { width: 58, height: 58, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, ticketText: { fontSize: 13, fontWeight: '900' }, copy: { flex: 1, marginLeft: 12 }, name: { fontSize: 14, fontWeight: '800', marginBottom: 4 }, service: { fontSize: 12, marginBottom: 5 }, time: { fontSize: 11 }, result: { alignItems: 'flex-end', gap: 7 }, duration: { flexDirection: 'row', alignItems: 'center', gap: 4 }, durationText: { fontSize: 11 },
});
