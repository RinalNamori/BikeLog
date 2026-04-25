import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Appbar, TextInput, Button, SegmentedButtons, Text, HelperText, ActivityIndicator
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMotorcycleStore, useLogsStore } from '../../src/store';
import { usePartsStore } from '../../src/store';
import { COLORS } from '../../src/theme/colors';
import { MAINTENANCE_TYPE_LABELS } from '../../src/types/models';
import type { MaintenanceType } from '../../src/types/models';
import { computeAvgDailyMiles } from '../../src/utils/mileageUtils';
import { schedulePartNotification } from '../../src/utils/notificationScheduler';

const LOG_TYPES: MaintenanceType[] = ['oil', 'tire', 'chain', 'brake', 'filter', 'battery', 'repair', 'inspection', 'other'];

export default function NewLogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; miles?: string; cost?: string; description?: string }>();

  const activeMotorcycle = useMotorcycleStore(s => s.getActive());
  const addLog = useLogsStore(s => s.add);
  const { logs } = useLogsStore();
  const updateMiles = useMotorcycleStore(s => s.updateMiles);
  const { parts, load: loadParts } = usePartsStore();

  const [type, setType] = useState<MaintenanceType>((params.type as MaintenanceType) ?? 'oil');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [miles, setMiles] = useState(params.miles ?? '');
  const [description, setDescription] = useState(params.description ?? '');
  const [cost, setCost] = useState(params.cost ?? '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeMotorcycle) {
      loadParts(activeMotorcycle.id);
      if (!miles && activeMotorcycle.currentMiles > 0) {
        setMiles(activeMotorcycle.currentMiles.toString());
      }
    }
  }, [activeMotorcycle?.id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!description.trim()) e.description = 'Description is required';
    if (!miles || isNaN(Number(miles))) e.miles = 'Enter valid miles';
    if (!date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!activeMotorcycle || !validate()) return;
    setSaving(true);
    try {
      const milesNum = Number(miles);
      const costNum = Number(cost) || 0;

      await addLog({
        motorcycleId: activeMotorcycle.id,
        type,
        date,
        miles: milesNum,
        description: description.trim(),
        cost: costNum,
      });

      await updateMiles(activeMotorcycle.id, milesNum);

      const avgDaily = computeAvgDailyMiles(logs);
      for (const part of parts) {
        if (!part.notificationEnabled) continue;
        const milesSince = milesNum - part.lastChangedMiles;
        const pct = milesSince / part.changeIntervalMiles;
        if (pct >= 0.85) {
          const daysLeft = Math.max(Math.ceil((part.changeIntervalMiles - milesSince) / avgDaily), 0);
          await schedulePartNotification(part, activeMotorcycle.name, daysLeft);
        }
      }

      router.back();
    } finally {
      setSaving(false);
    }
  };

  const typeButtons = LOG_TYPES.map(t => ({ value: t, label: MAINTENANCE_TYPE_LABELS[t].split(' ')[0] }));
  const firstRow = typeButtons.slice(0, 5);
  const secondRow = typeButtons.slice(5);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="New Log Entry" titleStyle={styles.title} />
        {saving && <ActivityIndicator color={COLORS.ACCENT} style={{ marginRight: 12 }} />}
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text variant="labelLarge" style={styles.label}>Type</Text>
        <SegmentedButtons
          value={type}
          onValueChange={v => setType(v as MaintenanceType)}
          buttons={firstRow}
          style={styles.segmented}
        />
        <SegmentedButtons
          value={type}
          onValueChange={v => setType(v as MaintenanceType)}
          buttons={secondRow}
          style={[styles.segmented, { marginTop: 4 }]}
        />

        <TextInput
          label="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          style={styles.input}
          keyboardType="default"
          error={!!errors.date}
        />
        <HelperText type="error" visible={!!errors.date}>{errors.date}</HelperText>

        <TextInput
          label="Odometer (km)"
          value={miles}
          onChangeText={setMiles}
          style={styles.input}
          keyboardType="numeric"
          error={!!errors.miles}
        />
        <HelperText type="error" visible={!!errors.miles}>{errors.miles}</HelperText>

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          multiline
          numberOfLines={3}
          error={!!errors.description}
        />
        <HelperText type="error" visible={!!errors.description}>{errors.description}</HelperText>

        <TextInput
          label="Cost (¥)"
          value={cost}
          onChangeText={setCost}
          style={styles.input}
          keyboardType="numeric"
        />

        <Button
          mode="contained"
          onPress={handleSave}
          disabled={saving}
          style={styles.saveBtn}
          buttonColor={COLORS.ACCENT}
        >
          Save Entry
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.BACKGROUND, elevation: 0 },
  title: { color: COLORS.ON_SURFACE },
  scroll: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  form: { padding: 16, gap: 4, paddingBottom: 40 },
  label: { color: COLORS.ON_SURFACE_MUTED, marginBottom: 4, marginTop: 8 },
  segmented: { backgroundColor: COLORS.SURFACE },
  input: { backgroundColor: COLORS.SURFACE },
  saveBtn: { marginTop: 16, borderRadius: 8 },
});
