import React, { useEffect, useState, useMemo } from 'react';
import { Linking, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
    // Fetch branches for the map
    apiGetBranches().then(setBranches).catch(console.error);
  }, []);

  const requestLocation = async () => {
    setLocationError(null);
    const nextPermission = await Location.requestForegroundPermissionsAsync();
    setPermission(nextPermission);
    if (!nextPermission.granted) {
      setLocationError(nextPermission.canAskAgain ? 'Yaqin filiallarni ko‘rish uchun location ruxsati kerak.' : 'Location ruxsati o‘chirilgan. Sozlamalardan yoqing.');
      return;
    }
    try {
      setLocation(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    } catch {
      setLocationError('Joylashuvni aniqlab bo‘lmadi. Location xizmatini tekshiring.');
    }
  };

  useEffect(() => {
    let active = true;
    const loadLocation = async () => {
      const nextPermission = await Location.requestForegroundPermissionsAsync();
      if (!active) return;
      setPermission(nextPermission);
      if (!nextPermission.granted) {
        setLocationError(nextPermission.canAskAgain ? 'Yaqin filiallarni ko‘rish uchun location ruxsati kerak.' : 'Location ruxsati o‘chirilgan. Sozlamalardan yoqing.');
        return;
      }
      try {
        const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (active) setLocation(currentLocation);
      } catch {
        if (active) setLocationError('Joylashuvni aniqlab bo‘lmadi. Location xizmatini tekshiring.');
      }
    };
    loadLocation();
    return () => { active = false; };
  }, []);

  const mapHtml = useMemo(() => {
    const branchesJson = JSON.stringify(branches);
    const userLat = location?.coords.latitude || 'null';
    const userLon = location?.coords.longitude || 'null';

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <script src="https://api-maps.yandex.ru/2.1/?apikey=e76ab2ad-31b4-4bda-a7a5-c72e25ea51c3&lang=uz_UZ" type="text/javascript"></script>
          <style>
              body, html { padding: 0; margin: 0; width: 100%; height: 100%; overflow: hidden; }
              #map { width: 100%; height: 100%; }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script>
              ymaps.ready(function () {
                  var centerLat = ${userLat} !== null ? ${userLat} : 41.311158;
                  var centerLon = ${userLon} !== null ? ${userLon} : 69.279737;

                  var myMap = new ymaps.Map('map', {
                      center: [centerLat, centerLon],
                      zoom: 13,
                      controls: ['zoomControl', 'geolocationControl']
                  });

                  var branches = ${branchesJson};
                  
                  branches.forEach(function(branch) {
                      // Agar koordinatalari yo'q bo'lsa, markazga yaqinroq joylaymiz (mock)
                      var lat = branch.latitude || (41.311158 + (Math.random() - 0.5) * 0.05);
                      var lon = branch.longitude || (69.279737 + (Math.random() - 0.5) * 0.05);

                      var placemark = new ymaps.Placemark([lat, lon], {
                          balloonContent: '<b>' + branch.name + '</b><br/>' + branch.address,
                          hintContent: branch.name
                      }, {
                          preset: 'islands#blueDotIcon'
                      });
                      
                      placemark.events.add('click', function (e) {
                          window.ReactNativeWebView.postMessage(JSON.stringify(branch));
                      });
                      
                      myMap.geoObjects.add(placemark);
                  });
                  
                  if (${userLat} !== null && ${userLon} !== null) {
                      var userPlacemark = new ymaps.Placemark([${userLat}, ${userLon}], {
                          hintContent: 'Sizning joylashuvingiz'
                      }, {
                          preset: 'islands#redIcon'
                      });
                      myMap.geoObjects.add(userPlacemark);
                  }
              });
          </script>
      </body>
      </html>
    `;
  }, [branches, location]);

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.id) {
        setSelectedBranch(data);
      }
    } catch (e) {
      console.log('Error parsing map message:', e);
    }
  };

  const getStatusColor = (count: number) => {
    if (count < 5) return color.success;
    if (count < 15) return color.warning;
    return color.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={[styles.header, { backgroundColor: color.background, borderBottomColor: color.border }]}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backButton}>
          <ArrowLeft color={color.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: color.text }]}>
          {language === 'uz' ? 'Filiallar xaritasi' : language === 'ru' ? 'Карта отделений' : 'Branches map'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapPlaceholder}>
        <WebView 
          source={{ html: mapHtml, baseUrl: 'https://yandex.ru' }}
          originWhitelist={['*']}
          style={StyleSheet.absoluteFill}
          onMessage={onMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>

      {!location && (
        <View style={[styles.locationNotice, { backgroundColor: color.surface, borderColor: color.border }]}>
          <Text style={[styles.locationNoticeText, { color: color.text }]}>{locationError ?? 'Joylashuv aniqlanmoqda...'}</Text>
          {permission && !permission.granted && (
            <TouchableOpacity onPress={() => permission.canAskAgain ? requestLocation() : Linking.openSettings()}>
              <Text style={[styles.locationAction, { color: color.primary }]}>{permission.canAskAgain ? 'Qayta urinish' : 'Sozlamalarni ochish'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {selectedBranch && (
        <View style={[styles.bottomSheet, { backgroundColor: color.surface, borderTopColor: color.border }]}>
          <Text style={[styles.sheetTitle, { color: color.text }]}>{selectedBranch.name}</Text>
          <Text style={[styles.sheetAddress, { color: color.textSecondary }]}>{selectedBranch.address}</Text>
          
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedBranch.current_waiting_count) }]} />
            <Text style={[styles.statusText, { color: color.textSecondary }]}>
              {language === 'uz' ? `Kutish vaqti: ${selectedBranch.estimated_wait_minutes} min` : language === 'ru' ? `Время ожидания: ${selectedBranch.estimated_wait_minutes} мин` : `Wait time: ${selectedBranch.estimated_wait_minutes} min`}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: color.primary }]}
            onPress={() => router.push(`/branch/${selectedBranch.id}`)}
          >
            <Text style={styles.buttonText}>{language === 'uz' ? 'Batafsil' : language === 'ru' ? 'Подробнее' : 'Details'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  mapPlaceholder: { flex: 1, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  bottomSheet: { padding: 24, borderTopWidth: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  sheetAddress: { fontSize: 14, marginBottom: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { fontSize: 14 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  locationNotice: { position: 'absolute', top: 112, left: 24, right: 24, borderWidth: 1, borderRadius: 14, padding: 14 },
  locationNoticeText: { fontSize: 13, lineHeight: 18 },
  locationAction: { fontSize: 13, fontWeight: '700', marginTop: 8 },
});
