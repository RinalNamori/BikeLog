import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Alert } from 'react-native';
import {
  Appbar, FAB, Portal, Modal, TextInput, Button, Text, Card, Chip
} from 'react-native-paper';
import { useMotorcycleStore, useTaxStore } from '../../src/store';
import { EmptyState } from '../../src/components/common/EmptyState';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { COLORS } from '../../src/theme/colors';
import { formatCurrency } from '../../src/utils/costCalculations';
import { scheduleTaxNotification, cancelNotification } from '../../src/utils/notificationScheduler';
import type { TaxRecord } from '../../src/types/models';

function TaxModal({ visible, record, motorcycleId, bikeName, onDismiss }: {
  visible: boolean;
  record: TaxRecord | null;
  motorcycleId: number;
  bikeName: string;
  onDismiss: () => void;
}) {
  const addRecord = useTaxStore(s => s.add);
  const updateRecord = useTaxStore(s => s.update);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setYear(record.year.toString());
      setAmount(record.amount.toString());
      setDueDate(record.dueDate);
    } else {
      setYear(new Date().getFullYear().toString());
      setAmount('');
      setDueDate(`${new Date().getFullYear()}-04-30`);
    }
  }, [record, visible]);

  const handleSave = async () => {
    if (!amount || !dueDate) return;
    setSaving(true);
    try {
      if (record) {
        if (record.notificationId) await cancelNotification(record.notificationId);
        const tempRecord: TaxRecord = { ...record, year: Number(year), amount: Number(amount), dueDate, notificationId: null };
        const notifId = await scheduleTaxNotification(tempRecord, bikeName);
        await updateRecord(record.id, { year: Number(year), amount: Number(amount), dueDate, notificationId: notifId });
      } else {
        const tempRecord = { motorcycleId, year: Number(year), amount: Number(amount), dueDate, paid: false, paidDate: null, notificationId: null } as TaxRecord;
        const notifId = await scheduleTaxNotification(tempRecord, bikeName);
        await addRecord({ ...tempRecord, notificationId: notifId });
      }
      onDismiss();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text variant="titleLarge" style={styles.modalTitle}>{record ? 'Edit Tax Record' : 'Add Tax Record'}</Text>
        <TextInput label="Year" value={year} onChangeText={setYear} keyboardType="numeric" style={styles.input} />
        <TextInput label="Amount (¥)" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} />
        <TextInput label="Due Date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} style={styles.input} />
        <Button mode="contained" onPress={handleSave} disabled={saving} buttonColor={COLORS.ACCENT} style={styles.saveBtn}>
          {record ? 'Update' : 'Add'}
        </Button>
      </Modal>
    </Portal>
  );
}

function TaxCard({ record, onEdit, onPaid, onDelete }: {
  record: TaxRecord;
  onEdit: () => void;
  onPaid: () => void;
  onDelete: () => void;
}) {
  const daysLeft = Math.ceil((new Date(record.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const urgent = !record.paid && daysLeft <= 30;

  return (
    <Card style={[styles.card, urgent && styles.cardUrgent]} onPress={onEdit} mode="elevated">
      <Card.Content>
        <View style={styles.taxRow}>
          <View>
            <Text variant="titleMedium" style={styles.taxYear}>{record.year} Vehicle Tax</Text>
            <Text variant="bodySmall" style={styles.muted}>Due: {record.dueDate}</Text>
            {!record.paid && (
              <Text variant="bodySmall" style={{ color: urgent ? COLORS.OVERDUE_RED : COLORS.ON_SURFACE_MUTED }}>
                {daysLeft > 0 ? `${daysLeft} days remaining` : 'PAST DUE'}
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Text variant="titleMedium" style={styles.amount}>{formatCurrency(record.amount)}</Text>
            <Chip
              compact
              selected={record.paid}
              onPress={!record.paid ? onPaid : undefined}
              style={{ backgroundColor: record.paid ? COLORS.OK_GREEN + '33' : COLORS.WARNING_AMBER + '33' }}
              textStyle={{ color: record.paid ? COLORS.OK_GREEN : COLORS.WARNING_AMBER, fontSize: 11 }}
            >
              {record.paid ? 'Paid' : 'Unpaid'}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function TaxScreen() {
  const activeMotorcycle = useMotorcycleStore(s => s.getActive());
  const { records, isLoading, load, markPaid, remove } = useTaxStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TaxRecord | null>(null);

  useEffect(() => {
    if (activeMotorcycle) load(activeMotorcycle.id);
  }, [activeMotorcycle?.id]);

  const totalUnpaid = records.filter(r => !r.paid).reduce((s, r) => s + r.amount, 0);

  return (
    <ScreenWrapper scroll={false} padding={false}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Vehicle Tax" titleStyle={styles.title} />
      </Appbar.Header>

      {records.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>Unpaid: {formatCurrency(totalUnpaid)}</Text>
        </View>
      )}

      <FlatList
        data={records}
        keyExtractor={r => r.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={() => activeMotorcycle && load(activeMotorcycle.id)}
        renderItem={({ item }) => (
          <TaxCard
            record={item}
            onEdit={() => { setSelectedRecord(item); setModalVisible(true); }}
            onPaid={() => markPaid(item.id)}
            onDelete={() => {
              Alert.alert('Delete Record', 'Remove this tax record?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }
              ]);
            }}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="receipt" title="No tax records" subtitle="Tap + to add your annual vehicle tax" />
        }
      />

      {activeMotorcycle && (
        <TaxModal
          visible={modalVisible}
          record={selectedRecord}
          motorcycleId={activeMotorcycle.id}
          bikeName={activeMotorcycle.name}
          onDismiss={() => { setModalVisible(false); setSelectedRecord(null); }}
        />
      )}

      <FAB icon="plus" style={styles.fab} onPress={() => { setSelectedRecord(null); setModalVisible(true); }} color={COLORS.WHITE} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.BACKGROUND, elevation: 0 },
  title: { color: COLORS.ON_SURFACE, fontWeight: 'bold' },
  summaryBar: { backgroundColor: COLORS.SURFACE_VARIANT, padding: 12, paddingHorizontal: 16 },
  summaryText: { color: COLORS.WARNING_AMBER, fontWeight: 'bold' },
  list: { padding: 12, paddingBottom: 80 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: COLORS.ACCENT },
  modal: { backgroundColor: COLORS.SURFACE, margin: 20, padding: 20, borderRadius: 12, gap: 8 },
  modalTitle: { color: COLORS.ON_SURFACE, fontWeight: 'bold', marginBottom: 4 },
  input: { backgroundColor: COLORS.SURFACE_VARIANT },
  saveBtn: { marginTop: 8, borderRadius: 8 },
  card: { marginBottom: 8, backgroundColor: COLORS.SURFACE },
  cardUrgent: { borderLeftWidth: 3, borderLeftColor: COLORS.OVERDUE_RED },
  taxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  taxYear: { color: COLORS.ON_SURFACE, fontWeight: '600' },
  muted: { color: COLORS.ON_SURFACE_MUTED },
  amount: { color: COLORS.ACCENT, fontWeight: 'bold' },
});
