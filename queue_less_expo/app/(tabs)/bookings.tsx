import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useTranslation } from '../../src/i18n';
import { apiGetMyQueue, apiCancelQueue, QueueItem, apiGetBranches, Branch } from '../../src/services/api';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from 'expo-router';

export default function BookingsScreen() {
  const { language, theme } = useSettingsStore();
  const text = useTranslation(language);
  const color = Colors[theme];
  const [selectedQr, setSelectedQr] = useState<string | null>(null);
  
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      const [branchesData, queuesData] = await Promise.all([
        apiGetBranches().catch(() => []),
        apiGetMyQueue().catch(() => [])
      ]);
      setBranches(branchesData);
      setQueues(queuesData);
    } catch (error) {
      console.log('Error fetching queues:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchQueues();
    }, [])
  );

  const getBranchName = (branchId: number) => {
    return branches.find(b => b.id === branchId)?.name || 'Noma\'lum filial';
  };
  
  const getBranchCategory = (branchId: number) => {
    const cat = branches.find(b => b.id === branchId)?.category || '';
    if (cat === 'poliklinika') return text.clinic;
    if (cat === 'bank') return text.bank;
    if (cat === 'sartaroshxona') return text.barber;
    return cat;
  };

  const handleCancel = (bookingId: number) => {
    Alert.alert(
      'Navbatni bekor qilish',
      'Haqiqatan ham bu navbatni bekor qilmoqchimisiz?',
      [
        { text: 'Yo\'q', style: 'cancel' },
        { 
          text: 'Ha, bekor qilish', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiCancelQueue(bookingId);
              Toast.show({ type: 'success', text1: 'Bekor qilindi', text2: 'Navbatingiz bekor qilindi' });
              fetchQueues();
            } catch (error) {
              console.log(error);
            }
          }
        }
      ]
    );
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return text.upcoming;
      case 'confirmed': return text.active;
      case 'completed': return text.completed;
      case 'cancelled': return text.cancelled;
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return color.warning;
      case 'confirmed': return color.success;
      case 'completed': return color.primary;
      case 'cancelled': return color.error;
      default: return color.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={[styles.header, { backgroundColor: color.background, borderBottomColor: color.border }]}>
        <Text style={[styles.headerTitle, { color: color.text }]}>{text.myBookings}</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {queues.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: color.textSecondary }}>Sizda hozircha navbatlar yo'q.</Text>
            </View>
          ) : (
            queues.map((booking) => (
              <View key={booking.id} style={[styles.ticketCard, { backgroundColor: color.surface, borderColor: color.border }]}>
                <View style={styles.ticketInfo}>
                  <Text style={[styles.branchName, { color: color.text }]}>{getBranchName(booking.branch_id)}</Text>
                  <Text style={[styles.serviceName, { color: color.textSecondary }]}>{getBranchCategory(booking.branch_id)}</Text>
                  
                  <View style={styles.timeRow}>
                    <View style={styles.timeBlock}>
                      <Text style={[styles.timeLabel, { color: color.textSecondary }]}>{text.time}</Text>
                      <Text style={[styles.timeValue, { color: color.text }]}>
                        {booking.estimated_wait_minutes} min
                      </Text>
                    </View>
                    <View style={styles.timeBlock}>
                      <Text style={[styles.timeLabel, { color: color.textSecondary }]}>{text.status}</Text>
                      <Text style={[styles.timeValue, { color: getStatusColor(booking.status) }]}>
                        {getStatusText(booking.status)}
                      </Text>
                    </View>
                  </View>

                  {(booking.status === 'waiting' || booking.status === 'confirmed') && (
                    <TouchableOpacity style={[styles.cancelBtn, { borderColor: color.error }]} onPress={() => handleCancel(booking.id)}>
                      <Text style={{ color: color.error, fontWeight: '600' }}>{text.cancel}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.qrContainer, { borderLeftColor: color.border }]}>
                  <Text style={[styles.ticketNumber, { color: color.primary }]}>{booking.queue_number}</Text>
                  {booking.qr_code && booking.status !== 'cancelled' ? (
                    <>
                      <View style={styles.qrWrapper}>
                        <TouchableOpacity onPress={() => setSelectedQr(booking.qr_code!)} accessibilityLabel={text.enlargeQr}>
                          <Image source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${booking.qr_code}` }} style={{ width: 80, height: 80 }} />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.tapText, { color: color.textSecondary }]}>{text.enlargeQr}</Text>
                    </>
                  ) : (
                    <Text style={{ color: color.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 10 }}>
                      {booking.status === 'cancelled' ? 'Bekor qilingan' : 'QR yo\'q'}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={selectedQr !== null} transparent animationType="fade" onRequestClose={() => setSelectedQr(null)}>
        <TouchableOpacity style={styles.qrModalBackdrop} activeOpacity={1} onPress={() => setSelectedQr(null)}>
          <View style={[styles.qrModalCard, { backgroundColor: color.surface }]}>
            <Image source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${selectedQr ?? ''}` }} style={styles.largeQr} />
            <Text style={[styles.largeQrLabel, { color: color.text }]}>QR Kod</Text>
            <Text style={[styles.closeLabel, { color: color.primary }]}>{text.close}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  content: { padding: 24 },
  ticketCard: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  ticketInfo: { flex: 2, padding: 16 },
  branchName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  serviceName: { fontSize: 14, marginBottom: 16 },
  timeRow: { flexDirection: 'row', marginBottom: 16 },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 12, marginBottom: 4 },
  timeValue: { fontSize: 14, fontWeight: '600' },
  cancelBtn: { borderWidth: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', width: '80%' },
  qrContainer: { flex: 1, borderLeftWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', padding: 12 },
  ticketNumber: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  qrWrapper: { padding: 4, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8 },
  tapText: { fontSize: 10 },
  qrModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  qrModalCard: { borderRadius: 20, padding: 24, alignItems: 'center' },
  largeQr: { width: 280, height: 280, backgroundColor: '#fff' },
  largeQrLabel: { fontSize: 18, fontWeight: '700', marginTop: 14 },
  closeLabel: { fontSize: 14, fontWeight: '600', marginTop: 12 }
});
