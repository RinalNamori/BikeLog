import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { COLORS } from '../../theme/colors';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'inbox', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Icon source={icon} size={56} color={COLORS.ON_SURFACE_MUTED} />
      <Text style={styles.title} variant="titleMedium">{title}</Text>
      {subtitle && <Text style={styles.subtitle} variant="bodySmall">{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 8 },
  title: { color: COLORS.ON_SURFACE_MUTED, textAlign: 'center' },
  subtitle: { color: COLORS.ON_SURFACE_MUTED, textAlign: 'center', maxWidth: 260 },
});
