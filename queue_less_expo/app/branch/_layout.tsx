import { Stack } from 'expo-router';

export default function BranchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="map" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="booking" />
    </Stack>
  );
}
