import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ActionButton, AppScreen, PageHeader, ui, useTheme } from '../components/ui';
import { PlayfulIcon } from '../components/PlayfulIcon';
import { PlayfulPalettes } from '../constants/playful';
import { useSettingsStore } from '../store/settingsStore';

const games = [
  { label: '2048', icon: '2048' }, { label: 'Fifteen', icon: 'fifteen' },
  { label: 'Puzzle', icon: 'puzzle' }, { label: 'Match', icon: 'memory' },
  { label: 'Sudoku', icon: 'sudoku' }, { label: 'Mix', icon: 'mix' },
  { label: 'Memory', icon: 'memory' }, { label: 'Equations', icon: 'quiz' },
] as const;

export function GamesHubScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useTheme();
  const night = useSettingsStore((state) => state.night);
  return <AppScreen>
    <PageHeader title="More games" subtitle="Coming soon!" onBack={() => navigation.goBack()} />
    <ActionButton label="Back to number games" icon="back" onPress={() => navigation.popTo('Main')} />
    <View style={ui.grid}>
      {games.map(({ label, icon }, index) => {
        const tint = PlayfulPalettes[index % PlayfulPalettes.length];
        return <TouchableOpacity key={label} disabled
        accessibilityRole="button" accessibilityLabel={`${label} — coming soon`} accessibilityState={{ disabled: true }}
        accessibilityHint="This game is not ready to play yet"
        style={[ui.tile, { backgroundColor: night ? tint.darkFill : tint.fill, borderColor: tint.edge, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }]}>
        <PlayfulIcon name={icon} size={72} />
        <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>{label}</Text>
        <View style={{ borderRadius: 12, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>Soon</Text>
        </View>
      </TouchableOpacity>;
      })}
    </View>
  </AppScreen>;
}
