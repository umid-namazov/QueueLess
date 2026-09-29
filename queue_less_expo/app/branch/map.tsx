import React, { useEffect, useState } from 'react';
import { Linking, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../src/theme/colors';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { useSettingsStore } from '../../src/store/settingsStore';
import MapView, { Marker } from 'react-native-maps';
import { apiGetBranches, Branch } from '../../src/services/api';

export default function MapScreen() {
  const theme = useSettingsStore((state) => state.theme);
  const color = Colors[theme];
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permission, setPermission] = useState<Location.LocationPermissionResponse | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    apiGetBranches().then(setBranches).catch(console.error);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!active) return;
      setPermission(perm);
      if (!perm.granted) {
        setLocationError(perm.canAskAgain ? "Location ruxsati kerak." : "Sozlamalardan yoqing.");
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (active) setLocation(loc);
      } catch {
        if (active) setLocationError("Joylashuvni aniqlab bo'lmadi.");
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const initialRegion = {
    latitude: location?.coords.latitude ?? 41.311158,
    longitude: location?.coords.longitude ?? 69.279737,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={[styles.header, { backgroundColor: color.background, borderBottomColor: color.border }]}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backButton}>
          <ArrowLeft color={color.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: color.text }]}>Filiallar xaritasi</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapWrap}>
        <MapView 
          style={StyleSheet.absoluteFill} 
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {branches.map(b => {
            if (!b.latitude || !b.longitude) return null;
            return (
              <Marker
                key={b.id}
                coordinate={{ latitude: b.latitude, longitude: b.longitude }}
                title={b.name}
                description={b.address || ''}
                onPress={() => setSelectedBranch(b)}
              >
                <View style={[styles.markerIcon, { backgroundColor: color.primary }]}>
                  <MapPin color="#fff" size={16} />
                </View>
              </Marker>
            )
          })}
        </MapView>
      </View>

      {!location && (
        <View style={[styles.notice, { backgroundColor: color.surface, borderColor: color.border }]}>
          <Text style={{ color: color.text, fontSize: 13, lineHeight: 18 }}>
            {locationError ?? 'Joylashuv aniqlanmoqda...'}
          </Text>
          {permission && !permission.granted && (
            <TouchableOpacity
              onPress={() => permission.canAskAgain
                ? Location.requestForegroundPermissionsAsync()
                : Linking.openSettings()
              }>
              <Text style={{ color: color.primary, fontWeight: '700', marginTop: 8 }}>
                {permission.canAskAgain ? 'Qayta urinish' : 'Sozlamalarni ochish'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {selectedBranch && (
        <View style={[styles.sheet, { backgroundColor: color.surface, borderTopColor: color.border }]}>
          <Text style={[styles.sheetTitle, { color: color.text }]}>{selectedBranch.name}</Text>
          <Text style={{ color: color.textSecondary, fontSize: 14, marginBottom: 20 }}>
            {selectedBranch.address}
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: color.primary }]}
            onPress={() => router.push(`/branch/${selectedBranch.id}` as any)}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Batafsil ko'rish</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24, borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  mapWrap: { flex: 1 },
  sheet: {
    padding: 24, borderTopWidth: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  btn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  notice: {
    position: 'absolute', top: 112, left: 24, right: 24,
    borderWidth: 1, borderRadius: 14, padding: 14,
  },
  markerIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5,
  }
});
