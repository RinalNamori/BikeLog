import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useMotorcycleStore, useLogsStore, usePartsStore, useTaxStore } from '../../src/store';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { COLORS } from '../../src/theme/colors';
import { usePdfExport } from '../../src/hooks/usePdfExport';
import { formatCurrency, computeYtdTotal } from '../../src/utils/costCalculations';

export default function ExportScreen() {
  const router = useRouter();
  const activeBike = useMotorcycleStore(s => s.getActive());
  const { logs } = useLogsStore();
  const { parts } = usePartsStore();
  const { records: taxRecords } = useTaxStore();
  const { exportPdf, isGenerating, error } = usePdfExport();

  const handleExport = () => {
    if (!activeBike) return;
    exportPdf({ motorcycle: activeBike, logs, parts, taxRecords });
  };

  const ytd = computeYtdTotal(logs);
  const total = logs.reduce((s, l) => s + l.cost, 0);

  return (
    <ScreenWrapper>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Export PDF" titleStyle={styles.title} />
      </Appbar.Header>

      <View style={styles.preview}>
        <Text variant="titleLarge" style={styles.bikeName}>{activeBike?.name ?? 'No bike selected'}</Text>
        <Text style={styles.meta}>{activeBike?.year} {activeBike?.make} {activeBike?.model}</Text>
        <Text style={styles.meta}>{activeBike?.currentMiles.toLocaleString()} km</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Entries</Text>
            <Text style={styles.summaryValue}>{logs.length}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>YTD Cost</Text>
            <Text style={styles.summaryValue}>{formatCurrency(ytd)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Lifetime</Text>
            <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Parts</Text>
            <Text style={styles.summaryValue}>{parts.length}</Text>
          </View>
        </View>

        <Text style={styles.includes}>PDF includes: maintenance history, parts status, tax records, cost summary</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          mode="contained"
          icon={isGenerating ? undefined : 'file-pdf-box'}
          onPress={handleExport}
          disabled={isGenerating || !activeBike}
          style={styles.exportBtn}
          buttonColor={COLORS.ACCENT}
        >
          {isGenerating ? <ActivityIndicator color={COLORS.WHITE} size="small" /> : 'Generate & Share PDF'}
        </Button>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.BACKGROUND, elevation: 0 },
  title: { color: COLORS.ON_SURFACE },
  preview: { padding: 20, gap: 8 },
  bikeName: { color: COLORS.ON_SURFACE, fontWeight: 'bold' },
  meta: { color: COLORS.ON_SURFACE_MUTED },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 },
  summaryBox: { flex: 1, minWidth: 100, backgroundColor: COLORS.SURFACE, padding: 12, borderRadius: 8 },
  summaryLabel: { color: COLORS.ON_SURFACE_MUTED, fontSize: 11 },
  summaryValue: { color: COLORS.ACCENT, fontWeight: 'bold', fontSize: 18, marginTop: 2 },
  includes: { color: COLORS.ON_SURFACE_MUTED, fontSize: 12, fontStyle: 'italic', marginBottom: 8 },
  error: { color: COLORS.OVERDUE_RED },
  exportBtn: { borderRadius: 8, marginTop: 8 },
});
