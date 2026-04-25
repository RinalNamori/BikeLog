import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padding?: boolean;
}

export function ScreenWrapper({ children, scroll = true, padding = true }: Props) {
  const inner = padding
    ? <View style={styles.padded}>{children}</View>
    : children;

  if (scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {inner}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
  padded: { padding: 16 },
});
