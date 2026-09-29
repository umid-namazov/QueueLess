import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { MapPin } from 'lucide-react-native';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useTranslation } from '../../src/i18n/index';
import { CATEGORIES } from '../../src/constants/mockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiGetBranches, Branch, apiGetMe, User, apiGetMyQueue, QueueItem } from '../../src/services/api';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import { useFavoriteStore } from '../../src/store/favoriteStore';

export default function HomeScreen() {
  const favorites = useFavoriteStore(state => state.favorites);
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const color = Colors[theme];
  const t = useTranslation(language);
  const router = useRouter();
  
  const [activeCategory, setActiveCategory] = useState('0');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeQueue, setActiveQueue] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const insets = useSafeAreaInsets();

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation(location);
      }
    };
    getLocation();
  }, []);

  const fetchData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      // Run API calls in parallel
      const [branchesData, userData, queuesData] = await Promise.all([
        apiGetBranches(),
        apiGetMe().catch(() => null),
        apiGetMyQueue().catch(() => [])
      ]);
      setBranches(branchesData);
      setUser(userData);
      
      // Find the first waiting or confirmed queue
      const active = queuesData.find(q => q.status === 'waiting' || q.status === 'confirmed');
      setActiveQueue(active || null);
    } catch (error) {
      console.log('Error fetching home data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(branches.length === 0);
    }, [branches.length])
  );

  const activeCategoryStr = CATEGORIES.find(c => c.id === activeCategory)?.categoryStr || '';

  let filteredBranches = activeCategory === '0' 
    ? branches 
    : branches.filter(b => b.category === activeCategoryStr);

  if (userLocation) {
    filteredBranches = filteredBranches.map(b => {
      if (b.latitude && b.longitude) {
        const dist = getDistance(userLocation.coords.latitude, userLocation.coords.longitude, b.latitude, b.longitude);
        return { ...b, calculatedDistance: dist };
      }
      return { ...b, calculatedDistance: Infinity };
    }).sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }

  const renderCategory = ({ item }: { item: (typeof CATEGORIES)[number] }) => {
    const isActive = activeCategory === item.id;
    return (
      <TouchableOpacity 
        style={[
          styles.categoryCard, 
          { 
            backgroundColor: isActive ? color.primary : color.surface, 
            borderColor: isActive ? color.primary : color.border 
          }
        ]}
        onPress={() => setActiveCategory(item.id)}
      >
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <Text style={[styles.categoryName, { color: isActive ? '#fff' : color.text }]}>{t[item.nameKey]}</Text>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (count: number) => {
    if (count < 5) return color.success;
    if (count < 15) return color.warning;
    return color.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: color.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: color.primary }]}>
        <Text style={styles.greeting}>{t.interpolate('greeting', { name: user?.full_name || 'Mehmon' })}</Text>
        <Text style={styles.subGreeting}>{t.greetingSubtitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Queue Card */}
        {activeQueue && (
          <View style={[styles.activeQueueCard, { backgroundColor: color.surface, borderColor: color.border }]}>
            <View style={styles.activeQueueHeader}>
              <Text style={[styles.activeQueueTitle, { color: color.text }]}>{t.activeQueue}</Text>
              <View style={[styles.badge, { backgroundColor: color.success + '20' }]}>
                <Text style={{ color: color.success, fontSize: 12, fontWeight: 'bold' }}>
                  Oldinda {activeQueue.people_ahead} kishi
                </Text>
              </View>
            </View>
            <Text style={[styles.activeQueueBranch, { color: color.primary }]}>
              {branches.find(b => b.id === activeQueue.branch_id)?.name || 'Filial'}
            </Text>
            <View style={styles.activeQueueDetails}>
              <Text style={{ color: color.textSecondary }}>{t.ticket}: <Text style={{ color: color.text, fontWeight: 'bold' }}>{activeQueue.queue_number}</Text></Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
                <Text style={{ color: color.primary, fontWeight: '600' }}>{t.goToBooking}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Categories */}
        <Text style={[styles.sectionTitle, { color: color.text }]}>{t.serviceTypes}</Text>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Favorite Branches */}
        {favorites.length > 0 && (
          <>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setShowAllFavorites(!showAllFavorites)}
            >
              <Text style={[styles.sectionTitle, { color: color.text }]}>Sevimli joylarim</Text>
              {favorites.length > 1 && (
                <Text style={{ color: color.primary, fontWeight: '600' }}>
                  {showAllFavorites ? 'Yashirish' : 'Barchasi'}
                </Text>
              )}
            </TouchableOpacity>
            
            {branches
              .filter(b => favorites.includes(b.id))
              .slice(0, showAllFavorites ? undefined : 1)
              .map(branch => (
              <TouchableOpacity 
                key={`fav-${branch.id}`} 
                style={[styles.branchCard, { backgroundColor: color.surface, borderColor: color.border, marginBottom: 12 }]}
                onPress={() => router.push(`/branch/${branch.id}`)}
              >
                <View style={styles.branchInfo}>
                  <Text style={[styles.branchName, { color: color.text }]}>{branch.name}</Text>
                  <View style={styles.branchAddressRow}>
                    <MapPin color={color.textSecondary} size={14} />
                    <Text style={[styles.branchAddress, { color: color.textSecondary }]} numberOfLines={1}>
                      {branch.address}
                    </Text>
                  </View>
                </View>
                <View style={styles.branchStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(branch.current_waiting_count) }]} />
                  <Text style={{ color: color.textSecondary, fontSize: 12 }}>{branch.estimated_wait_minutes} min</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Nearby Branches */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: color.text }]}>{t.nearby}</Text>
          <TouchableOpacity onPress={() => router.push('/branch/map')}>
            <Text style={{ color: color.primary, fontWeight: '600' }}>{t.viewOnMap}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={color.primary} />
          </View>
        ) : filteredBranches.length > 0 ? filteredBranches.map(branch => (
          <TouchableOpacity 
            key={branch.id} 
            style={[styles.branchCard, { backgroundColor: color.surface, borderColor: color.border }]}
            onPress={() => router.push(`/branch/${branch.id}`)}
          >
            <View style={styles.branchInfo}>
              <Text style={[styles.branchName, { color: color.text }]}>{branch.name}</Text>
              <View style={styles.branchAddressRow}>
                <MapPin color={color.textSecondary} size={14} />
                <Text style={[styles.branchAddress, { color: color.textSecondary }]} numberOfLines={1}>
                  {branch.calculatedDistance && branch.calculatedDistance !== Infinity 
                    ? `${branch.calculatedDistance.toFixed(1)} km · ` 
                    : ''}
                  {branch.address}
                </Text>
              </View>
            </View>
            <View style={styles.branchStatus}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(branch.current_waiting_count) }]} />
              <Text style={{ color: color.textSecondary, fontSize: 12 }}>{branch.estimated_wait_minutes} daqiqa</Text>
            </View>
          </TouchableOpacity>
        )) : (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: color.textSecondary }}>Ushbu yo'nalishda yaqin filiallar topilmadi.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  greeting: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subGreeting: { color: '#E2E8F0', fontSize: 14 },
  content: { padding: 24 },
  activeQueueCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  activeQueueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activeQueueTitle: { fontWeight: 'bold', fontSize: 16 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  activeQueueBranch: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  activeQueueDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  categoriesList: { paddingBottom: 24 },
  categoryCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginRight: 12, alignItems: 'center', minWidth: 100 },
  categoryIcon: { fontSize: 32, marginBottom: 8 },
  categoryName: { fontWeight: '500', fontSize: 14 },
  branchCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  branchInfo: { flex: 1 },
  branchName: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  branchAddressRow: { flexDirection: 'row', alignItems: 'center' },
  branchAddress: { fontSize: 12, marginLeft: 4 },
  branchStatus: { alignItems: 'flex-end', justifyContent: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 }
});
