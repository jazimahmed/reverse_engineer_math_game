import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { TopicConfig, TopicId } from '../constants/game';
import { ActionButton, AppScreen, PageHeader, ui, useTheme } from '../components/ui';
import { useSettingsStore } from '../store/settingsStore';
import { TopicPresentation } from '../constants/topicPresentation';
import { PlayfulIcon } from '../components/PlayfulIcon';
import { PlayfulPalettes } from '../constants/playful';

const topics = Object.keys(TopicPresentation) as TopicId[];

export function MainMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useTheme();
  const name = useSettingsStore((state) => state.profileName);
  const night = useSettingsStore((state) => state.night);
  return <AppScreen>
    <PageHeader title={`Hi, ${name}!`}
      action={<TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" style={[ui.iconButton, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Settings')}>
        <PlayfulIcon name="settings" size={30} />
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Settings</Text>
      </TouchableOpacity>} />
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit profile" onPress={() => navigation.navigate('Profile')}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <PlayfulIcon name="profile" size={36} />
      <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>My profile →</Text>
    </TouchableOpacity>
    <View style={[ui.card, { backgroundColor: night ? PlayfulPalettes[0].darkFill : PlayfulPalettes[0].fill, borderColor: PlayfulPalettes[0].edge, borderBottomWidth: 5 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <PlayfulIcon name="star" size={88} />
        <View style={{ flex: 1, minWidth: 120, gap: 4 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '800', letterSpacing: 1 }}>LET’S PLAY!</Text>
          <Text style={[ui.title, { color: colors.textPrimary }]}>Ready, set, add!</Text>
        </View>
      </View>
      <ActionButton label="Start here: Addition →" icon="addition" onPress={() => navigation.navigate('TopicSelect', { topicId: 'addition' })} />
    </View>
    <Text accessibilityRole="header" style={[ui.sectionTitle, { color: colors.textPrimary }]}>Pick your adventure</Text>
    <View style={ui.grid}>
      {topics.map((id, index) => {
        const { label, description } = TopicPresentation[id];
        const tint = PlayfulPalettes[index % PlayfulPalettes.length];
        return <TouchableOpacity key={id} accessibilityRole="button" accessibilityLabel={TopicConfig[id].title}
        accessibilityHint={id === 'games' ? 'See upcoming games' : `${description}. Choose how to play ${TopicConfig[id].title}`}
        onPress={() => id === 'games' ? navigation.navigate('GamesHub') : navigation.navigate('TopicSelect', { topicId: id })}
        style={[ui.tile, { backgroundColor: night ? tint.darkFill : tint.fill, borderColor: tint.edge, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }]}>
        <PlayfulIcon name={id} size={80} />
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' }}>{label}</Text>
      </TouchableOpacity>;
      })}
    </View>
  </AppScreen>;
}
