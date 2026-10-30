import React from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { useAdditionProgressStore } from '../store/additionProgressStore';
import { useEquationsProgressStore } from '../store/equationsProgressStore';
import { ActionButton, PageHeader, SurfaceCard, ui, useTheme } from './ui';
import app from '../../app.json';

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const colors = useTheme();
  const { night, haptics, setNight, setHaptics, reset } = useSettingsStore();
  const resetProgress = () => Alert.alert('Reset progress?', 'Your saved scores and unlocked levels will be cleared. Your profile and preferences will stay.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Reset progress', style: 'destructive', onPress: () => {
      useAdditionProgressStore.getState().reset();
      useEquationsProgressStore.getState().reset();
    } },
  ]);
  return <>
    <PageHeader title="Settings" subtitle="Choose what feels comfy for you." />
    <SurfaceCard>
      {[{ label: 'Dark appearance', description: 'A softer palette for low light.', value: night, change: setNight },
        { label: 'Answer vibration', description: 'A short vibration for correct answers.', value: haptics, change: setHaptics }].map((item) =>
        <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 }}>
          <View style={{ flex: 1 }}><Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>{item.label}</Text>
            <Text style={[ui.subtitle, { color: colors.textSecondary }]}>{item.description}</Text></View>
          <Switch accessibilityLabel={item.label} value={item.value} onValueChange={item.change} trackColor={{ true: '#4F5DBC', false: colors.border }} />
        </View>)}
    </SurfaceCard>
    <ActionButton label="Restore default preferences" secondary onPress={reset} />
    <ActionButton label="Reset saved progress" secondary onPress={resetProgress} />
    <Text style={{ color: colors.textSecondary, textAlign: 'center', lineHeight: 21 }}>Math Games · {app.expo.version}{'\n'}Your profile and progress stay on this device.</Text>
    <ActionButton label="Done" onPress={onClose} />
  </>;
}
