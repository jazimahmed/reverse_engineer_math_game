import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { TopicConfig, TopicId } from '../constants/game';
import { AppScreen, PageHeader, SurfaceCard, ui, useTheme } from '../components/ui';
import { useSettingsStore } from '../store/settingsStore';

const topics: { id: TopicId; symbol: string; description: string }[] = [
  { id: 'addition', symbol: '+', description: 'Build your number sense' },
  { id: 'subtraction', symbol: '−', description: 'Find the difference' },
  { id: 'multiplication', symbol: '×', description: 'Master your tables' },
  { id: 'division', symbol: '÷', description: 'Share and solve' },
  { id: 'squareRoot', symbol: '√', description: 'Discover perfect squares' },
  { id: 'decimal', symbol: '0.1', description: 'Think beyond whole numbers' },
  { id: 'fraction', symbol: '½', description: 'Explore parts of a whole' },
  { id: 'games', symbol: '▦', description: 'Explore the puzzle collection' },
];

export function MainMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const colors = useTheme();
  const name = useSettingsStore((state) => state.profileName);
  return <AppScreen>
    <PageHeader title="Math, a little daily." subtitle={`Welcome back, ${name}.`}
      action={<TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" style={[ui.iconButton, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Settings')}>
        <Text style={{ color: colors.textPrimary, fontSize: 22 }}>⚙</Text>
      </TouchableOpacity>} />
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit profile" onPress={() => navigation.navigate('Profile')}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={[ui.iconButton, { backgroundColor: colors.backgroundAlt }]}><Text style={{ color: colors.fraction, fontWeight: '800', fontSize: 22 }}>{name.slice(0, 1).toUpperCase()}</Text></View>
      <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Your profile</Text>
      <Text style={{ color: colors.textSecondary }}>Edit →</Text>
    </TouchableOpacity>
    <SurfaceCard>
      <Text style={{ color: colors.fraction, fontWeight: '800', letterSpacing: 2, fontSize: 12 }}>YOUR DAILY BRAIN BREAK</Text>
      <Text style={[ui.title, { color: colors.textPrimary }]}>Small steps. Big progress.</Text>
      <Text style={[ui.subtitle, { color: colors.textSecondary }]}>Pick a topic, find your rhythm, and learn at your own pace.</Text>
    </SurfaceCard>
    <Text style={[ui.sectionTitle, { color: colors.textPrimary }]}>What will you explore?</Text>
    <View style={ui.grid}>
      {topics.map(({ id, symbol, description }) => <TouchableOpacity key={id} accessibilityRole="button" accessibilityLabel={TopicConfig[id].title}
        onPress={() => id === 'games' ? navigation.navigate('GamesHub') : navigation.navigate('TopicSelect', { topicId: id })}
        style={[ui.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={{ fontSize: 32, fontWeight: '700', color: colors[id] }}>{symbol}</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>{TopicConfig[id].title}</Text>
        <Text style={{ fontSize: 12, lineHeight: 18, color: colors.textSecondary }}>{description}</Text>
      </TouchableOpacity>)}
    </View>
  </AppScreen>;
}
