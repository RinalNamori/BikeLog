import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from '../src/db/database';
import { useMotorcycleStore } from '../src/store';
import { paperTheme } from '../src/theme/paperTheme';
import { useNotifications } from '../src/hooks/useNotifications';
import { COLORS } from '../src/theme/colors';

function AppInitializer({ children }: { children: React.ReactNode }) {
  useNotifications();
  return <>{children}</>;
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const loadMotorcycles = useMotorcycleStore(s => s.load);

  useEffect(() => {
    initializeDatabase()
      .then(() => loadMotorcycles())
      .then(() => setDbReady(true))
      .catch(console.error);
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.BACKGROUND, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.ACCENT} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AppInitializer>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.BACKGROUND } }} />
          </AppInitializer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
