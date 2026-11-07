import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { TopicConfig, TopicId } from '../constants/game';
import { AppScreen, PageHeader, ui, useTheme } from '../components/ui';
import { ModePresentation } from '../constants/topicPresentation';
import { useSettingsStore } from '../store/settingsStore';
import { PlayfulIcon } from '../components/PlayfulIcon';
import { PlayfulPalettes } from '../constants/playful';

export function TopicSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params: { topicId } } = useRoute<RouteProp<RootStackParamList, 'TopicSelect'>>();
  const colors = useTheme();
  const night = useSettingsStore((state) => state.night);
  const config = TopicConfig[topicId as TopicId];
  return <AppScreen>
    <PageHeader title={config?.title || 'Pick a game'} subtitle="Choose your challenge" onBack={() => navigation.goBack()} />
    <View style={ui.grid}>
      {config?.modes.map((modeId, index) => {
        const mode = ModePresentation[modeId];
        const tint = PlayfulPalettes[index % PlayfulPalettes.length];
        return <TouchableOpacity key={modeId} accessibilityRole="button"
        accessibilityLabel={mode.label} accessibilityHint={mode.description}
        onPress={() => navigation.navigate('Game', { modeId, topicId })}
        style={[ui.tile, { backgroundColor: night ? tint.darkFill : tint.fill, borderColor: tint.edge, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }]}>
        <PlayfulIcon name={mode.icon} size={80} />
        <Text style={{ fontSize: 19, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>{mode.shortLabel}</Text>
      </TouchableOpacity>;
      })}
    </View>
  </AppScreen>;
}
