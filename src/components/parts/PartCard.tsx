import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar } from 'react-native-paper';
import type { Part } from '../../types/models';
import { getPartStatusColor } from '../../utils/mileageUtils';
import { formatCurrency } from '../../utils/costCalculations';
import { COLORS } from '../../theme/colors';

interface Props {
  part: Part;
  currentMiles: number;
  onPress: () => void;
}

export function PartCard({ part, currentMiles, onPress }: Props) {
  const milesSince = currentMiles - part.lastChangedMiles;
  const percent = Math.min(milesSince / part.changeIntervalMiles, 1);
  const milesLeft = Math.max(part.changeIntervalMiles - milesSince, 0);
  const color = getPartStatusColor(percent);
  const isDue = percent >= 1;

  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleSmall" style={styles.name}>{part.name}</Text>
          <Text variant="bodySmall" style={[styles.status, { color }]}>
            {isDue ? 'OVERDUE' : `${milesLeft.toLocaleString()} km left`}
          </Text>
        </View>
        <ProgressBar progress={percent} color={color} style={styles.bar} />
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.muted}>
            Every {part.changeIntervalMiles.toLocaleString()} km
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            Est. {formatCurrency(part.estimatedCost)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8, backgroundColor: COLORS.SURFACE },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  name: { color: COLORS.ON_SURFACE, fontWeight: '600' },
  status: { fontWeight: 'bold', fontSize: 12 },
  bar: { height: 6, borderRadius: 3, backgroundColor: COLORS.OUTLINE, marginBottom: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { color: COLORS.ON_SURFACE_MUTED },
});
