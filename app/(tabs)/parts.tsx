import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Alert, View } from 'react-native';
import {
  Appbar, FAB, Portal, Modal, TextInput, Button, Text, Switch
} from 'react-native-paper';
import { useMotorcycleStore, usePartsStore } from '../../src/store';
import { PartCard } from '../../src/components/parts/PartCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { COLORS } from '../../src/theme/colors';
import type { Part } from '../../src/types/models';

function PartModal({ visible, part, motorcycleId, onDismiss }: {
  visible: boolean;
  part: Part | null;
  motorcycleId: number;
  onDismiss: () => void;
}) {
  const addPart = usePartsStore(s => s.add);
  const updatePart = usePartsStore(s => s.update);
  const [name, setName] = useState('');
  const [interval, setInterval] = useState('3000');
  const [lastMiles, setLastMiles] = useState('0');
  const [cost, setCost] = useState('0');
  const [notif, setNotif] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (part) {
      setName(part.name);
      setInterval(part.changeIntervalMiles.toString());
      setLastMiles(part.lastChangedMiles.toString());
      setCost(part.estimatedCost.toString());
      setNotif(part.notificationEnabled);
    } else {
      setName(''); setInterval('3000'); setLastMiles('0'); setCost('0'); setNotif(true);
    }
  }, [part, visible]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (part) {
        await updatePart(part.id, {
          name: name.trim(),
          changeIntervalMiles: Number(interval),
          lastChangedMiles: Number(lastMiles),
          estimatedCost: Number(cost),
          notificationEnabled: notif,
        });
      } else {
        await addPart({
          motorcycleId,
          name: name.trim(),
          changeIntervalMiles: Number(interval),
          lastChangedMiles: Number(lastMiles),
          lastChangedDate: null,
          estimatedCost: Number(cost),
          notificationEnabled: notif,
        });
      }
      onDismiss();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text variant="titleLarge" style={styles.modalTitle}>{part ? 'Edit Part' : 'Add Part'}</Text>
        <TextInput label="Part Name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput label="Change Interval (km)" value={interval} onChangeText={setInterval} keyboardType="numeric" style={styles.input} />
        <TextInput label="Last Changed (km)" value={lastMiles} onChangeText={setLastMiles} keyboardType="numeric" style={styles.input} />
        <TextInput label="Est. Cost (¥)" value={cost} onChangeText={setCost} keyboardType="numeric" style={styles.input} />
        <View style={styles.switchRow}>
          <Text style={{ color: COLORS.ON_SURFACE }}>Enable Notifications</Text>
          <Switch value={notif} onValueChange={setNotif} color={COLORS.ACCENT} />
        </View>
        <Button mode="contained" onPress={handleSave} disabled={saving} buttonColor={COLORS.ACCENT} style={styles.saveBtn}>
          {part ? 'Update' : 'Add'}
        </Button>
      </Modal>
    </Portal>
  );
}

export default function PartsScreen() {
  const activeMotorcycle = useMotorcycleStore(s => s.getActive());
  const { parts, isLoading, load, remove } = usePartsStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  useEffect(() => {
    if (activeMotorcycle) load(activeMotorcycle.id);
  }, [activeMotorcycle?.id]);

  const handleDelete = (part: Part) => {
    Alert.alert('Remove Part', `Remove "${part.name}" tracker?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(part.id) }
    ]);
  };

  return (
    <ScreenWrapper scroll={false} padding={false}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Parts Tracker" titleStyle={styles.title} />
      </Appbar.Header>

      <FlatList
        data={parts}
        keyExtractor={p => p.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={() => activeMotorcycle && load(activeMotorcycle.id)}
        renderItem={({ item }) => (
          <PartCard
            part={item}
            currentMiles={activeMotorcycle?.currentMiles ?? 0}
            onPress={() => { setSelectedPart(item); setModalVisible(true); }}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="cog" title="No parts tracked" subtitle="Tap + to add parts and track change cycles" />
        }
      />

      {activeMotorcycle && (
        <PartModal
          visible={modalVisible}
          part={selectedPart}
          motorcycleId={activeMotorcycle.id}
          onDismiss={() => { setModalVisible(false); setSelectedPart(null); }}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => { setSelectedPart(null); setModalVisible(true); }}
        color={COLORS.WHITE}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.BACKGROUND, elevation: 0 },
  title: { color: COLORS.ON_SURFACE, fontWeight: 'bold' },
  list: { padding: 12, paddingBottom: 80 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: COLORS.ACCENT },
  modal: { backgroundColor: COLORS.SURFACE, margin: 20, padding: 20, borderRadius: 12, gap: 8 },
  modalTitle: { color: COLORS.ON_SURFACE, fontWeight: 'bold', marginBottom: 4 },
  input: { backgroundColor: COLORS.SURFACE_VARIANT },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  saveBtn: { marginTop: 8, borderRadius: 8 },
});
