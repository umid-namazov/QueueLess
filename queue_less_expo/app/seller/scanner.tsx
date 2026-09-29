import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, Camera, Flashlight, ScanLine, Settings as SettingsIcon } from 'lucide-react-native';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function SellerScanner() {
  const router = useRouter();
  const theme = useSettingsStore((state) => state.theme);
  const color = Colors[theme];
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      setScanned(false);
      return () => setIsFocused(false);
    }, [])
  );

  if (!permission) {
    return <View style={styles.permissionContainer}><Text style={styles.permissionText}>Kamera tekshirilmoqda...</Text></View>;
  }

  if (!permission.granted) {
    const openSettings = () => Linking.openSettings();
    return (
      <View style={[styles.permissionContainer, { backgroundColor: color.background }]}>
        <Camera color={color.primary} size={48} />
        <Text style={[styles.permissionTitle, { color: color.text }]}>Kamera ruxsati kerak</Text>
        <Text style={[styles.permissionText, { color: color.textSecondary }]}>QR kodni skanerlash uchun QueueLess kameradan foydalanadi.</Text>
        <TouchableOpacity style={[styles.permissionButton, { backgroundColor: color.primary }]} onPress={permission.canAskAgain ? requestPermission : openSettings}>
          {permission.canAskAgain ? <Camera color="#fff" size={18} /> : <SettingsIcon color="#fff" size={18} />}
          <Text style={styles.permissionButtonText}>{permission.canAskAgain ? 'Ruxsat berish' : 'Sozlamalarni ochish'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/seller/dashboard')}><Text style={[styles.backText, { color: color.textSecondary }]}>Orqaga</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#101827' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/seller/dashboard')} style={styles.iconButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR kodni skanerlash</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setTorchEnabled((enabled) => !enabled)} accessibilityLabel="Chiroqni yoqish yoki o‘chirish">
          <Flashlight color="#fff" size={21} />
        </TouchableOpacity>
      </View>

      <View style={styles.scannerArea}>
        {isFocused && (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={torchEnabled}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : ({ data }: BarcodeScanningResult) => {
              setScanned(true);
              router.push({ pathname: '/seller/confirm', params: { data } });
            }}
          />
        )}
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.topLeft, { borderColor: color.primary }]} />
          <View style={[styles.corner, styles.topRight, { borderColor: color.primary }]} />
          <View style={[styles.corner, styles.bottomLeft, { borderColor: color.primary }]} />
          <View style={[styles.corner, styles.bottomRight, { borderColor: color.primary }]} />
          <View style={[styles.scanLine, { backgroundColor: color.primary }]} />
        </View>
        <ScanLine color="#ffffff70" size={54} />
        <Text style={styles.instruction}>Mijozning QR kodini ramka ichiga joylashtiring</Text>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.cameraIcon}><Camera color={color.primary} size={23} /></View>
        <Text style={[styles.sheetTitle, { color: color.text }]}>Mijoz kodini kutmoqda</Text>
        <Text style={[styles.sheetText, { color: color.textSecondary }]}>Kod o‘qilgach, mijoz ma’lumotlari shu yerda tekshiriladi.</Text>
        <Text style={[styles.sheetText, { color: color.textSecondary }]}>QR kod topilmasa, kamerani ramkaga yaqinroq tuting.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 58, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#ffffff16', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  scannerArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 90 },
  scannerFrame: { width: 260, height: 260, marginBottom: 24, position: 'relative' },
  corner: { position: 'absolute', width: 35, height: 35, borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  scanLine: { height: 2, position: 'absolute', left: 12, right: 12, top: 127 },
  instruction: { color: '#D1D5DB', fontSize: 14, textAlign: 'center', marginTop: 20, paddingHorizontal: 45 },
  bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 25, alignItems: 'center' },
  cameraIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '800', marginBottom: 7 },
  sheetText: { fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 18 },
  demoButton: { width: '100%', padding: 16, borderRadius: 14, alignItems: 'center' },
  demoButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  permissionTitle: { fontSize: 22, fontWeight: '800', marginTop: 18, marginBottom: 8, textAlign: 'center' },
  permissionText: { fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 320 },
  permissionButton: { minHeight: 52, paddingHorizontal: 22, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24 },
  permissionButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  backText: { marginTop: 20, fontSize: 14, fontWeight: '600' },
});
