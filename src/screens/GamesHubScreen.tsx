import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ActionButton, AppScreen, PageHeader, SurfaceCard, ui, useTheme } from '../components/ui';

const games = [
  { label: '2048', icon: '2048' }, { label: 'Fifteen', icon: '15' },
  { label: 'Puzzle', icon: '🧩' }, { label: 'Match', icon: '🃏' },
  { label: 'Sudoku', icon: '▦' }, { label: 'Mix', icon: '🎲' },
  { label: 'Memory', icon: '🧠' }, { label: 'Equations', icon: '=?' },
];

export function GamesHubScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useTheme();
  return <AppScreen>
    <PageHeader title="More games" subtitle="New puzzles are on the way!" onBack={() => navigation.goBack()} />
    <SurfaceCard>
      <Text style={{ color: colors.textPrimary, fontWeight: '800', fontSize: 22 }}>Coming soon 🌱</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 23 }}>These puzzles aren’t ready to play yet. You can play our number games now!</Text>
      <ActionButton label="Back to number games" onPress={() => navigation.popTo('Main')} />
    </SurfaceCard>
    <View style={ui.grid}>
      {games.map(({ label, icon }) => <TouchableOpacity key={label} disabled
        accessibilityRole="button" accessibilityLabel={`${label} — coming soon`} accessibilityState={{ disabled: true }}
        style={[ui.tile, { backgroundColor: colors.surfaceDark, borderColor: colors.border }]}>
        <Text accessible={false} style={{ fontSize: 30, fontWeight: '800', color: colors.fraction }}>{icon}</Text>
        <Text style={{ fontSize: 19, fontWeight: '700', color: colors.textPrimary }}>{label}</Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>Coming soon</Text>
      </TouchableOpacity>)}
    </View>
  </AppScreen>;
}
