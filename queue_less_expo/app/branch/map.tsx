import React, { useEffect, useState, useMemo } from 'react';
import { Linking, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../src/theme/colors';
import { ArrowLeft } from 'lucide-react-native';
import { useSettingsStore } from '../../src/store/settingsStore';
import { WebView } from 'react-native-webview';
import { apiGetBranches, Branch } from '../../src/services/api';

export default function MapScreen() {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
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

  const mapHtml = useMemo(() => {
    const bJson = JSON.stringify(branches);
    const uLat = location?.coords.latitude ?? null;
    const uLon = location?.coords.longitude ?? null;
    const cLat = uLat ?? 41.311158;
    const cLon = uLon ?? 69.279737;
    const userMarker = uLat !== null
      ? `L.marker([${uLat},${uLon}],{icon:L.divIcon({html:'<div style="background:#EF4444;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>',iconSize:[18,18],iconAnchor:[9,9],className:""})}).addTo(map).bindPopup("Siz bu yerdasiz");`
      : '';

    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%;overflow:hidden}</style>
</head><body><div id="map"></div><script>
var map=L.map("map").setView([${cLat},${cLon}],14);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(map);
var branches=${bJson};
var bIcon=L.divIcon({html:'<div style="background:#3B82F6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>',iconSize:[16,16],iconAnchor:[8,8],className:""});
branches.forEach(function(b){
  var lat=b.latitude||(41.311+(Math.random()-.5)*.04);
  var lon=b.longitude||(69.279+(Math.random()-.5)*.04);
  var m=L.marker([lat,lon],{icon:bIcon}).addTo(map);
  m.bindPopup("<b>"+b.name+"</b><br/>"+(b.address||""));
  m.on("click",function(){if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(b));});
});
${userMarker}
</script></body></html>`;
  }, [branches, location]);

  const onMessage = (e: any) => {
    try {
      const d = JSON.parse(e.nativeEvent.data);
      if (d?.id) setSelectedBranch(d);
    } catch {}
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
        <WebView
          source={{ html: mapHtml }}
          originWhitelist={['*']}
          style={StyleSheet.absoluteFill}
          onMessage={onMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
        />
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
});
