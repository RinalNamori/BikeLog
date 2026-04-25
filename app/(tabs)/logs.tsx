import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, FAB, Appbar, Chip } from 'react-native-paper';
import { ScrollView as RNScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useMotorcycleStore, useLogsStore } from '../../src/store';
import { MaintenanceCard } from '../../src/components/logs/MaintenanceCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { COLORS } from '../../src/theme/colors';
import type { MaintenanceType } from '../../src/types/models';
import { MAINTENANCE_TYPE_LABELS } from '../../src/types/models';

const FILTER_TYPES: Array<MaintenanceType | null> = [null, 'oil', 'tire', 'chain', 'brake', 'filter', 'battery', 'repair', 'inspection', 'other'];

export default function LogsScreen() {
  const router = useRouter();
  const activeId = useMotorcycleStore(s => s.activeMotorcycleId);
  const { logs, isLoading, filterType, load, setFilterType } = useLogsStore();

  useEffect(() => {
    if (activeId) load(activeId);
  }, [activeId]);

  const filtered = filterType ? logs.filter(l => l.type === filterType) : logs;

  return (
    <ScreenWrapper scroll={false} padding={false}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Maintenance History" titleStyle={styles.title} />
      </Appbar.Header>

      <View style={styles.filterRow}>
        <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTER_TYPES.map(type => (
            <Chip
              key={type ?? 'all'}
              selected={filterType === type}
              onPress={() => setFilterType(type)}
              style={[styles.chip, filterType === type && styles.chipActive]}
              textStyle={{ fontSize: 12 }}
            >
              {type ? MAINTENANCE_TYPE_LABELS[type] : 'All'}
            </Chip>
          ))}
        </RNScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={() => activeId && load(activeId)}
        renderItem={({ item }) => (
          <MaintenanceCard log={item} onPress={() => router.push(`/log/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState icon="wrench" title="No entries yet" subtitle="Tap + to log your first maintenance" />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/log/new')}
        color={COLORS.WHITE}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.BACKGROUND, elevation: 0 },
  title: { color: COLORS.ON_SURFACE, fontWeight: 'bold' },
  filterRow: { borderBottomWidth: 1, borderBottomColor: COLORS.OUTLINE },
  chips: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip: { backgroundColor: COLORS.SURFACE_VARIANT },
  chipActive: { backgroundColor: COLORS.ACCENT },
  list: { padding: 12, paddingBottom: 80 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: COLORS.ACCENT },
});
