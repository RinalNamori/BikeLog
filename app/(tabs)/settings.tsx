import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, List, Divider, Button, Portal, Modal, TextInput, Text, RadioButton, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useMotorcycleStore } from '../../src/store';
import { ScreenWrapper } from '../../src/components/common/ScreenWrapper';
import { COLORS } from '../../src/theme/colors';
import type { Motorcycle } from '../../src/types/models';

function AddBikeModal({ visible, bike, onDismiss }: {
  visible: boolean;
  bike: Motorcycle | null;
  onDismiss: () => void;
}) {
  const addBike = useMotorcycleStore(s => s.add);
  const updateBike = useMotorcycleStore(s => s.update);
  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [miles, setMiles] = useState('0');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (bike) {
      setName(bike.name); setMake(bike.make); setModel(bike.model);
      setYear(bike.year.toString()); setMiles(bike.currentMiles.toString());
    } else {
      setName(''); setMake(''); setModel('');
      setYear(new Date().getFullYear().toString()); setMiles('0');
    }
  }, [bike, visible]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (bike) {
        await updateBike(bike.id, {
          name: name.trim(), make: make.trim(), model: model.trim(),
          year: Number(year), currentMiles: Number(miles),
        });
      } else {
        await addBike({
          name: name.trim(), make: make.trim(), model: model.trim(),
          year: Number(year), currentMiles: Number(miles), purchaseDate: null,
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
        <Text variant="titleLarge" style={styles.modalTitle}>{bike ? 'Edit Motorcycle' : 'Add Motorcycle'}</Text>
        <TextInput label="Name (e.g. My CBR)" value={name} onChangeText={setName} style={styles.input} />
        <TextInput label="Make" value={make} onChangeText={setMake} style={styles.input} />
        <TextInput label="Model" value={model} onChangeText={setModel} style={styles.input} />
        <TextInput label="Year" value={year} onChangeText={setYear} keyboardType="numeric" style={styles.input} />
        <TextInput label="Current Odometer (km)" value={miles} onChangeText={setMiles} keyboardType="numeric" style={styles.input} />
        <Button mode="contained" onPress={handleSave} disabled={saving} buttonColor={COLORS.ACCENT} style={styles.saveBtn}>
          {bike ? 'Update' : 'Add Motorcycle'}
        </Button>
      </Modal>
    </Portal>
  );
}

export default function SettingsScreen() {
  const { motorcycles, activeMotorcycleId, setActive, remove } = useMotorcycleStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBike, setSelectedBike] = useState<Motorcycle | null>(null);

  const handleDelete = (bike: Motorcycle) => {
    Alert.alert('Delete Motorcycle', `Remove "${bike.name}" and ALL its data?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(bike.id) }
    ]);
  };

  return (
    <ScreenWrapper>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Settings" titleStyle={styles.title} />
      </Appbar.Header>

      <List.Section>
        <List.Subheader style={styles.subheader}>My Motorcycles</List.Subheader>
        {motorcycles.map(bike => (
          <View key={bike.id}>
            <List.Item
              title={bike.name}
              description={`${bike.year} ${bike.make} ${bike.model} · ${bike.currentMiles.toLocaleString()} km`}
              titleStyle={{ color: COLORS.ON_SURFACE }}
              descriptionStyle={{ color: COLORS.ON_SURFACE_MUTED }}
              left={() => (
                <RadioButton
                  value={bike.id.toString()}
                  status={activeMotorcycleId === bike.id ? 'checked' : 'unchecked'}
                  onPress={() => setActive(bike.id)}
                  color={COLORS.ACCENT}
                />
              )}
              right={() => (
                <View style={styles.rowActions}>
                  <IconButton
                    icon="pencil" iconColor={COLORS.INFO_BLUE} size={20}
                    onPress={() => { setSelectedBike(bike); setModalVisible(true); }} />
                  <IconButton
                    icon="delete" iconColor={COLORS.OVERDUE_RED} size={20}
                    onPress={() => handleDelete(bike)} />
                </View>
              )}
            />
            <Divider style={{ backgroundColor: COLORS.OUTLINE }} />
          </View>
        ))}
        <Button
          mode="outlined"
          icon="plus"
          onPress={() => { setSelectedBike(null); setModalVisible(true); }}
          style={styles.addBtn}
          textColor={COLORS.ACCENT}
        >
          Add Motorcycle
        </Button>
      </List.Section>

      <AddBikeModal
        visible={modalVisible}
        bike={selectedBike}
        onDismiss={() => { setModalVisible(false); setSelectedBike(null); }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.BACKGROUND, elevation: 0 },
  title: { color: COLORS.ON_SURFACE, fontWeight: 'bold' },
  subheader: { color: COLORS.ACCENT },
  rowActions: { flexDirection: 'row', alignItems: 'center' },
  addBtn: { margin: 16, borderColor: COLORS.ACCENT },
  modal: { backgroundColor: COLORS.SURFACE, margin: 20, padding: 20, borderRadius: 12, gap: 8 },
  modalTitle: { color: COLORS.ON_SURFACE, fontWeight: 'bold', marginBottom: 4 },
  input: { backgroundColor: COLORS.SURFACE_VARIANT },
  saveBtn: { marginTop: 8, borderRadius: 8 },
});
