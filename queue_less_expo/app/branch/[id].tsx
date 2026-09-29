import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useTranslation } from '../../src/i18n/index';
import { ArrowLeft, Clock, MapPin, Users, Heart } from 'lucide-react-native';
import { apiGetBranch, apiGetBranchServices, Branch } from '../../src/services/api';
import { useFavoriteStore } from '../../src/store/favoriteStore';

type Service = { id: number; name: string; description: string; duration_minutes: number };

export default function BranchDetailsScreen() {
  const { id } = useLocalSearchParams();
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const color = Colors[theme];
  const t = useTranslation(language);
  const router = useRouter();
  
  const { isFavorite, toggleFavorite } = useFavoriteStore();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBranch();
    }
  }, [id]);

  const fetchBranch = async () => {
    try {
      setLoading(true);
      const data = await apiGetBranch(Number(id));
      setBranch(data);
      
      const srvs = await apiGetBranchServices(Number(id)).catch(() => []);
      setServices(srvs);
    } catch (error) {
      console.log('Error fetching branch:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: color.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  if (!branch) {
    return (
      <View style={[styles.container, { backgroundColor: color.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: color.text }}>Filial topilmadi</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: color.primary }}>Orqaga</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFav = isFavorite(branch.id);

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={[styles.header, { backgroundColor: color.background, borderBottomColor: color.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={color.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: color.text }]}>{t.branchDetails}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(branch.id)} style={styles.backButton}>
          <Heart color={isFav ? color.error : color.textSecondary} fill={isFav ? color.error : 'none'} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {branch.image_url ? (
          <Image source={{ uri: branch.image_url }} style={styles.imagePlaceholder} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: color.border, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: color.textSecondary }}>Rasm yo'q</Text>
          </View>
        )}
        
        <Text style={[styles.title, { color: color.text }]}>{branch.name}</Text>
        
        <View style={styles.infoRow}>
          <MapPin color={color.textSecondary} size={16} />
          <Text style={[styles.infoText, { color: color.textSecondary }]}>{branch.address || 'Manzil kiritilmagan'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Clock color={color.textSecondary} size={16} />
          <Text style={[styles.infoText, { color: color.textSecondary }]}>{branch.working_hours || 'Ish vaqti ko\'rsatilmagan'}</Text>
        </View>

        <View style={[styles.statsContainer, { backgroundColor: color.surface, borderColor: color.border }]}>
          <View style={styles.statBox}>
            <Users color={color.primary} size={24} />
            <Text style={[styles.statValue, { color: color.text }]}>{branch.current_waiting_count}</Text>
            <Text style={[styles.statLabel, { color: color.textSecondary }]}>{t.queuePeople}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: color.border }]} />
          <View style={styles.statBox}>
            <Clock color={color.warning} size={24} />
            <Text style={[styles.statValue, { color: color.text }]}>{branch.estimated_wait_minutes} min</Text>
            <Text style={[styles.statLabel, { color: color.textSecondary }]}>{t.estimatedWaitTime}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: color.text }]}>{t.services}</Text>

        {services.length > 0 ? services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[styles.serviceCard, { backgroundColor: color.surface, borderColor: color.border }]}
            onPress={() => router.push({ pathname: '/branch/booking', params: { id: branch.id, branchName: branch.name, service: service.name } })}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.serviceName, { color: color.text }]}>{service.name}</Text>
              {service.description ? <Text style={[styles.serviceDesc, { color: color.textSecondary, marginTop: 4, fontSize: 13 }]} numberOfLines={2}>{service.description}</Text> : null}
              <Text style={[styles.serviceDuration, { color: color.primary, marginTop: 6, fontSize: 12, fontWeight: '700' }]}>{service.duration_minutes} min</Text>
            </View>
            <ArrowLeft color={color.textSecondary} size={20} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        )) : (
          <View style={[styles.serviceCard, { backgroundColor: color.surface, borderColor: color.border, justifyContent: 'center' }]}>
            <Text style={{ color: color.textSecondary }}>Hozircha xizmatlar mavjud emas</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 24 },
  imagePlaceholder: { height: 160, borderRadius: 16, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 8, fontSize: 14 },
  statsContainer: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 24, marginBottom: 32 },
  statBox: { flex: 1, alignItems: 'center' },
  divider: { width: 1, marginHorizontal: 16 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  statLabel: { fontSize: 12, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  serviceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  serviceName: { fontSize: 16, fontWeight: '500' }
});
