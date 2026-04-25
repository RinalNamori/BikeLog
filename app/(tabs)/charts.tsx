import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { Appbar, Text, Card, Surface } from 'react-native-paper';
import { useMotorcycleStore, useLogsStore } from '../../src/store';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { EmptyState } from '../../src/components/common/EmptyState';
import { COLORS } from '../../src/theme/colors';
import { computeCostSummary, formatCurrency } from '../../src/utils/costCalculations';
import { MAINTENANCE_TYPE_LABELS } from '../../src/types/models';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;

function BarChart({ data, maxValue }: { data: Array<{ label: string; value: number }>; maxValue: number }) {
  if (data.length === 0) return null;
  const barWidth = Math.floor((CHART_WIDTH - 40) / data.length) - 4;

  return (
    <View style={barStyles.container}>
      {data.map((item, i) => {
        const height = maxValue > 0 ? Math.max((item.value / maxValue) * 120, 2) : 2;
        return (
          <View key={i} style={[barStyles.barCol, { width: barWidth }]}>
            <Text style={barStyles.value} numberOfLines={1}>
              {item.value > 0 ? `¥${Math.round(item.value / 1000)}k` : ''}
            </Text>
            <View style={[barStyles.bar, { height, backgroundColor: COLORS.ACCENT }]} />
            <Text style={barStyles.label} numberOfLines={1}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', paddingVertical: 8, gap: 4, minHeight: 160 },
  barCol: { alignItems: 'center', gap: 2 },
  bar: { borderRadius: 3, minHeight: 2 },
  value: { fontSize: 9, color: COLORS.ON_SURFACE_MUTED, textAlign: 'center' },
  label: { fontSize: 9, color: COLORS.ON_SURFACE_MUTED, textAlign: 'center', marginTop: 2 },
});

function PieChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const PIE_COLORS = [COLORS.ACCENT, '#0f3460', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#f44336', '#795548', '#607d8b'];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <View style={pieStyles.container}>
      {data.map((item, i) => (
        <View key={i} style={pieStyles.row}>
          <View style={[pieStyles.dot, { backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }]} />
          <Text style={pieStyles.label} numberOfLines={1}>{(MAINTENANCE_TYPE_LABELS as Record<string,string>)[item.label] ?? item.label}</Text>
          <Text style={pieStyles.pct}>
            {total > 0 ? `${Math.round((item.value / total) * 100)}%` : '0%'}
          </Text>
          <Text style={pieStyles.val}>{formatCurrency(item.value)}</Text>
        </View>
      ))}
    </View>
  );
}

const pieStyles = StyleSheet.create({
  container: { gap: 8, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  label: { flex: 1, color: COLORS.ON_SURFACE, fontSize: 13 },
  pct: { color: COLORS.ON_SURFACE_MUTED, fontSize: 12, width: 36, textAlign: 'right' },
  val: { color: COLORS.ACCENT, fontWeight: 'bold', fontSize: 12, width: 72, textAlign: 'right' },
});

export default function ChartsScreen() {
  const activeMotorcycle = useMotorcycleStore(s => s.getActive());
  const { logs, load } = useLogsStore();

  useEffect(() => {
    if (activeMotorcycle) load(activeMotorcycle.id);
  }, [activeMotorcycle?.id]);

  const summary = useMemo(() => computeCostSummary(logs), [logs]);

  const monthlyData = useMemo(() => {
    const last12 = summary.byMonth.slice(-12);
    return last12.map(m => ({
      label: m.month.slice(5),
      value: m.total,
    }));
  }, [summary]);

  const maxMonthly = useMemo(() => Math.max(...monthlyData.map(d => d.value), 1), [monthlyData]);

  const categoryData = useMemo(() =>
    Object.entries(summary.byCategory)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([k, v]) => ({ label: k, value: v, color: COLORS.ACCENT })),
    [summary]
  );

  if (logs.length === 0) {
    return (
      <ScreenWrapper>
        <Appbar.Header style={styles.header}>
          <Appbar.Content title="Charts" titleStyle={styles.title} />
        </Appbar.Header>
        <EmptyState icon="chart-bar" title="No data yet" subtitle="Add maintenance logs to see visualizations" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Charts" titleStyle={styles.title} />
      </Appbar.Header>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.cardTitle}>Monthly Costs (last 12 months)</Text>
          {monthlyData.length > 0
            ? <BarChart data={monthlyData} maxValue={maxMonthly} />
            : <Text style={styles.muted}>No monthly data</Text>
          }
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.cardTitle}>Cost by Category</Text>
          {categoryData.length > 0
            ? <PieChart data={categoryData} />
            : <Text style={styles.muted}>No category data</Text>
          }
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.cardTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            <Surface style={styles.statBox}>
              <Text style={styles.statLabel}>Total Lifetime</Text>
              <Text style={styles.statValue}>{formatCurrency(summary.total)}</Text>
            </Surface>
            <Surface style={styles.statBox}>
              <Text style={styles.statLabel}>Entries</Text>
              <Text style={styles.statValue}>{logs.length}</Text>
            </Surface>
            <Surface style={styles.statBox}>
              <Text style={styles.statLabel}>Avg / Entry</Text>
              <Text style={styles.statValue}>{formatCurrency(logs.length > 0 ? summary.total / logs.length : 0)}</Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.BACKGROUND, elevation: 0 },
  title: { color: COLORS.ON_SURFACE, fontWeight: 'bold' },
  card: { marginBottom: 12, backgroundColor: COLORS.SURFACE },
  cardTitle: { color: COLORS.ON_SURFACE, fontWeight: 'bold', marginBottom: 8 },
  muted: { color: COLORS.ON_SURFACE_MUTED, fontStyle: 'italic' },
  summaryGrid: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statBox: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: COLORS.SURFACE_VARIANT, alignItems: 'center' },
  statLabel: { fontSize: 11, color: COLORS.ON_SURFACE_MUTED, textAlign: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.ACCENT, marginTop: 4 },
});
