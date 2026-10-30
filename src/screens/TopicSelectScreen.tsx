import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { TopicConfig, TopicId } from '../constants/game';
import { AppScreen, PageHeader, ui, useTheme } from '../components/ui';
import { ModePresentation, TopicPresentation } from '../constants/topicPresentation';
import { useSettingsStore } from '../store/settingsStore';

export function TopicSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params: { topicId } } = useRoute<RouteProp<RootStackParamList, 'TopicSelect'>>();
  const colors = useTheme();
  const night = useSettingsStore((state) => state.night);
  const config = TopicConfig[topicId as TopicId];
  return <AppScreen>
    <PageHeader title={config?.title || 'Pick a game'} subtitle="How do you want to play? Tap a card!" onBack={() => navigation.goBack()} />
    <View style={ui.grid}>
      {config?.modes.map((modeId, index) => {
        const mode = ModePresentation[modeId];
        const tint = Object.values(TopicPresentation)[index % 7];
        return <TouchableOpacity key={modeId} accessibilityRole="button"
        accessibilityLabel={mode.label} accessibilityHint={mode.description}
        onPress={() => navigation.navigate('Game', { modeId, topicId })}
        style={[ui.tile, { backgroundColor: night ? tint.dark : tint.light, borderColor: colors.border }]}>
        <Text accessible={false} style={{ fontSize: 30, fontWeight: '800', color: colors.fraction }}>{mode.symbol}</Text>
        <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary }}>{mode.label}</Text>
        <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textSecondary }}>{mode.description}</Text>
        <Text style={{ color: colors.fraction, fontWeight: '800', marginTop: 'auto' }}>{modeId === 'learn' ? 'Start learning →' : 'Start game →'}</Text>
      </TouchableOpacity>;
      })}
    </View>
  </AppScreen>;
}
