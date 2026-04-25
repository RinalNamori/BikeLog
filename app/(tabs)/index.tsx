import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Appbar, Text, Card, Surface, FAB, Chip, Button, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useMotorcycleStore, useLogsStore, usePartsStore, useTaxStore } from '../../src/store';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { EmptyState } from '../../src/components/common/EmptyState';
import { COLORS } from '../../src/theme/colors';
import { formatCurrency, computeYtdTotal } from '../../src/utils/costCalculations';
import { getPartStatusColor } from '../../src/utils/mileageUtils';
import { useState } from 'react';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Surface style={[styles.statCard, isTablet && styles.statCardTablet]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </Surface>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { motorcycles, activeMotorcycleId, setActive, getActive } = useMotorcycleStore();
  const { logs, load: loadLogs } = useLogsStore();
  const { parts, load: loadParts } = usePartsStore();
  const { records: taxRecords, load: loadTax } = useTaxStore();
  const [menuVisible, setMenuVisible] = useState(false);

  const activeBike = getActive();

  useEffect(() => {
    if (activeMotorcycleId) {
      loadLogs(activeMotorcycleId);
      loadParts(activeMotorcycleId);
      loadTax(activeMotorcycleId);
    }
  }, [activeMotorcycleId]);

  const ytdCost = useMemo(() => computeYtdTotal(logs), [logs]);
  const totalCost = useMemo(() => logs.reduce((s, l) => s + l.cost, 0), [logs]);
  const lastLog = logs[0];

  const urgentParts = useMemo(() =>
    parts.filter(p => {
      const pct = (activeBike ? activeBike.currentMiles - p.lastChangedMiles : 0) / p.changeIntervalMiles;
      return pct >= 0.85;
    }),
    [parts, activeBike]
  );

  const upcomingTax = useMemo(() =>
    taxRecords.filter(t => {
      if (t.paid) return false;
      const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 60;
    }),
    [taxRecords]
  );

  const alertCount = urgentParts.length + upcomingTax.length;

  if (motorcycles.length === 0) {
    return (
      <ScreenWrapper>
        <Appbar.Header style={styles.header}>
          <Appbar.Content title="BikeLog" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        <EmptyState
          icon="motorbike"
          title="No motorcycles yet"
          subtitle="Go to Settings to add your first motorcycle"
        />
        <Button
          mode="contained"
          icon="plus"
          onPress={() => router.push('/(tabs)/settings')}
          style={{ margin: 24 }}
          buttonColor={COLORS.ACCENT}
        >
          Add Motorcycle
        </Button>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="BikeLog" titleStyle={styles.headerTitle} />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="motorbike"
              onPress={() => setMenuVisible(true)}
              color={COLORS.ACCENT}
            />
          }
        >
          {motorcycles.map(bike => (
            <Menu.Item
              key={bike.id}
              onPress={() => { setActive(bike.id); setMenuVisible(false); }}
              title={bike.name}
              leadingIcon={activeMotorcycleId === bike.id ? 'check' : undefined}
            />
          ))}
        </Menu>
        <Appbar.Action icon="cog" onPress={() => router.push('/(tabs)/settings')} color={COLORS.ON_SURFACE_MUTED} />
      </Appbar.Header>

      {activeBike && (
        <View style={styles.bikeHeader}>
          <Text variant="headlineSmall" style={styles.bikeName}>{activeBike.name}</Text>
          <Text style={styles.bikeSub}>{activeBike.year} {activeBike.make} {activeBike.model}</Text>
          <Text style={styles.bikeOdo}>{activeBike.currentMiles.toLocaleString()} km</Text>
        </View>
      )}

      <View style={[styles.statsRow, isTablet && styles.statsRowTablet]}>
        <StatCard label="YTD Cost" value={formatCurrency(ytdCost)} sub={new Date().getFullYear().toString()} />
        <StatCard label="Lifetime" value={formatCurrency(totalCost)} sub={`${logs.length} entries`} />
        <StatCard label="Alerts" value={alertCount.toString()} sub="parts + tax" />
        <StatCard label="Last Service" value={lastLog ? lastLog.date.slice(5) : '—'} sub={lastLog?.type ?? ''} />
      </View>

      {urgentParts.length > 0 && (
        <Card style={styles.alertCard} onPress={() => router.push('/(tabs)/parts')}>
          <Card.Title title="Parts Due Soon" titleStyle={styles.alertTitle} />
          <Card.Content style={{ gap: 6 }}>
            {urgentParts.slice(0, 3).map(part => {
              const pct = activeBike ? (activeBike.currentMiles - part.lastChangedMiles) / part.changeIntervalMiles : 0;
              const color = getPartStatusColor(pct);
              return (
                <View key={part.id} style={styles.alertRow}>
                  <Text style={styles.alertPartName}>{part.name}</Text>
                  <Chip compact style={{ backgroundColor: color + '33' }} textStyle={{ color, fontSize: 11 }}>
                    {pct >= 1 ? 'OVERDUE' : `${Math.round(pct * 100)}%`}
                  </Chip>
                </View>
              );
            })}
          </Card.Content>
        </Card>
      )}

      {upcomingTax.length > 0 && (
        <Card style={styles.alertCard} onPress={() => router.push('/(tabs)/tax')}>
          <Card.Title title="Tax Due Soon" titleStyle={styles.alertTitle} />
          <Card.Content style={{ gap: 4 }}>
            {upcomingTax.slice(0, 2).map(t => (
              <View key={t.id} style={styles.alertRow}>
                <Text style={styles.alertPartName}>Vehicle Tax {t.year}</Text>
                <Text style={{ color: COLORS.WARNING_AMBER, fontWeight: 'bold' }}>{formatCurrency(t.amount)}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {logs.length === 0 && (
        <EmptyState icon="wrench" title="No logs yet" subtitle="Tap + to log your first maintenance" />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/log/new')}
        color={COLORS.WHITE}
        label="New Log"
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.BACKGROUND, elevation: 0 },
  headerTitle: { color: COLORS.ACCENT, fontWeight: 'bold', fontSize: 22 },
  bikeHeader: { paddingHorizontal: 16, paddingBottom: 12 },
  bikeName: { color: COLORS.ON_SURFACE, fontWeight: 'bold' },
  bikeSub: { color: COLORS.ON_SURFACE_MUTED, fontSize: 13 },
  bikeOdo: { color: COLORS.ACCENT, fontWeight: 'bold', fontSize: 16, marginTop: 2 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 12 },
  statsRowTablet: { flexWrap: 'nowrap' },
  statCard: {
    width: isTablet ? undefined : (width - 32 - 8) / 2,
    flex: isTablet ? 1 : undefined,
    padding: 14,
    borderRadius: 10,
    backgroundColor: COLORS.SURFACE,
    elevation: 2,
  },
  statCardTablet: {
    flex: 1,
    width: undefined,
  },
  statLabel: { fontSize: 11, color: COLORS.ON_SURFACE_MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.ACCENT, marginTop: 2 },
  statSub: { fontSize: 11, color: COLORS.ON_SURFACE_MUTED, marginTop: 1 },
  alertCard: { marginHorizontal: 12, marginBottom: 10, backgroundColor: COLORS.SURFACE },
  alertTitle: { color: COLORS.ON_SURFACE, fontWeight: 'bold' },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertPartName: { color: COLORS.ON_SURFACE, flex: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: COLORS.ACCENT },
});
