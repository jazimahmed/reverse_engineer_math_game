import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { TopicConfig, TopicId } from '../constants/game';
import { ActionButton, AppScreen, PageHeader, ui, useTheme } from '../components/ui';
import { useSettingsStore } from '../store/settingsStore';
import { TopicPresentation } from '../constants/topicPresentation';

const topics = Object.keys(TopicPresentation) as TopicId[];

export function MainMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useTheme();
  const name = useSettingsStore((state) => state.profileName);
  const night = useSettingsStore((state) => state.night);
  return <AppScreen>
    <PageHeader title={`Hi, ${name}!`} subtitle="Let’s play with numbers!"
      action={<TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" style={[ui.iconButton, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Settings')}>
        <Text style={{ color: colors.textPrimary, fontSize: 22 }}>⚙</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Settings</Text>
      </TouchableOpacity>} />
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit profile" onPress={() => navigation.navigate('Profile')}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={[ui.iconButton, { backgroundColor: colors.backgroundAlt }]}><Text style={{ color: colors.fraction, fontWeight: '800', fontSize: 22 }}>{name.slice(0, 1).toUpperCase()}</Text></View>
      <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>My name</Text>
      <Text style={{ color: colors.textSecondary }}>Change →</Text>
    </TouchableOpacity>
    <View style={[ui.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
      <Text accessible={false} style={{ fontSize: 32 }}>🌟 + 🌟 = ?</Text>
      <Text style={[ui.title, { color: colors.textPrimary }]}>Ready, set, add!</Text>
      <Text style={[ui.subtitle, { color: colors.textSecondary }]}>New here? Start with adding. You can learn first or jump into a game.</Text>
      <ActionButton label="Start here: Addition →" onPress={() => navigation.navigate('TopicSelect', { topicId: 'addition' })} />
    </View>
    <Text style={[ui.sectionTitle, { color: colors.textPrimary }]}>Pick a game 👇</Text>
    <View style={ui.grid}>
      {topics.map((id) => {
        const { label, symbol, description, light, dark } = TopicPresentation[id];
        return <TouchableOpacity key={id} accessibilityRole="button" accessibilityLabel={TopicConfig[id].title}
        accessibilityHint={id === 'games' ? 'See upcoming games' : `Choose how to play ${TopicConfig[id].title}`}
        onPress={() => id === 'games' ? navigation.navigate('GamesHub') : navigation.navigate('TopicSelect', { topicId: id })}
        style={[ui.tile, { backgroundColor: night ? dark : light, borderColor: colors[id] }]}>
        <Text accessible={false} style={{ fontSize: 38, fontWeight: '800', color: colors[id] }}>{symbol}</Text>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>{label}</Text>
        <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textSecondary }}>{description}</Text>
        <Text style={{ fontSize: 14, fontWeight: '800', color: colors[id], marginTop: 'auto' }}>{id === 'games' ? 'Take a look →' : 'Let’s play →'}</Text>
      </TouchableOpacity>;
      })}
    </View>
  </AppScreen>;
}
