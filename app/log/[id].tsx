import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Appbar, Text, Button, Divider, Chip } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLogsStore, useMotorcycleStore } from '../../src/store';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { COLORS } from '../../src/theme/colors';
import { MAINTENANCE_TYPE_LABELS } from '../../src/types/models';
import { formatCurrency } from '../../src/utils/costCalculations';
import type { MaintenanceLog } from '../../src/types/models';
import * as logQueries from '../../src/db/queries/logs';

export default function LogDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const remove = useLogsStore(s => s.remove);
  const activeId = useMotorcycleStore(s => s.activeMotorcycleId);
  const [log, setLog] = useState<MaintenanceLog | null>(null);

  useEffect(() => {
    logQueries.getLog(Number(id)).then(setLog);
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'Remove this maintenance log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await remove(Number(id));
          router.back();
        }
      }
    ]);
  };

  if (!log) return null;

  return (
    <ScreenWrapper>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Log Detail" titleStyle={styles.title} />
        <Appbar.Action icon="delete" onPress={handleDelete} color={COLORS.OVERDUE_RED} />
      </Appbar.Header>

      <View style={styles.body}>
        <Chip style={styles.chip}>{MAINTENANCE_TYPE_LABELS[log.type]}</Chip>

        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{log.date}</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Odometer</Text>
          <Text style={styles.value}>{log.miles.toLocaleString()} km</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Cost</Text>
          <Text style={[styles.value, styles.cost]}>{formatCurrency(log.cost)}</Text>
        </View>
        <Divider style={styles.divider} />

        <Text style={styles.label}>Description</Text>
        <Text style={[styles.value, { marginTop: 4 }]}>{log.description}</Text>

        {log.parts.length > 0 && (
          <>
            <Text style={[styles.label, { marginTop: 16 }]}>Parts</Text>
            {log.parts.map(p => (
              <View key={p.id} style={styles.row}>
                <Text style={styles.value}>{p.name} × {p.quantity}</Text>
                <Text style={styles.cost}>{formatCurrency(p.cost)}</Text>
              </View>
            ))}
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.BACKGROUND, elevation: 0 },
  title: { color: COLORS.ON_SURFACE },
  body: { padding: 16, gap: 8 },
  chip: { alignSelf: 'flex-start', backgroundColor: COLORS.SURFACE_VARIANT, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  label: { color: COLORS.ON_SURFACE_MUTED, fontSize: 13 },
  value: { color: COLORS.ON_SURFACE, fontSize: 15 },
  cost: { color: COLORS.ACCENT, fontWeight: 'bold' },
  divider: { backgroundColor: COLORS.OUTLINE },
});
