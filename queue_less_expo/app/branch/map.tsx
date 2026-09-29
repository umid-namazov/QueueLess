import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../src/theme/colors';
import { ArrowLeft } from 'lucide-react-native';
import { useSettingsStore } from '../../src/store/settingsStore';
import { WebView } from 'react-native-webview';
import { apiGetBranches, Branch } from '../../src/services/api';

export default function MapScreen() {
  const theme = useSettingsStore((state) => state.theme);
  const color = Colors[theme];
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    apiGetBranches().then(setBranches).catch(console.error);
    
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(loc);
      }
    })();
  }, []);

  const lat = location?.coords.latitude || 41.311158;
  const lon = location?.coords.longitude || 69.279737;

  const mapHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      body { padding: 0; margin: 0; }
      html, body, #map { height: 100%; width: 100vw; }
      .custom-marker { background: ${color.primary}; border-radius: 50%; width: 24px; height: 24px; border: 3px solid #fff; box-shadow: 0 0 5px rgba(0,0,0,0.3); }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lon}], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // User location marker
      L.marker([${lat}, ${lon}]).addTo(map).bindPopup('Siz shu yerdasiz');

      // Branches
      var branches = ${JSON.stringify(branches)};
      
      var bIcon = L.divIcon({
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      branches.forEach(function(b) {
        if (!b.latitude || !b.longitude) return;
        var m = L.marker([b.latitude, b.longitude], {icon: bIcon}).addTo(map);
        m.bindPopup("<b>" + b.name + "</b><br/>" + (b.address || ""));
        
        m.on("click", function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(b));
          }
        });
      });
    </script>
  </body>
  </html>
  `;

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={[styles.header, { backgroundColor: color.background, borderBottomColor: color.border }]}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backButton}>
          <ArrowLeft color={color.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: color.text }]}>Filiallar xaritasi</Text>
        <View style={{ width: 24 }} />
      </View>

      <WebView
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={(event) => {
          try {
            const branch = JSON.parse(event.nativeEvent.data);
            if (branch && branch.id) {
              router.push('/branch/' + branch.id);
            }
          } catch (e) {}
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    zIndex: 10,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  map: { flex: 1 },
});
