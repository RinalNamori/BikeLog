import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Icon } from 'react-native-paper';
import type { MaintenanceLog } from '../../types/models';
import { MAINTENANCE_TYPE_LABELS, MAINTENANCE_TYPE_ICONS } from '../../types/models';
import { formatCurrency } from '../../utils/costCalculations';
import { COLORS } from '../../theme/colors';

interface Props {
  log: MaintenanceLog;
  onPress: () => void;
}

export function MaintenanceCard({ log, onPress }: Props) {
  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={styles.left}>
          <View style={styles.iconRow}>
            <Icon source={MAINTENANCE_TYPE_ICONS[log.type]} size={20} color={COLORS.ACCENT} />
            <Chip compact style={styles.chip} textStyle={styles.chipText}>
              {MAINTENANCE_TYPE_LABELS[log.type]}
            </Chip>
          </View>
          <Text variant="bodyMedium" style={styles.desc} numberOfLines={2}>{log.description}</Text>
          <Text variant="bodySmall" style={styles.meta}>{log.date} · {log.miles.toLocaleString()} km</Text>
        </View>
        <View style={styles.right}>
          <Text variant="titleMedium" style={styles.cost}>{formatCurrency(log.cost)}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8, backgroundColor: COLORS.SURFACE },
  content: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  left: { flex: 1, gap: 4 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: { backgroundColor: COLORS.SURFACE_VARIANT, height: 24 },
  chipText: { fontSize: 11, color: COLORS.ON_SURFACE },
  desc: { color: COLORS.ON_SURFACE },
  meta: { color: COLORS.ON_SURFACE_MUTED },
  right: { marginLeft: 12, alignItems: 'flex-end' },
  cost: { color: COLORS.ACCENT, fontWeight: 'bold' },
});
